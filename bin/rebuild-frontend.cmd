@echo off
REM ===================================================
REM Script to rebuild and restart the frontend application
REM ===================================================

REM Get the project root directory
set PROJECT_ROOT=%~dp0..
cd %PROJECT_ROOT%

echo Rebuilding frontend container...

docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml stop frontend
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml rm -f frontend
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml build --no-cache frontend
docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml up -d frontend

echo Frontend container rebuilt!
echo ======================================
echo Check logs with: docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml logs -f frontend
echo ======================================
echo Remember to clear your browser cache completely (Ctrl+Shift+Delete) before testing!
