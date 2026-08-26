# ⚡ Premiere File Browser

<p align="center">
  <img src="https://img.shields.io/badge/Adobe_Premiere_Pro-2021--2026+-9999FF?style=for-the-badge&logo=adobe-premiere-pro&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-Windows_%7C_macOS-0078D6?style=for-the-badge&logo=apple&logoColor=white" />
  <img src="https://img.shields.io/badge/UI-Apple_Liquid_Glass-111111?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Performance-60_FPS_Hardware_Accelerated-34D399?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" />
</p>

<p align="center">
  <b>The ultra-fast, native media explorer & QuickLook panel built for Adobe Premiere Pro.</b><br/>
  Browse thousands of audio, video, SFX, MOGRTs, and fonts at 60 FPS without ever slowing down your timeline.
</p>

---

## ✨ Features

- **🌊 Real-time Audio Waveforms**: Dynamic soundwave visualizer with instant hover previews and timeline insertion.
- **🎬 60 FPS Hover Video Scrubbing**: Scrub video frames with millisecond precision directly on thumbnail cards with a floating timecode badge.
- **🗂️ Universal Disk & Cloud Storage**:
  - Automatically identifies local drives (`C:`, `D:`, `/Volumes/`) and cloud storage (**Google Drive**, **OneDrive**, **Dropbox**, **iCloud Drive**).
- **🌍 5 Native Languages**: Full internationalization with pixel-perfect vector SVG flags:
  - 🇧🇷 Português (BR)
  - 🇺🇸 English
  - 🇪🇸 Español
  - 🇨🇳 中文 (简体)
  - 🇮🇳 हिन्दी
- **⚡ Turbo Keyboard Navigation**:
  - `Space`: Instant macOS-style **QuickLook** preview.
  - `Enter`: Insert selected media directly onto the timeline playhead.
  - `Alt + ←` / `Cmd + ↑`: Return to parent folder.
  - `Arrows`: Smooth grid and list navigation.
- **🏷️ Color Labels**: Tint folders and assets with vivid color dots (Apple Finder style) for instantaneous visual organization.
- **🚀 Virtualized Progressive Rendering**: Open folders with **8,000+ files** in under **15ms** with zero RAM/CPU freeze.
- **🎮 Hardware Decoding Toggle**: Dedicated GPU acceleration switch (NVDEC / D3D11 / Metal) for ultra-smooth playback.

---

## 📦 Installation Guide

### 🚀 Automated 1-Click Installation

#### 🪟 Windows:
Open PowerShell as Administrator (or standard user) and run:
```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

#### 🍎 macOS (Apple Silicon M1-M4 & Intel):
Open Terminal in the repository directory and run:
```bash
chmod +x install.sh
./install.sh
```

---

### 🤖 Autonomous AI Agent Installation Command (One-Liner)

If you are an AI coding assistant (Antigravity, Claude Code, Cursor, Copilot), run this command to build and deploy autonomously:

**Windows**:
```powershell
npm install; npm run build; powershell -ExecutionPolicy Bypass -File install.ps1
```

**macOS**:
```bash
npm install && npm run build && ./install.sh
```

---

## 🎥 FFmpeg Video Thumbnails (Recommended)

To enable high-speed background video thumbnail extraction:

- **Windows**:
  ```powershell
  winget install Gyan.FFmpeg --silent --accept-package-agreements
  ```
- **macOS**:
  ```bash
  brew install ffmpeg
  ```

*(Note: The extension works seamlessly even without FFmpeg using fallback decoders).*

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut (Win) | Shortcut (Mac) | Action |
|---|---|---|
| `Space` | `Space` | QuickLook Instant Preview Modal |
| `Enter` | `Return` | Insert Selected File to Timeline |
| `Alt + ←` / `Backspace` | `Cmd + ↑` / `Delete` | Navigate Up to Parent Folder |
| `↑ ↓ ← →` | `↑ ↓ ← →` | Select Next / Previous File |
| `F5` | `Cmd + R` | Refresh Directory |

---

## 🛠️ Development & Building

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (Hot reload)
npm run dev

# 3. Production Build & Deploy to CEP Extensions
npm run build
npm run deploy
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <img src="https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif" width="64" height="64" alt="Nyan Cat" /><br/>
  <sub><i>Crafted with precision for video editors worldwide.</i></sub>
</p>
