# Nabu Messenger - Android (Offline-First)

Fully offline Android app - no server required! All data stays on your device.

## ✨ Features

- ✅ **Local Registration** - Create account directly on device
- ✅ **SQLite Database** - All messages stored locally
- ✅ **No Internet Required** - Works completely offline
- ✅ **Multiple Accounts** - Support for multiple local users
- ✅ **Private & Secure** - Data never leaves your device

## 📁 Project Structure

```
src/
├── screens/
│   ├── WelcomeScreen.js      # First-time setup
│   ├── RegisterScreen.js     # Local account creation
│   ├── LoginScreen.js        # Local login
│   ├── ConversationList.js   # Chat list
│   ├── ChatScreen.js         # Messages
│   ├── NewConversation.js    # Create chat
│   └── SettingsScreen.js     # App settings
├── services/
│   ├── DatabaseService.js    # SQLite wrapper
│   ├── AuthService.js        # Local auth
│   └── MessageService.js     # Message handling
└── context/
    └── AppContext.js         # Global state
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler
npx react-native start

# 3. Run on Android (in another terminal)
npx react-native run-android
```

## 📦 Build APK

### Debug APK
```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK
```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Or use build script
```bash
chmod +x build-apk.sh
./build-apk.sh
```

## 📱 Install on Device

```bash
# Connect device with USB debugging
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔒 How It Works

1. **User Registration** → Creates local SQLite user record
2. **Login** → Verifies password hash locally
3. **Messages** → Stored in device SQLite database
4. **Conversations** → Local only, no sync

## 📊 Database Schema

**Users Table:**
- id, username, display_name, avatar
- password_hash (SHA-256 with salt)
- is_local, is_superuser
- created_at, last_login

**Conversations Table:**
- id, name, avatar, participants
- last_message_preview, unread_count
- created_at, updated_at

**Messages Table:**
- id, conversation_id, sender_id
- content, content_type
- created_at

## 🛠️ Troubleshooting

**Build fails:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

**App crashes:**
```bash
# Check logs
adb logcat | grep ReactNative
```

**Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

## 📝 Notes

- This is a **local-only** version - no cloud sync
- Data is stored in: `/data/data/com.nabumessenger/databases/`
- Uninstalling the app will **delete all data**
- No backup/restore yet (coming soon)
