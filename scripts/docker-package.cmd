@echo off
setlocal EnableExtensions
cd /d "%~dp0..\backend"

echo Compilando JAR con Maven en Docker...
docker run --rm -v "%CD%:/app" -w /app maven:3.9-eclipse-temurin-21 mvn -B -q package -DskipTests
if errorlevel 1 exit /b 1

echo.
echo JAR: backend\target\human-scratch-three-1.0.0.jar
echo Ejecutar: java -jar target\human-scratch-three-1.0.0.jar
endlocal
