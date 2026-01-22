# Facebook Video Player

A modern web application for extracting, watching, and downloading Facebook videos. Built with React + Vite for the frontend and Express.js + Puppeteer for the backend.

![Facebook Video Player](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-4.646FF0?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-19-38BDF8?logo=tailwindcss)

## Features

### Video Extraction & Playback
- 🎬 Extract videos from Facebook posts, reels, groups, and watch
- 🎥 Full-featured HTML5 video player with custom controls
- 📥 Download videos in multiple qualities (HD, SD)
- 🔒 Support for private content with authentication

### User Experience
- 📱 Mobile-friendly with gesture controls (swipe, double-tap)
- 🌙 Dark mode support
- ⌨️ Keyboard shortcuts for video control
- 📋 PWA with offline support
- 🔗 QR code and embed code for sharing

### Playlist Management
- ➕ Create and manage multiple playlists
- 🎵 Add videos to playlists
- 🎶 Play from playlist sequentially
- 💾 Local storage persistence

### Advanced Features
- 🔄 Playback speed control (0.25x to 4x)
- 🖼️ Picture-in-picture mode
- 🎯 Gesture overlay for mobile navigation
- 📊 Video quality selection
- 🔖 Bookmark support

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 7.2** - Build tool & dev server
- **React Router DOM 7.12** - Client-side routing
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons

### Backend
- **Express.js 4.18** - API server
- **Puppeteer 22.0** - Browser automation
- **yt-dlp-wrap 2.3** - Video extraction
- **CORS 2.8** - Cross-origin support

## Demo

**Live Demo:** [Coming Soon]

## Project Structure

```
facebook-video-player/
├── src/
│   ├── components/          # React components
│   │   ├── DownloadModal.jsx
│   │   ├── EmbedCodeModal.jsx
│   │   ├── GestureOverlay.jsx
│   │   ├── PlaylistManager.jsx
│   │   └── QRCodeModal.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   └── Player.jsx
│   ├── hooks/              # Custom React hooks
│   │   └── useMobileGestures.js
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main app component
│   ├── AppRouter.jsx       # Route configuration
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static files
├── server.js               # Express API server
├── package.json
├── vite.config.js          # Vite configuration
└── vercel.json            # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) yt-dlp installed on your system

### Installation

```bash
# Clone the repository
git clone https://github.com/Imtiaz-Official/FacebookVideoPlayer.git
cd FacebookVideoPlayer

# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev:all
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Deployment

### Deploy to Vercel (Frontend)

1. **Fork/Clone** this repository

2. **Deploy to Vercel**
   ```
   Visit https://vercel.com/new
   Import your GitHub repository
   Click Deploy
   ```

3. **Environment Variables** (in Vercel dashboard)
   ```
   VITE_API_BASE_URL=https://your-backend-api.com
   ```

### Deploy Backend API (Required for video extraction)

The backend requires Puppeteer for video extraction. Deploy to one of:

#### Option 1: Render (Recommended)
```bash
# Create a new Web Service on Render
# Connect your GitHub repo
# Build Command: npm install
# Start Command: npm run server
# Environment Variables: (none required)
```

#### Option 2: Railway
```bash
# Create new project from GitHub
# Select FacebookVideoPlayer repo
# Add environment variables if needed
```

#### Option 3: Your Server
```bash
npm install
npm run server
```

### Configure Frontend API URL

Once your backend is deployed:

1. Go to your Vercel project dashboard
2. Add environment variable: `VITE_API_BASE_URL`
3. Set value to your backend URL (e.g., `https://your-api.onrender.com`)

## Usage

### Extract a Facebook Video

1. Open the app
2. Paste a Facebook video URL
3. Click "Extract Video"
4. (Optional) Login for private content
5. Watch or download the video

### Supported URL Formats

- Facebook posts: `https://www.facebook.com/watch/?v=123456789`
- Facebook videos: `https://www.facebook.com/username/videos/123456789`
- Facebook reels: `https://www.facebook.com/reel/123456789`
- Facebook groups: `https://www.facebook.com/groups/123456789`

### Authentication

For private content:
1. Click "Login" button
2. Choose login method:
   - **Credentials**: Enter Facebook email/phone and password
   - **Manual**: Opens a browser window for manual login (handles 2FA/CAPTCHA)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space / K | Play/Pause |
| F | Fullscreen |
| M | Mute/Unmute |
| J / L | Rewind 10s / Forward 10s |
| ← / → | Previous video / Next video |

### Mobile Gestures

- **Double-tap**: Seek forward/backward 10 seconds
- **Swipe left/right**: Next/previous video
- **Pinch zoom**: Zoom in/out

## API Endpoints

### Authentication
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/manual` - Manual login (browser)
- `POST /api/auth/logout` - Logout

### Video Operations
- `GET /api/extract?url=<URL>&auth=<true|false>` - Extract video info
- `GET /api/download?url=<URL>&filename=<name>` - Download video

### Utility
- `GET /api/health` - Health check
- `POST /api/cache/clear` - Clear video cache

## Environment Variables

Create a `.env` file in the root directory:

```env
# Facebook App ID (optional - for advanced features)
VITE_FACEBOOK_APP_ID=your_app_id_here

# Backend API URL (for Vercel deployment)
VITE_API_BASE_URL=https://your-backend-url.com
```

## Development

```bash
# Install dependencies
npm install

# Run development servers (frontend + backend)
npm run dev:all

# Run only frontend
npm run dev

# Run only backend
npm run server

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### Videos not extracting
- Ensure the backend server is running
- Check that the URL is a valid Facebook video URL
- Try logging in for private content

### Puppeteer errors
- Ensure all dependencies are installed
- Check that Chrome/Chromium is available on your system
- Update Puppeteer: `npm install puppeteer@latest`

### Port conflicts
- Frontend uses port 5173
- Backend uses port 3001
- Change ports in `vite.config.js` and `server.js` if needed

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Facebook](https://facebook.com) - Video platform
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video extraction library
- [Puppeteer](https://pptr.dev) - Browser automation
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI framework

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues first
- Provide detailed error messages and steps to reproduce

---

**Made with ❤️ for the Facebook community**
