@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

if not exist "frontend\node_modules\" (
    echo Falta node_modules. Ejecuta primero:
    echo   scripts\init.cmd
    exit /b 1
)

where docker >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no encontrado. Instala Docker Desktop o usa:
    echo   cd backend ^&^& mvnw.cmd spring-boot:run
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop no esta corriendo.
    echo Abre Docker Desktop y vuelve a ejecutar scripts\start.cmd
    exit /b 1
)

echo.
echo Iniciando PostgreSQL...
call "%~dp0start-postgres.cmd"
if errorlevel 1 exit /b 1

echo.
echo Iniciando backend Spring Boot en nueva ventana (puerto 8080)...
start "Historia Clinica - Backend" cmd /k "%~dp0docker-run-backend.cmd"

echo.
echo El backend puede tardar ~1 minuto la primera vez (descarga Maven).
echo Espere a ver "Started HumanScratchApplication" en la ventana del backend.
echo.
echo Esperando 25 segundos antes de abrir el frontend...
timeout /t 25 /nobreak >nul

echo.
echo Iniciando frontend Angular (puerto 4200)...
echo.
echo   http://localhost:4200          - Dashboard
echo   http://localhost:4200/nuevo    - Nuevo ingreso / historia clinica
echo.
call "%~dp0run-frontend.cmd"

endlocal
