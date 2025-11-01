@echo off
REM Ensure we're in the correct directory
cd /d "%~dp0"

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found!
    echo Please run this script from the project root directory.
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Building for Windows...
echo Current directory: %CD%
echo.

REM Build the project
call npm run build:win

if %errorlevel% neq 0 (
    echo.
    echo Build failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
pause


