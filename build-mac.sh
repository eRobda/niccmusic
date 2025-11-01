#!/bin/bash

# Ensure we're in the script's directory (project root)
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found!"
    echo "Please run this script from the project root directory."
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "Building for macOS..."
echo "Current directory: $(pwd)"
echo ""

# Build the project
npm run build:mac

if [ $? -ne 0 ]; then
    echo ""
    echo "Build failed! Please check the error messages above."
    exit 1
fi

echo ""
echo "Build completed successfully!"
echo "The Mac app should be in the 'dist' directory."


