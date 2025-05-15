@echo off
REM ===================================================
REM Script to rebuild and restart the backend application
REM ===================================================

echo [INFO] Rebuilding and restarting backend application...

REM Get the project root directory
set PROJECT_ROOT=%~dp0..
cd %PROJECT_ROOT%

REM Navigate to the server-mono directory
cd %PROJECT_ROOT%\server-mono

REM Stop and remove existing backend container
echo [INFO] Stopping and removing backend container...
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml stop backend
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml rm -f backend

REM Rebuild and start backend container
echo [INFO] Rebuilding backend container...
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml up -d --build backend

echo [INFO] Backend application has been rebuilt and restarted.
echo [INFO] Checking logs (press CTRL+C to exit)...
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml logs -f backend
