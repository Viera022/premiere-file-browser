const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const sourceDir = path.resolve(__dirname, '..');
const releaseDir = path.join(sourceDir, 'releases');

console.log('=== Packaging Premiere File Browser Release ===');
console.log('Source:', sourceDir);

// 1. Ensure releases directory exists
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const zip = new JSZip();

// Helper to recursively add items to zip
function addFileToZip(zipObj, filePath, archivePath) {
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    const folderName = path.basename(filePath);
    const items = fs.readdirSync(filePath);
    items.forEach(child => {
      addFileToZip(zipObj, path.join(filePath, child), archivePath ? `${archivePath}/${child}` : child);
    });
  } else {
    zipObj.file(archivePath, fs.readFileSync(filePath));
  }
}

// 2. Add bundle files (same list as deploy.cjs + installation scripts)
const itemsToBundle = [
  { name: 'CSXS', dest: 'CSXS' },
  { name: 'jsx', dest: 'jsx' },
  { name: 'dist', dest: 'dist' },
  { name: 'public', dest: 'public' },
  { name: '.debug', dest: '.debug' },
  { name: 'package.json', dest: 'package.json' },
  { name: 'install.ps1', dest: 'install.ps1' },
  { name: 'install.sh', dest: 'install.sh' }
];

itemsToBundle.forEach(item => {
  const fullPath = path.join(sourceDir, item.name);
  if (fs.existsSync(fullPath)) {
    console.log(`[PACKAGING] Adding ${item.name}...`);
    addFileToZip(zip, fullPath, item.dest);
  } else {
    console.warn(`[WARNING] Skip missing file: ${item.name}`);
  }
});

// 3. Generate Zip & ZXP archives
zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .then(buffer => {
    const zipName = 'com.antigravity.filebrowser.zip';
    const zxpName = 'com.antigravity.filebrowser.zxp';
    
    const zipPath = path.join(releaseDir, zipName);
    const zxpPath = path.join(releaseDir, zxpName);

    fs.writeFileSync(zipPath, buffer);
    fs.writeFileSync(zxpPath, buffer);

    console.log('\n=== Release Packaged Successfully! ===');
    console.log(`Zip Archive: ${zipPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`ZXP Archive: ${zxpPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    console.log('You can now upload these files to your GitHub Release assets, Sir!');
  })
  .catch(err => {
    console.error('[ERROR] Failed to generate zip archive:', err);
    process.exit(1);
  });
