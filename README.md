# 🍅 Promodoro Timer App

A **mobile-optimized** Pomodoro timer application to boost your productivity using the popular time management technique. Now with **PWA support** and **mobile-first design**!

## ✨ Features

### **📱 Mobile-First Design**
- **Responsive layout** for all devices (phones, tablets, desktop)
- **Touch-friendly interactions** with 44px+ touch targets
- **Optimized for mobile browsers** (Chrome, Safari, Firefox)
- **PWA functionality** - install as a native app
- **Offline support** with Service Worker

### **⏱️ Timer Functionality**
- **Three Timer Modes**:
  - Promodoro (work session): Default 25 minutes
  - Short Break: Default 5 minutes
  - Long Break: Default 15 minutes (after every 4 Promodoro sessions)
- **Visual progress bar** with real-time updates
- **Customizable durations** via settings panel

### **🎵 Audio & Notifications**
- **Multiple alarm sounds** to choose from
- **Custom sound upload** capability
- **Browser notifications** (when supported)
- **Haptic feedback** on mobile devices

### **📋 Task Management**
- **Task list** with add/delete functionality
- **Current task selection** and tracking
- **Session history** per task
- **Task completion badges**

### **⚙️ Customization**
- **Adjustable timer durations**
- **Audio settings** (enable/disable, sound selection)
- **Auto-start** next session toggle
- **Dark theme optimized** interface

## 🚀 How to Use

### **Basic Operation**
1. **Work Session (Promodoro)**:
   - Click the "Start" button to begin a work session
   - Focus on your task until the timer completes
   - A sound will play when the timer ends

2. **Break Sessions**:
   - Short breaks automatically start after each work session
   - After 4 work sessions, you'll get a longer break
   - Use this time to rest and recharge

### **Mobile Usage**
1. **Install as PWA**:
   - Open in mobile browser (Chrome/Safari)
   - Look for "Add to Home Screen" option
   - Install for native app experience

2. **Touch Interactions**:
   - All buttons are optimized for touch
   - Supports both portrait and landscape
   - Prevents accidental zoom on inputs

3. **Settings Access**:
   - Tap the gear icon (⚙️) to open settings
   - Adjust timer durations, sounds, and preferences
   - Changes are saved automatically

## 📱 Mobile Installation

### **Android Chrome:**
1. Open the app in Chrome
2. Menu (⋮) → "Add to Home screen"
3. App will appear on your home screen

### **iPhone Safari:**
1. Open the app in Safari
2. Share (□↗) → "Add to Home Screen"
3. App will appear on your home screen

## 🔧 Technical Features

- **Progressive Web App** (PWA) with Service Worker
- **Responsive CSS** with modern layout techniques
- **Local Storage** for settings and task persistence
- **Vanilla JavaScript** - no dependencies
- **Cross-browser compatibility**
- **Accessibility optimized** (WCAG compliant)

## 🎯 The Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into intervals, typically 25 minutes in length, separated by short breaks.

**Basic Process:**
1. Decide on the task to be done
2. Set the timer for 25 minutes (one pomodoro)
3. Work on the task until the timer rings
4. Take a short break (5 minutes)
5. After four pomodoros, take a longer break (15-30 minutes)

## 📦 Deployment & APK Generation

### **GitHub Pages Deployment:**
1. Push to GitHub repository
2. Enable GitHub Pages in repository Settings
3. App will be available at: `https://username.github.io/repository-name`

### **Android APK Generation:**
1. Deploy app to GitHub Pages or hosting service
2. Visit [PWA2APK](https://pwa2apk.com/)
3. Enter your app URL
4. Generate and download APK file
5. Install on Android device

## 🧪 Mobile Testing

Use the included `mobile-test-guide.html` for comprehensive mobile testing:
- Responsive design validation
- Touch interaction testing
- PWA functionality verification
- Cross-browser compatibility checks

## 📁 Project Structure

```
promodoro-timer-ai/
├── index.html              # Main application file (mobile-optimized)
├── app-simple.js           # All JavaScript functionality
├── styles/main.css         # Mobile-first responsive styles
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline support
├── icons/                  # App icons for different sizes
├── mobile-test-guide.html  # Mobile testing documentation
├── github-guide.html       # GitHub deployment guide
├── netlify-deploy.html     # Alternative deployment guide
└── README.md              # This file
```

## 🔗 Live Demo

Visit the live app at: [https://jimbalomen.github.io/promodoro-timer-ai](https://jimbalomen.github.io/promodoro-timer-ai)

## 📱 Mobile-First Benefits

- **🚀 Fast loading** - optimized for mobile networks
- **👆 Touch-friendly** - all interactions designed for fingers
- **🔄 Responsive** - works on any screen size
- **📱 Native feel** - when installed as PWA
- **⚡ Offline ready** - works without internet
- **🔔 Push notifications** - timer alerts even when app is closed

## 🏗️ Development

This app is built with:
- **Vanilla JavaScript** (ES6+)
- **Modern CSS** (Flexbox, Grid, Custom Properties)
- **MVC Architecture** pattern
- **Mobile-first** responsive design
- **Progressive Enhancement** approach

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for productivity enthusiasts who want a mobile-optimized Pomodoro experience!** 