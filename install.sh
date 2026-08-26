#!/usr/bin/env bash
# ==========================================================
# Premiere File Browser — macOS 1-Click Automated Installer
# ==========================================================

set -e

echo "===================================================="
echo "  Installing Premiere File Browser for Premiere Pro  "
echo "  macOS (Apple Silicon & Intel)                      "
echo "===================================================="

# 1. Enable Adobe CEP PlayerDebugMode in macOS Defaults
echo "[1/4] Enabling CEP PlayerDebugMode in macOS preferences..."
for v in {9..16}; do
  defaults write com.adobe.CSXS.$v PlayerDebugMode 1 2>/dev/null || true
done
echo "  ✓ PlayerDebugMode enabled."

# 2. Target Directory
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.antigravity.filebrowser"
echo "[2/4] Preparing target directory: $TARGET_DIR"
mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR"/*

# 3. Copy Extension Files
echo "[3/4] Copying extension bundle..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$SCRIPT_DIR/CSXS" "$TARGET_DIR/"
cp -R "$SCRIPT_DIR/jsx" "$TARGET_DIR/"
cp -R "$SCRIPT_DIR/dist" "$TARGET_DIR/"
cp -R "$SCRIPT_DIR/public" "$TARGET_DIR/"
cp "$SCRIPT_DIR/.debug" "$TARGET_DIR/" 2>/dev/null || true
cp "$SCRIPT_DIR/package.json" "$TARGET_DIR/" 2>/dev/null || true

echo "  ✓ Extension files copied."

# 4. Optional FFmpeg check
if command -v ffmpeg >/dev/null 2>&1; then
  echo "  ✓ FFmpeg detected."
else
  echo "  ℹ Tip: To enable high-resolution video thumbnails, run: brew install ffmpeg"
fi

echo ""
echo "===================================================="
echo "  ✓ Installation Complete!                           "
echo "  Open Premiere Pro -> Window -> Extensions          "
echo "  -> 'Premiere File Browser'                         "
echo "===================================================="
