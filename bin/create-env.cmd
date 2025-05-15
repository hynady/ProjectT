@echo off
REM This script helps you create a .env file from the .env.template

REM Get the project root directory
set PROJECT_ROOT=%~dp0..
cd %PROJECT_ROOT%

echo Creating .env file from template...

if exist .env (
    echo Warning: .env file already exists!
    set /p OVERWRITE="Do you want to overwrite it? (y/n): "
    if /i not "%OVERWRITE%"=="y" (
        echo Operation cancelled.
        exit /b
    )
)

copy .env.template .env
echo .env file created successfully!
echo.
echo IMPORTANT: Please edit the .env file and replace all placeholder values
echo with your actual production values before deploying.
echo.
echo You can use a text editor like VS Code to edit the file:
echo code %PROJECT_ROOT%\.env
echo.
pause
