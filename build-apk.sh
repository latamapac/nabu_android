#!/bin/bash
# Build Nabu Messenger Android APK

set -e

echo "🏛️  Building Nabu Messenger Android APK..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from mobile/android directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
cd android
./gradlew clean
cd ..

# Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug

echo ""
echo "✅ Build complete!"
echo ""
echo "APK location:"
echo "  android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on device:"
echo "  adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
echo ""

# Check if APK exists
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    ls -lh app/build/outputs/apk/debug/app-debug.apk
fi
