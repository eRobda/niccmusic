@echo off
REM Ensure we're in the script's directory (project root)
cd /d "%~dp0"

echo Installing dependencies...
echo Current directory: %CD%
npm install

if %errorlevel% neq 0 (
    echo.
    echo Error installing dependencies. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Building Electron main process...
npm run build:electron

if %errorlevel% neq 0 (
    echo.
    echo Error building Electron main process. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Setup complete! You can now run:
echo   npm run electron:dev    - to start in development mode
echo   npm run build:win       - to build for Windows
echo.
echo Note: The app now uses Node.js built-in modules for downloading instead of electron-dl
echo.
pause
