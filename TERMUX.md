# 📱 Termux Setup Guide

## Quick Start (3 Steps)

### 1️⃣ Transfer this folder to your phone
- Zip the entire `facebook-video-player` folder
- Copy to your phone (via USB, cloud, or any method)
- Extract to internal storage or SD card

### 2️⃣ Open Termux and navigate to the folder
```bash
cd /sdcard/Download/facebook-video-player
# Or wherever you extracted it
```

### 3️⃣ Run the setup script
```bash
bash setup-termux.sh
```

That's it! The script will:
- ✅ Check and install Node.js
- ✅ Install dependencies
- ✅ Configure Puppeteer
- ✅ Show your device IP for network access
- ✅ Give you options to run the app

---

## Manual Setup (If script doesn't work)

### Install Dependencies
```bash
# Update Termux
pkg update && pkg upgrade

# Install Node.js
pkg install nodejs-lts

# Install Chromium (for video extraction)
pkg install chromium

# Install project dependencies
npm install
```

### Run the App
```bash
# Run both frontend + backend
npm run dev:all

# Or separately:
npm run server   # Backend (port 3001)
npm run dev      # Frontend (port 5173)
```

---

## Access the App

### On your phone:
```
http://localhost:5173
```

### From other devices (same WiFi):
```bash
# Get your phone's IP
ifconfig | grep inet
```

Then on other device:
```
http://YOUR_PHONE_IP:5173
```

Example: `http://192.168.1.105:5173`

---

## Keep Running in Background

Use `tmux` to keep servers running even after closing Termux:

```bash
# Install tmux
pkg install tmux

# Start tmux session
tmux

# Run the app
bash setup-termux.sh

# Detach (app keeps running): Press Ctrl+B then D
# Reattach later: tmux attach
```

---

## Troubleshooting

### Port already in use:
```bash
pkill node
# Or
killall node
```

### Puppeteer not working:
Edit `server.js` and add to puppeteer.launch():
```javascript
executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
args: ['--no-sandbox', '--disable-setuid-sandbox']
```

### Storage permission denied:
```bash
termux-setup-storage
```

### Dependencies fail to install:
```bash
npm install --legacy-peer-deps
```

---

## Notes

- First run takes 5-10 minutes to install dependencies
- Chromium is optional but needed for video extraction
- App is already configured to work on network (0.0.0.0)
- Battery optimization may kill the app - disable it for Termux

---

## File Structure
```
facebook-video-player/
├── setup-termux.sh    ← Run this file!
├── server.js          ← Backend server
├── src/               ← Frontend code
├── package.json       ← Dependencies
└── vite.config.js     ← Already configured for network
```
