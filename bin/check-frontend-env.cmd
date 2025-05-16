@echo off
REM This script checks if the environment variables are correctly mounted in the container

echo Checking environment variables in the frontend container...

REM Get the container ID
FOR /F "tokens=*" %%i IN ('docker-compose ps -q frontend') DO SET CONTAINER_ID=%%i

IF "%CONTAINER_ID%"=="" (
  echo Frontend container is not running. Please start the containers first.
  exit /b 1
)

echo Container ID: %CONTAINER_ID%

REM Check if env-config.js exists and show its contents
echo Checking if env-config.js exists in the container...
docker exec %CONTAINER_ID% ls -la /usr/share/nginx/html/env-config.js

echo Content of env-config.js:
docker exec %CONTAINER_ID% cat /usr/share/nginx/html/env-config.js

echo.
echo Environment variables test complete
