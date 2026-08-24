@echo off
setlocal EnableExtensions

echo Deteniendo backend en puerto 8080...

docker stop manos-unidas-backend >nul 2>&1
docker rm manos-unidas-backend >nul 2>&1

for /f %%i in ('docker ps -q --filter "publish=8080"') do (
  echo   Deteniendo contenedor %%i
  docker stop %%i >nul 2>&1
)

echo Listo. Puerto 8080 liberado.
endlocal
