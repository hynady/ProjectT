@echo off
REM ===================================================
REM Script to build and run the backend Docker image
REM ===================================================

REM Get the project root directory
set PROJECT_ROOT=%~dp0..
cd %PROJECT_ROOT%

echo [INFO] Building backend Docker image with improved settings...

REM Navigate to the server-mono directory
cd %PROJECT_ROOT%\server-mono

REM Build Docker image with special options for Gradle
docker build --no-cache --progress=plain -t projectt-backend .

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker build failed, see the error messages above
    exit /b %ERRORLEVEL%
)

echo [INFO] Backend Docker image built successfully.
echo [INFO] Testing the Docker image...

REM Run the container briefly to test it
docker run --rm -d --name test-backend projectt-backend
timeout /t 10 /nobreak
docker logs test-backend
docker stop test-backend

echo [INFO] Building and testing complete. To deploy with docker-compose, run:
echo       docker-compose -f %PROJECT_ROOT%\docker-compose.production.yml up -d
