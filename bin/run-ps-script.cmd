@echo off
echo === RUNNING POWERSHELL SCRIPT WITH EXECUTION POLICY BYPASS ===

REM Check for repository parameter
if "%1"=="" (
    echo ERROR: Missing repository parameter!
    echo Usage: bin\run-ps-script.cmd owner/repo
    pause
    exit /b 1
)

REM Run PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -File "%~dp0add-github-secrets.ps1" %*

echo.
pause
