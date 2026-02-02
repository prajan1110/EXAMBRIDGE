@echo off
echo Restarting the Exam Bridge application...

cd /d "D:\5th sem\Hackathon\TEAM-SHIKSHA\exam-bridge"

:: Stop any running processes on port 8080 (front-end) and 3001 (back-end)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080"') do (
  taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001"') do (
  taskkill /F /PID %%a 2>nul
)

:: Start the application
npm run dev:all