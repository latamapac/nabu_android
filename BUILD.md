# Building Nabu Messenger Android APK

## Prerequisites

1. **Node.js 18+** installed
2. **React Native CLI** installed globally:
   ```bash
   npm install -g react-native-cli
   ```
3. **Android Studio** with:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (for testing)

## Setup

```bash
cd /Users/mark/Nabu/mobile/android

# Install dependencies
npm install

# Install Android dependencies
cd android
./gradlew dependencies
cd ..
```

## Build APK (Debug)

```bash
# Build debug APK
npm run android

# Or manually:
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Build APK (Release)

```bash
cd android

# Build release APK
./gradlew assembleRelease

# Or bundle for Play Store
./gradlew bundleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Install on Device

```bash
# Connect Android device with USB debugging enabled
adb devices

# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or drag APK to Android emulator
```

## Features (Offline-First)

✅ Local user registration (no server needed)
✅ Local SQLite database
✅ Create conversations
✅ Send/receive messages (locally)
✅ Multiple user accounts support
✅ Fully offline - no internet required

## Troubleshooting

**Metro bundler not starting:**
```bash
npx react-native start --reset-cache
```

**Build fails:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

**App crashes on start:**
- Check `adb logcat` for errors
- Ensure Android SDK is properly configured
