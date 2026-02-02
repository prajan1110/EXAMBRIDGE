@echo off
echo Restarting server...

REM Find processes using port 3001
echo Checking for processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Found process: %%a
    echo Killing process: %%a
    taskkill /F /PID %%a
    if %ERRORLEVEL% EQU 0 (
        echo Successfully killed process %%a
    ) else (
        echo Failed to kill process %%a
    )
)

REM Start server
echo Starting server...
cd server
node server.js