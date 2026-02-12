#!/bin/bash
# One-command GitHub Actions setup for Nabu APK

set -e

echo "🏛️  Setting up GitHub Actions for Nabu Messenger..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git..."
    git init
    git add .
    git commit -m "Initial commit - Nabu Messenger v0.1"
    git branch -M main
fi

echo ""
echo "✅ Git repository ready!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create a GitHub repository:"
echo "   https://github.com/new"
echo "   Name: nabu-android (or any name)"
echo "   Visibility: Public or Private"
echo "   ❌ DON'T initialize with README"
echo ""
echo "2. Copy this command and run it:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/nabu-android.git"
echo "   git push -u origin main"
echo ""
echo "3. Go to GitHub → Actions → 'Build Android APK' → Run workflow"
echo ""
echo "4. Download APK from 'Artifacts' section (~5-10 minutes)"
echo ""
echo "📱 Your friend can then install the APK!"
