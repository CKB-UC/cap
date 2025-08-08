@echo off
echo Starting Workshop Platform Email Verification Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create a .env file with your Gmail credentials:
    echo GMAIL_USER=your-email@gmail.com
    echo GMAIL_APP_PASSWORD=your-app-password
    echo.
    echo For now, the server will start with default settings.
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm start 