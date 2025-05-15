@echo off
REM ===================================================
REM Utility script to list all available commands
REM ===================================================

REM Get the project root directory
set PROJECT_ROOT=%~dp0..
cd %PROJECT_ROOT%

echo ===================================================
echo TackTicket Project Management Utilities
echo ===================================================
echo.
echo Available commands:
echo.
echo 1. Initial Setup:
echo    - bin\create-env.cmd         : Create .env file from template
echo.
echo 2. Deployment:
echo    - bin\deploy.cmd             : Build and deploy all services
echo    - bin\build-backend-docker.cmd: Build the backend Docker image
echo.
echo 3. Maintenance:
echo    - bin\rebuild-backend.cmd    : Rebuild and restart backend 
echo    - bin\rebuild-frontend.cmd   : Rebuild and restart frontend
echo.
echo ===================================================
