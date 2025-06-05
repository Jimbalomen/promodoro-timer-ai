@echo off
echo 🚀 Promodoro GitHub Deployment Script
echo =====================================
echo.

echo ✅ Checking Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed!
    echo Please install Git from: https://git-scm.com/
    pause
    exit
)

echo ✅ Git found!
echo.

echo 📋 Instructions:
echo 1. Create repository on GitHub: https://github.com/new
echo 2. Name it: promodoro-timer
echo 3. Make it PUBLIC
echo 4. Copy the repository URL when ready
echo.

set /p REPO_URL="📝 Paste your GitHub repository URL (https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    echo ❌ No URL provided!
    pause
    exit
)

echo.
echo 🔄 Initializing Git repository...
git init

echo.
echo 📁 Adding all files...
git add .

echo.
echo 💾 Creating first commit...
git commit -m "🍅 Initial Promodoro Timer App commit"

echo.
echo 🌐 Adding remote origin...
git branch -M main
git remote add origin %REPO_URL%

echo.
echo 🚀 Pushing to GitHub...
git push -u origin main

echo.
echo ✅ SUCCESS! Your app is now on GitHub!
echo.
echo 📋 Next steps:
echo 1. Go to your repository Settings
echo 2. Scroll to Pages section
echo 3. Enable GitHub Pages from main branch
echo 4. Your app will be available at:
echo    https://username.github.io/repository-name
echo.
echo 🎯 For APK generation:
echo 1. Copy your GitHub Pages URL
echo 2. Go to: https://pwa2apk.com/
echo 3. Paste URL and generate APK!
echo.
pause 