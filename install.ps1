# ==========================================================
# Premiere File Browser — Windows 1-Click Automated Installer
# ==========================================================

$ErrorActionPreference = "Stop"
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Installing Premiere File Browser for Premiere Pro  " -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Enable Adobe CEP PlayerDebugMode in Windows Registry
Write-Host "[1/4] Enabling CEP PlayerDebugMode in Registry..." -ForegroundColor Yellow
$csxsVersions = @("9", "10", "11", "12", "13", "14", "15", "16")
foreach ($v in $csxsVersions) {
    $regPath = "HKCU:\Software\Adobe\CSXS.$v"
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Type String -Force
}
Write-Host "  ✓ Registry debug flags set (CSXS 9-16)." -ForegroundColor Green

# 2. Prepare Destination Extension Directory
$targetDir = "$env:APPDATA\Adobe\CEP\extensions\com.antigravity.filebrowser"
Write-Host "[2/4] Preparing target directory: $targetDir" -ForegroundColor Yellow
if (Test-Path $targetDir) {
    Remove-Item -Path $targetDir -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -Path $targetDir -ItemType Directory -Force | Out-Null

# 3. Copy Extension Files
Write-Host "[3/4] Copying extension bundle..." -ForegroundColor Yellow
$sourceDir = $PSScriptRoot
$itemsToCopy = @("CSXS", "jsx", "dist", "public", ".debug", "package.json")
foreach ($item in $itemsToCopy) {
    $src = Join-Path $sourceDir $item
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $targetDir $item) -Recurse -Force
    }
}
Write-Host "  ✓ Extension files copied successfully." -ForegroundColor Green

# 4. Clear CEF Cache
Write-Host "[4/4] Clearing CEF cache..." -ForegroundColor Yellow
$cachePath = "$env:LOCALAPPDATA\Temp\cep_cache\PPRO_com.antigravity.filebrowser"
if (Test-Path $cachePath) {
    Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  ✓ Installation Complete!                           " -ForegroundColor Green
Write-Host "  Open Premiere Pro -> Window -> Extensions          " -ForegroundColor White
Write-Host "  -> 'Premiere File Browser'                         " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Green
