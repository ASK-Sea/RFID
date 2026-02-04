@echo off
cd /d "%~dp0"
echo Starting RFID Dashboard...
echo.
rfid-dashboard-app.exe
echo.
echo If you see an error above, note it down.
pause
