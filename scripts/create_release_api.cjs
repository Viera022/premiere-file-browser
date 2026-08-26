const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '..');
const secretsPath = 'D:\\Antigravity-Workspace\\Obsidian Vault\\secrets.md';

console.log('=== Initiating Automated GitHub Release via API ===');

// 1. Retrieve token from Obsidian secrets file
if (!fs.existsSync(secretsPath)) {
  console.error('[ERROR] Secrets file not found in Obsidian Vault at:', secretsPath);
  process.exit(1);
}

const secretsContent = fs.readFileSync(secretsPath, 'utf8');
const tokenMatch = secretsContent.match(/ghp_[a-zA-Z0-9]{36}/);
if (!tokenMatch) {
  console.error('[ERROR] No valid GitHub Personal Access Token found in secrets.md!');
  process.exit(1);
}
const token = tokenMatch[0];
console.log('✓ Successfully retrieved GitHub API token from Obsidian Vault.');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'));
const version = `v${packageJson.version}`;
console.log(`Target Release Version: ${version}`);

// Verify build assets exist
const zipPath = path.join(sourceDir, 'releases', 'com.antigravity.filebrowser.zip');
const zxpPath = path.join(sourceDir, 'releases', 'com.antigravity.filebrowser.zxp');

if (!fs.existsSync(zipPath) || !fs.existsSync(zxpPath)) {
  console.log('Release assets not found. Building and packaging project first...');
  try {
    execSync('npm run build', { cwd: sourceDir, stdio: 'inherit' });
    execSync('npm run package', { cwd: sourceDir, stdio: 'inherit' });
  } catch (e) {
    console.error('[ERROR] Failed to compile or package extension:', e.message);
    process.exit(1);
  }
}

// Helper to make HTTPS requests to GitHub API
function githubRequest(options, requestBody = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Authorization': `token ${token}`,
      'User-Agent': 'Premiere-File-Browser-Release-Agent',
      'Accept': 'application/vnd.github.v3+json'
    };

    options.headers = { ...defaultHeaders, ...options.headers };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (requestBody) {
      if (Buffer.isBuffer(requestBody)) {
        req.write(requestBody);
      } else {
        req.write(JSON.stringify(requestBody));
      }
    }
    req.end();
  });
}

async function run() {
  try {
    // 2. Configure Git Remote URL with token to push
    console.log('Configuring git credentials temporarily...');
    const remoteUrl = `https://Viera022:${token}@github.com/Viera022/premiere-file-browser.git`;
    
    // Check if tag already exists locally, if not create it
    try {
      execSync(`git tag ${version}`, { stdio: 'ignore' });
      console.log(`✓ Tag ${version} created locally.`);
    } catch {
      console.log(`Tag ${version} already exists locally.`);
    }

    console.log('Pushing local commits to remote repository...');
    execSync(`git push "${remoteUrl}" main`, { stdio: 'inherit' });
    
    console.log('Pushing tag to remote repository...');
    execSync(`git push "${remoteUrl}" ${version}`, { stdio: 'inherit' });
    console.log('✓ Git push completed.');

    // 3. Create GitHub Release via API
    console.log('Creating GitHub Release...');
    const releaseOptions = {
      hostname: 'api.github.com',
      path: '/repos/Viera022/premiere-file-browser/releases',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    const releaseBody = {
      tag_name: version,
      target_commitish: 'main',
      name: version,
      body: `### Release ${version}\n- Automatically compiled and packaged CEP extension bundle.\n- Supported on Premiere Pro v15.0 to v26.0+.\n- Features localized interface and offline thumbnail/hover scrubbing caching.`,
      draft: false,
      prerelease: false
    };

    const releaseRes = await githubRequest(releaseOptions, releaseBody);
    if (releaseRes.statusCode !== 201) {
      console.error('[ERROR] Failed to create release. API response:', releaseRes.body);
      process.exit(1);
    }

    const releaseData = JSON.parse(releaseRes.body);
    const releaseId = releaseData.id;
    console.log(`✓ Release created successfully! ID: ${releaseId}`);

    // 4. Upload Assets
    const uploadBaseUrl = releaseData.upload_url.replace(/\{.*?\}$/, ''); // Strip parameters
    const uploadUrlParsed = new URL(uploadBaseUrl);

    const assetsToUpload = [
      { name: 'com.antigravity.filebrowser.zip', path: zipPath, type: 'application/zip' },
      { name: 'com.antigravity.filebrowser.zxp', path: zxpPath, type: 'application/octet-stream' }
    ];

    for (const asset of assetsToUpload) {
      console.log(`Uploading ${asset.name} (${(fs.statSync(asset.path).size / 1024 / 1024).toFixed(2)} MB)...`);
      const fileBuffer = fs.readFileSync(asset.path);
      
      const uploadOptions = {
        hostname: uploadUrlParsed.hostname,
        path: `${uploadUrlParsed.pathname}?name=${asset.name}`,
        method: 'POST',
        headers: {
          'Content-Type': asset.type,
          'Content-Length': fileBuffer.length
        }
      };

      const uploadRes = await githubRequest(uploadOptions, fileBuffer);
      if (uploadRes.statusCode === 201) {
        console.log(`✓ Uploaded ${asset.name} successfully.`);
      } else {
        console.error(`[ERROR] Failed to upload ${asset.name}. Response:`, uploadRes.body);
      }
    }

    console.log('\n=== Automated Release Pipeline Completed Successfully! ===');
    console.log(`View your release at: https://github.com/Viera022/premiere-file-browser/releases/tag/${version}`);
  } catch (err) {
    console.error('[ERROR] Release process failed:', err);
    process.exit(1);
  }
}

run();
