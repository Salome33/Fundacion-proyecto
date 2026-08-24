@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

echo.
echo [1/3] Backend: Maven en Docker...
call "%~dp0docker-package.cmd"
if errorlevel 1 exit /b 1

echo.
echo [2/3] Frontend: npm install...
cd /d "%~dp0..\frontend"
call npm install --strict-ssl=false
if errorlevel 1 exit /b 1

echo.
echo [3/3] Listo.
echo   Terminal 1: scripts\run-backend-docker.cmd
echo   Terminal 2: scripts\run-frontend.cmd
echo   Abrir: http://localhost:4200
echo.
endlocal
