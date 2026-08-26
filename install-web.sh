#!/usr/bin/env bash
# ==========================================================
# Premiere File Browser — Online 1-Liner macOS Installer
# ==========================================================

set -e

echo ">>> Downloading & Installing Premiere File Browser on macOS..."

# 1. Enable PlayerDebugMode
for v in {9..16}; do
  defaults write com.adobe.CSXS.$v PlayerDebugMode 1 2>/dev/null || true
done

# 2. Download and extract
TEMP_DIR="$(mktemp -d)"
curl -fsSL https://github.com/Viera022/premiere-file-browser/archive/refs/heads/main.zip -o "$TEMP_DIR/bundle.zip"
unzip -q "$TEMP_DIR/bundle.zip" -d "$TEMP_DIR"

# 3. Copy to Extension folder
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.antigravity.filebrowser"
mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR"/*

SRC="$TEMP_DIR/premiere-file-browser-main"
cp -R "$SRC/CSXS" "$TARGET_DIR/"
cp -R "$SRC/jsx" "$TARGET_DIR/"
cp -R "$SRC/dist" "$TARGET_DIR/"
cp -R "$SRC/public" "$TARGET_DIR/"
cp "$SRC/.debug" "$TARGET_DIR/" 2>/dev/null || true
cp "$SRC/package.json" "$TARGET_DIR/" 2>/dev/null || true

rm -rf "$TEMP_DIR"

echo "✓ Premiere File Browser Installed Successfully!"
echo "Open Premiere Pro -> Window -> Extensions -> 'Premiere File Browser'"
