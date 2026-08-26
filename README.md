# ⚡ Premiere File Browser

<p align="center">
  <img src="https://img.shields.io/badge/Adobe_Premiere_Pro-2021--2026+-9999FF?style=for-the-badge&logo=adobe-premiere-pro&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-Windows_%7C_macOS-0078D6?style=for-the-badge&logo=apple&logoColor=white" />
  <img src="https://img.shields.io/badge/UI-Modern_Glassmorphism-111111?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Performance-60_FPS_Hardware_Accelerated-34D399?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" />
</p>

<p align="center">
  <b>The ultra-fast, native media explorer & QuickLook panel built for Adobe Premiere Pro.</b><br/>
  Browse thousands of audio, video, SFX, MOGRTs, and fonts at 60 FPS without ever slowing down your timeline.
</p>

---

## ✨ Key Features

- **🌊 Real-time Audio Waveforms**: Dynamic soundwave visualizer with instant hover previews and timeline insertion.
- **🎬 60 FPS Hover Video Scrubbing**: Scrub video frames with millisecond precision directly on thumbnail cards with a floating timecode badge.
- **🗂️ Universal Storage**:
  - Automatically separates and organizes physical drives (`C:`, `D:`, `/Volumes/`) and cloud storage (**Google Drive**, **OneDrive**, **Dropbox**, **iCloud Drive**).
- **🌍 5 Native Languages**: Full internationalization with pixel-perfect vector SVG flags:
  - 🇧🇷 Português (BR)
  - 🇺🇸 English
  - 🇪🇸 Español
  - 🇨🇳 中文 (简体)
  - 🇮🇳 हिन्दी
- **⚡ Turbo Keyboard Navigation**:
  - `Space`: Instant macOS-style **QuickLook** preview modal.
  - `Enter`: Insert selected media directly onto the timeline playhead.
  - `Alt + ←` / `Cmd + ↑`: Return to parent folder.
  - `Arrows`: Smooth grid and list navigation.
- **🏷️ Color Labels**: Tint folders and assets with vivid color dots (Apple Finder style) for instantaneous visual organization.
- **🚀 Virtualized Progressive Rendering**: Open folders with **8,000+ files** in under **15ms** with zero RAM/CPU freeze.
- **🎮 Hardware Decoding Toggle**: Dedicated GPU acceleration switch (NVDEC / D3D11 / Metal) for ultra-smooth playback.

---

## 📦 Installation Guide

### ⚡ Method 1: Instant 1-Line Install (Recommended)

No need to clone or install Node.js! Open your terminal and paste the command below:

#### 🪟 Windows (PowerShell):
```powershell
irm https://raw.githubusercontent.com/Viera022/premiere-file-browser/main/install-web.ps1 | iex
```

#### 🍎 macOS (Terminal):
```bash
curl -fsSL https://raw.githubusercontent.com/Viera022/premiere-file-browser/main/install-web.sh | bash
```

---

### 📥 Method 2: Manual Download (From ZIP)

1. Click the green **`Code`** button above -> **`Download ZIP`** (or download the latest Release).
2. Extract the `.zip` archive to any folder.
3. Run the installer:
   - **Windows**: Right-click `install.ps1` and choose **Run with PowerShell** (or run `powershell -ExecutionPolicy Bypass -File install.ps1`).
   - **macOS**: Open Terminal in the extracted folder and run `chmod +x install.sh && ./install.sh`.
4. Open Premiere Pro -> Go to **Window > Extensions > Premiere File Browser** (in Portuguese: *Janela > Extensões > Premiere File Browser*).

---

### 🤖 Method 3: Autonomous AI Agent / Developer Install

If you are an AI coding assistant (Antigravity, Claude Code, Cursor, Copilot) or a developer building from source:

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

| Shortcut (Windows) | Shortcut (macOS) | Action |
|---|---|---|
| `Space` | `Space` | QuickLook Instant Preview Modal |
| `Enter` | `Return` | Insert Selected File to Timeline |
| `Alt + ←` / `Backspace` | `Cmd + ↑` / `Delete` | Navigate Up to Parent Folder |
| `↑ ↓ ← →` | `↑ ↓ ← →` | Select Next / Previous File |
| `F5` | `Cmd + R` | Refresh Directory |

---

## 🛠️ How to Open in Adobe Premiere Pro

1. Launch Adobe Premiere Pro.
2. In the top menu bar, click on **Window** > **Extensions** > **Premiere File Browser** (in Portuguese: *Janela* > *Extensões* > *Premiere File Browser*).
3. Dock the panel anywhere in your workspace (e.g., next to your Project Bin or Effect Controls).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <img src="https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif" width="64" height="64" alt="Nyan Cat" /><br/>
  <sub><i>Crafted with precision for video editors worldwide.</i></sub>
</p>
