@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

echo.
echo ========================================
echo  Historia Clinica - Inicializacion
echo  Carpeta: human-scratch-three
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    echo Instala Node 20 LTS desde https://nodejs.org/
    exit /b 1
)

set "SKIP_BACKEND=0"
where docker >nul 2>&1
if errorlevel 1 set "SKIP_BACKEND=1"

if "%SKIP_BACKEND%"=="0" (
    docker info >nul 2>&1
    if errorlevel 1 set "SKIP_BACKEND=1"
)

if "%SKIP_BACKEND%"=="1" (
    echo AVISO: Docker no disponible. Solo se instalara el frontend.
    echo Para el backend abre Docker Desktop y usa scripts\start.cmd
    goto do_frontend
)

echo [1/2] Compilando backend con Maven en Docker...
call "%~dp0docker-package.cmd"
if errorlevel 1 (
    echo AVISO: fallo la compilacion del JAR. Puedes usar scripts\start.cmd igualmente.
)

:do_frontend
echo [2/2] Instalando dependencias del frontend...
cd /d "%~dp0..\frontend"
call npm install --strict-ssl=false
if errorlevel 1 exit /b 1

echo.
echo ========================================
echo  Inicializacion completada
echo ========================================
echo.
echo Para abrir la pagina de Fundacion Manos Unidas:
echo   scripts\start.cmd
echo.
echo   http://localhost:4200
echo   http://localhost:4200/nuevo
echo.
endlocal
