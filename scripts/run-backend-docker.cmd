@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

call "%~dp0start-postgres.cmd"
if errorlevel 1 exit /b 1

echo.
echo Liberando puerto 8080 si quedo un backend anterior...
call "%~dp0stop-backend.cmd"

cd /d "%~dp0..\backend"

if not exist "target\human-scratch-three-1.0.0.jar" (
  echo Falta el JAR. Ejecuta: scripts\docker-init.cmd
  exit /b 1
)

echo Backend http://localhost:8080 (Java 21 en Docker)
docker run --rm -it --name manos-unidas-backend -p 8080:8080 ^
  --network manos-unidas-net ^
  -e DB_HOST=postgres ^
  -e DB_PORT=5432 ^
  -e DB_NAME=manos_unidas ^
  -e DB_USER=manos ^
  -e DB_PASSWORD=manos ^
  -v "%CD%\target\human-scratch-three-1.0.0.jar:/app/app.jar:ro" ^
  eclipse-temurin:21-jre ^
  java -jar /app/app.jar

endlocal
