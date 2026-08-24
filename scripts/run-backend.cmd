@echo off
cd /d "%~dp0..\backend"
call mvn -q spring-boot:run
