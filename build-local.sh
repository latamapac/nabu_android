#!/bin/bash
# Build APK locally without Android Studio

set -e

echo "🏛️  Nabu Messenger - Local APK Build"
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install with:"
    echo "   brew install openjdk@17"
    exit 1
fi

# Setup Android SDK in project directory
SDK_DIR="$PWD/.android-sdk"
mkdir -p "$SDK_DIR"

# Download command line tools if not exists
if [ ! -d "$SDK_DIR/cmdline-tools" ]; then
    echo "📦 Downloading Android SDK..."
    cd "$SDK_DIR"
    curl -o sdk-tools.zip "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
    unzip -q sdk-tools.zip
    mkdir -p cmdline-tools
    mv cmdline-tools latest 2>/dev/null || true
    mkdir -p cmdline-tools/latest
    mv bin lib NOTICE.txt source.properties cmdline-tools/latest/ 2>/dev/null || true
    rm sdk-tools.zip
    cd -
fi

# Set environment
export ANDROID_HOME="$SDK_DIR"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

# Accept licenses
mkdir -p "$SDK_DIR/licenses"
echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" > "$SDK_DIR/licenses/android-sdk-license"
echo "d56f5187479451eabf01fb78af6dfcb131a6481e" >> "$SDK_DIR/licenses/android-sdk-license"

# Install required SDK components
echo "📥 Installing SDK components..."
sdkmanager --sdk_root="$SDK_DIR" "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest"

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build APK
echo "🔨 Building APK..."
cd android
chmod +x gradlew
./gradlew assembleRelease

echo ""
echo "✅ Build complete!"
echo ""
echo "APK location:"
ls -lh app/build/outputs/apk/release/app-release.apk
echo ""
