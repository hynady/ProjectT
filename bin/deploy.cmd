@echo off
REM Deploy script for Windows environments

REM Get the project root directory
set PROJECT_ROOT=%~dp0..
cd %PROJECT_ROOT%

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please create a .env file based on the .env.template file.
    exit /b 1
)

REM Build Spring Boot application
echo Building Spring Boot application...
cd server-mono
call gradlew build -x test
cd %PROJECT_ROOT%

REM Start the services
echo Starting services...
docker-compose -f docker-compose.production.yml up -d

REM Check if services are running
echo Checking services...
docker-compose -f docker-compose.production.yml ps

echo Deployment completed!
echo Frontend: http://localhost:30000
echo Backend API: http://localhost:8080
echo MySQL: localhost:33306
echo Kafka: localhost:29092
