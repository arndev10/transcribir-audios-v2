@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Iniciando Control Fit API...
py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
