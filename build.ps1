# 遇到錯誤就停止，不要繼續產生壞檔案
$ErrorActionPreference = "Stop"

# 取得 build.ps1 所在的資料夾，作為專案根目錄
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 設定主要資料夾路徑
$behaviorPack = Join-Path $root "behavior_pack"
$resourcePack = Join-Path $root "resource_pack"
$dist = Join-Path $root "dist"

# 設定輸出檔案路徑
$bpZip = Join-Path $dist "ChemistryPlus_BP.zip"
$rpZip = Join-Path $dist "ChemistryPlus_RP.zip"
$bpPack = Join-Path $dist "ChemistryPlus_BP.mcpack"
$rpPack = Join-Path $dist "ChemistryPlus_RP.mcpack"
$addonZip = Join-Path $dist "ChemistryPlus.zip"
$addon = Join-Path $dist "ChemistryPlus.mcaddon"

# 檢查 behavior_pack 是否存在
if (!(Test-Path $behaviorPack)) {
  throw "Missing behavior_pack folder"
}

# 檢查 resource_pack 是否存在
if (!(Test-Path $resourcePack)) {
  throw "Missing resource_pack folder"
}

# 建立 dist 資料夾，用來放打包結果
New-Item -ItemType Directory -Force -Path $dist | Out-Null

# 刪除舊的打包檔案，避免使用到舊版本
foreach ($path in @($bpZip, $rpZip, $bpPack, $rpPack, $addonZip, $addon)) {
  if (Test-Path $path) {
    Remove-Item $path -Force
  }
}

# 將 behavior_pack 內容壓縮成 zip
Compress-Archive -Path (Join-Path $behaviorPack "*") -DestinationPath $bpZip

# 將 zip 改名成 mcpack
Move-Item $bpZip $bpPack

# 將 resource_pack 內容壓縮成 zip
Compress-Archive -Path (Join-Path $resourcePack "*") -DestinationPath $rpZip

# 將 zip 改名成 mcpack
Move-Item $rpZip $rpPack

# 將 BP.mcpack 和 RP.mcpack 合併壓縮成 zip
Compress-Archive -Path $bpPack, $rpPack -DestinationPath $addonZip

# 將 zip 改名成 mcaddon
Move-Item $addonZip $addon

# 顯示完成訊息
Write-Host "Build complete"
Write-Host $addon