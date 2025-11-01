#!/bin/bash
# Ensure we're in the script's directory (project root)
cd "$(dirname "$0")"

echo "Installing dependencies..."
echo "Current directory: $(pwd)"
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "Error installing dependencies. Please check the error messages above."
    exit 1
fi

echo ""
echo "Building Electron main process..."
npm run build:electron

if [ $? -ne 0 ]; then
    echo ""
    echo "Error building Electron main process. Please check the error messages above."
    exit 1
fi

echo ""
echo "Setup complete! You can now run:"
echo "  npm run electron:dev    - to start in development mode"
echo "  npm run build:win       - to build for Windows"
echo "  npm run build:mac       - to build for macOS"
echo "  npm run build:linux     - to build for Linux"
echo ""
echo "Note: The app now uses Node.js built-in modules for downloading instead of electron-dl"
echo ""
