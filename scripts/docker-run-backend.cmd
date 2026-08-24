@echo off
setlocal EnableExtensions
cd /d "%~dp0.."

call "%~dp0start-postgres.cmd"
if errorlevel 1 exit /b 1

echo.
echo Liberando puerto 8080 si quedo un backend anterior...
call "%~dp0stop-backend.cmd"

cd /d "%~dp0..\backend"

echo.
echo Spring Boot en Docker (Maven + Java 21). No necesitas mvn instalado.
echo Puerto: http://localhost:8080
echo PostgreSQL: jdbc:postgresql://postgres:5432/manos_unidas
echo.
echo Espere en esta ventana hasta ver: Started HumanScratchApplication
echo.

docker run --rm -it --name manos-unidas-backend ^
  -p 8080:8080 ^
  --network manos-unidas-net ^
  -e DB_HOST=postgres ^
  -e DB_PORT=5432 ^
  -e DB_NAME=manos_unidas ^
  -e DB_USER=manos ^
  -e DB_PASSWORD=manos ^
  -v "%CD%:/app" ^
  -w /app ^
  maven:3.9-eclipse-temurin-21 ^
  mvn -B spring-boot:run

endlocal
