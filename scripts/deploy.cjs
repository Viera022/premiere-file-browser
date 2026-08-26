const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetExtensionDir = 'C:\\\\Users\\\\viera\\\\AppData\\\\Roaming\\\\Adobe\\\\CEP\\\\extensions\\\\com.antigravity.filebrowser';
const sourceDir = path.resolve(__dirname, '..');

console.log('=== Deploying Premiere File Browser to CEP Extensions ===');
console.log('Source:', sourceDir);
console.log('Target:', targetExtensionDir);

// Ensure CEP extensions root exists
const cepRoot = 'C:\\\\Users\\\\viera\\\\AppData\\\\Roaming\\\\Adobe\\\\CEP\\\\extensions';
if (!fs.existsSync(cepRoot)) {
  fs.mkdirSync(cepRoot, { recursive: true });
}

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

// 1. Ensure target directory exists
if (!fs.existsSync(targetExtensionDir)) {
  fs.mkdirSync(targetExtensionDir, { recursive: true });
}

// 2. Copy CSXS, jsx, dist, public, .debug, package.json
['CSXS', 'jsx', 'dist', 'public', '.debug', 'package.json'].forEach(item => {
  const src = path.join(sourceDir, item);
  const dest = path.join(targetExtensionDir, item);
  copyRecursive(src, dest);
  console.log(`[SYNC] ${item} -> ${dest}`);
});

// 3. Ensure CSInterface.js exists inside dist for relative runtime loads
const csInterfaceSrc = path.join(sourceDir, 'public', 'CSInterface.js');
if (fs.existsSync(csInterfaceSrc)) {
  fs.copyFileSync(csInterfaceSrc, path.join(targetExtensionDir, 'dist', 'CSInterface.js'));
  fs.copyFileSync(csInterfaceSrc, path.join(targetExtensionDir, 'CSInterface.js'));
}

console.log('=== Deployment Successful! ===');
console.log('Extension registered as "Premiere File Browser" (com.antigravity.filebrowser)');
