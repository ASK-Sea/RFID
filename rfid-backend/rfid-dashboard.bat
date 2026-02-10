@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo Starting RFID Dashboard...
echo.

:: Find available port starting from 5001
set PORT=5001
:find_port
netstat -ano | findstr /R ":!PORT! " >nul
if errorlevel 1 (
    echo Port !PORT! is available
    goto port_found
) else (
    echo Port !PORT! is in use, trying next port...
    set /a PORT=!PORT!+1
    if !PORT! gtr 5020 (
        echo Error: Could not find available port between 5001-5020
        pause
        exit /b 1
    )
    goto find_port
)

:port_found
echo.
echo Building frontend...
cd /d "%~dp0..\rfid-dashboard"
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

:: Navigate back to backend
cd /d "%~dp0"
echo.
echo Starting backend server on port !PORT!...
echo.
echo Opening browser on http://localhost:!PORT!...
timeout /t 2 /nobreak >nul
start http://localhost:!PORT!
echo.
node server.js

pause
