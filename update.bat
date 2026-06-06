@echo off
chcp 65001 >nul
title 作品集网站 · 一键更新
echo.
echo ============================================
echo   作品集站 · 添加新图后请双击此文件更新
echo ============================================
echo.

REM 优先 py 启动器，其次 python
where py >nul 2>nul
if %ERRORLEVEL%==0 (
    py "%~dp0update.py"
    goto end
)
where python >nul 2>nul
if %ERRORLEVEL%==0 (
    python "%~dp0update.py"
    goto end
)

echo [!] 没找到 Python。请先安装：https://www.python.org/downloads/
echo     安装时务必勾选 "Add Python to PATH"
echo     安装后再次双击本文件即可。
echo.
pause
exit /b 1

:end
echo.
echo --------------------------------------------
echo   完成。可以直接打开 index.html 预览，
echo   或推送到 GitHub Pages 部署。
echo --------------------------------------------
pause
