@echo off
chcp 65001 >nul
title 作品集 · 同步并推送到 GitHub
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-and-push.ps1"
