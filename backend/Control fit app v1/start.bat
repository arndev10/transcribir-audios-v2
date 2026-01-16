@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   Control Fit API - Iniciando Servidor
echo ========================================
echo.
echo Verificando dependencias...
py -c "from app.main import app; print('OK - Aplicacion lista')" 2>nul
if errorlevel 1 (
    echo ERROR: No se puede importar la aplicacion
    echo Instalando dependencias faltantes...
    py -m pip install email-validator
    pause
    exit /b 1
)
echo.
echo Iniciando servidor en http://127.0.0.1:8000
echo Documentacion: http://127.0.0.1:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
