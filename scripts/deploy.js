const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetExtensionDir = 'C:\\Users\\viera\\AppData\\Roaming\\Adobe\\CEP\\extensions\\com.antigravity.filebrowser';
const sourceDir = path.resolve(__dirname, '..');

console.log('--- Deploying Premiere File Browser to CEP Extensions ---');
console.log('Source:', sourceDir);
console.log('Target:', targetExtensionDir);

// Ensure CEP directory exists
const cepRoot = 'C:\\Users\\viera\\AppData\\Roaming\\Adobe\\CEP\\extensions';
if (!fs.existsSync(cepRoot)) {
  fs.mkdirSync(cepRoot, { recursive: true });
}

// Copy essential CEP files and dist
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Build project first
console.log('Building Vite bundle...');
execSync('npm run build', { cwd: sourceDir, stdio: 'inherit' });

// 2. Clear target or sync
if (fs.existsSync(targetExtensionDir)) {
  console.log('Updating existing installation...');
} else {
  fs.mkdirSync(targetExtensionDir, { recursive: true });
}

// Copy CSXS, jsx, dist, public, .debug, package.json
['CSXS', 'jsx', 'dist', 'public', '.debug', 'package.json'].forEach(item => {
  const src = path.join(sourceDir, item);
  const dest = path.join(targetExtensionDir, item);
  copyRecursive(src, dest);
  console.log(`Copied: ${item} -> ${dest}`);
});

// Copy CSInterface.js to dist as well for safety
if (fs.existsSync(path.join(sourceDir, 'public', 'CSInterface.js'))) {
  fs.copyFileSync(
    path.join(sourceDir, 'public', 'CSInterface.js'),
    path.join(targetExtensionDir, 'dist', 'CSInterface.js')
  );
}

console.log('Deploy complete! The extension is now available in Premiere Pro under Window > Extensions > Premiere File Browser');
