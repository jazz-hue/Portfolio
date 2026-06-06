# sync-and-push.ps1
# 把当前 web 目录同步到 git 工作副本，然后 commit + push 到 GitHub
# 用法：右键 → 用 PowerShell 运行    或    在 powershell 里 .\sync-and-push.ps1

$ErrorActionPreference = 'Continue'

$git    = 'D:\ruan jian\Git\cmd\git.exe'
$src    = $PSScriptRoot                              # 当前脚本所在的 web 文件夹
$dest   = "$env:USERPROFILE\portfolio-repo"
$remote = 'https://github.com/jazz-hue/Portfolio.git'

Write-Host ""
Write-Host "==============================================" -ForegroundColor Red
Write-Host "  作品集 · 同步 + 推送 GitHub" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Red
Write-Host ""
Write-Host "源 : $src"  -ForegroundColor Gray
Write-Host "目标: $dest" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $git)) {
    Write-Host "[!] Git 找不到：$git" -ForegroundColor Red
    Read-Host "回车退出"
    exit 1
}

# 准备目标目录
if (-not (Test-Path $dest)) {
    Write-Host "首次运行：初始化 git 仓库 → $dest" -ForegroundColor Yellow
    New-Item -Path $dest -ItemType Directory -Force | Out-Null
    Set-Location -LiteralPath $dest
    & $git init -b main
    & $git remote add origin $remote
} else {
    Set-Location -LiteralPath $dest
}

# 用 Copy-Item 同步（处理中文路径）
Write-Host "→ 同步文件..." -ForegroundColor Cyan
# 先清理目标里除了 .git 和 .gitignore 之外的所有
Get-ChildItem -LiteralPath $dest -Force | Where-Object {
    $_.Name -ne '.git' -and $_.Name -ne '.gitignore'
} | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 复制 src 下所有内容（不包括 src 文件夹本身）
Get-ChildItem -LiteralPath $src -Force | Where-Object {
    $_.Name -ne '.git'
} | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $dest -Recurse -Force -ErrorAction Continue
}

# 检查变更
Write-Host "→ 检查变更..." -ForegroundColor Cyan
& $git add -A
$changes = (& $git status -s | Measure-Object).Count
if ($changes -eq 0) {
    Write-Host ""
    Write-Host "✓ 没有任何变化，无需提交。" -ForegroundColor Green
    Read-Host "回车退出"
    exit 0
}

Write-Host "  发现 $changes 处变更"
& $git status -s | Select-Object -First 12 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

# 提交
$msg = "update: " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
Write-Host ""
Write-Host "→ 提交：$msg" -ForegroundColor Cyan
& $git -c user.name=jazz-hue -c "user.email=83423238+jazz-hue@users.noreply.github.com" commit -m $msg | Select-Object -First 5

# 推送
Write-Host ""
Write-Host "→ 推送到 GitHub..." -ForegroundColor Cyan
& $git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "  ✓ 推送成功" -ForegroundColor White
    Write-Host "    github.com/jazz-hue/Portfolio" -ForegroundColor White
    Write-Host "    Pages: https://jazz-hue.github.io/Portfolio/" -ForegroundColor White
    Write-Host "==============================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[!] 推送失败，看上面的错误信息" -ForegroundColor Red
}
Write-Host ""
Read-Host "回车退出"
