# Build Nabu APK - 3 Options

## Option 1: GitHub Actions (EASIEST - No setup needed)

1. **Push this folder to GitHub**
   ```bash
   cd /Users/mark/Nabu/mobile/android
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nabu-android.git
   git push -u origin main
   ```

2. **Go to GitHub → Actions → Build Android APK → Run workflow**

3. **Download APK from Artifacts** (appears after ~5-10 minutes)

---

## Option 2: Docker Build (No Android Studio)

```bash
cd /Users/mark/Nabu/mobile/android

# Build using Docker
docker build -t nabu-builder .
docker run --rm -v $(pwd):/app nabu-builder

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Option 3: Android Studio (Most Reliable)

1. **Install Android Studio** from https://developer.android.com/studio

2. **Open project:**
   ```bash
   open -a "Android Studio" /Users/mark/Nabu/mobile/android/android
   ```

3. **Wait for Gradle sync**

4. **Build → Build Bundle(s) / APK(s) → Build APK(s)**

5. **APK location:**
   `app/build/outputs/apk/release/app-release.apk`

---

## 📱 Install on Friend's Phone

1. Send the APK file via:
   - Telegram
   - Google Drive
   - Email
   - USB cable

2. Friend must enable:
   ```
   Settings → Security → Unknown Sources → Allow
   ```
   OR on Android 8+:
   ```
   Settings → Apps → Special access → Install unknown apps
   ```

3. Tap APK file to install

---

## ✅ APK Path After Build

```
/Users/mark/Nabu/mobile/android/android/app/build/outputs/apk/release/app-release.apk
```
