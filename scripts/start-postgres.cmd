@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

where docker >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker no encontrado. Instala Docker Desktop.
  exit /b 1
)

echo Iniciando PostgreSQL (manos_unidas / usuario manos) en puerto 5432...
docker compose up -d postgres

echo.
echo Esperando a que PostgreSQL este listo...
:wait_loop
docker compose exec -T postgres pg_isready -U manos -d manos_unidas >nul 2>&1
if errorlevel 1 (
  timeout /t 2 /nobreak >nul
  goto wait_loop
)

echo PostgreSQL listo.
echo   Host: localhost
echo   DB:   manos_unidas
echo   User: manos
echo   Pass: manos
endlocal
