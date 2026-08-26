# ==========================================================
# Premiere File Browser — Online 1-Liner Windows Installer
# ==========================================================

$ErrorActionPreference = "Stop"
Write-Host ">>> Downloading & Installing Premiere File Browser..." -ForegroundColor Cyan

# 1. Enable Registry Debug Mode
$csxsVersions = @("9", "10", "11", "12", "13", "14", "15", "16")
foreach ($v in $csxsVersions) {
    $regPath = "HKCU:\Software\Adobe\CSXS.$v"
    if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Type String -Force
}

# 2. Download latest ZIP from GitHub
$zipUrl = "https://github.com/Viera022/premiere-file-browser/archive/refs/heads/main.zip"
$tempZip = Join-Path $env:TEMP "premiere-file-browser.zip"
$tempExtract = Join-Path $env:TEMP "premiere-file-browser-extract"

Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip

if (Test-Path $tempExtract) { Remove-Item -Path $tempExtract -Recurse -Force }
Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

# 3. Copy to Extension Directory
$targetDir = "$env:APPDATA\Adobe\CEP\extensions\com.antigravity.filebrowser"
if (Test-Path $targetDir) { Remove-Item -Path $targetDir -Recurse -Force }
New-Item -Path $targetDir -ItemType Directory -Force | Out-Null

$srcRoot = Join-Path $tempExtract "premiere-file-browser-main"
$itemsToCopy = @("CSXS", "jsx", "dist", "public", ".debug", "package.json")
foreach ($item in $itemsToCopy) {
    $src = Join-Path $srcRoot $item
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $targetDir $item) -Recurse -Force
    }
}

# Cleanup
Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue
Remove-Item -Path $tempExtract -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✓ Premiere File Browser Installed Successfully!" -ForegroundColor Green
Write-Host "Open Premiere Pro -> Window -> Extensions -> 'Premiere File Browser'" -ForegroundColor Cyan
