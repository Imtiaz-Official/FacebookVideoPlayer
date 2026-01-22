import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Play,
  Pause,
  Link2,
  Trash2,
  Clipboard,
  ExternalLink,
  Download,
  Loader,
  Maximize,
  Minimize2,
  PictureInPicture,
  Gauge,
  Film,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  History,
  Heart,
  Share2,
  Camera,
  Repeat,
  SkipForward,
  Search,
  X,
  Sparkles,
  TrendingUp,
  Check,
  Zap,
  Menu,
  Settings,
  Keyboard,
  Copy,
  DownloadCloud,
  HelpCircle,
  Info,
  FileText,
  HardDrive,
  Clock,
  AlertCircle,
  ChevronDown,
  Star,
  ArrowUpRight,
  Twitter,
  Facebook as FacebookIcon,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Wand2,
  List,
  Home,
} from "lucide-react";

// Enhanced Quality Selector - Professional & Mobile-Friendly
export default function App({ initialUrl, playerMode = false }) {
  console.log('✨ Professional Quality Selector v2.0 Loaded!');
  console.log('Player Mode:', playerMode);
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLinks, setVideoLinks] = useState(() => {
    const saved = localStorage.getItem('fbVideoQueue');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentVideo, setCurrentVideo] = useState(() => {
    const saved = localStorage.getItem('currentVideo');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState({ message: "", type: "info" });
  const [isExtracting, setIsExtracting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const autoExtractPendingRef = useRef(false);

  const errorTimeoutRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const pendingSeekRef = useRef(null);
  const previousVolumeRef = useRef(0.4);
  const initialMountRef = useRef(true);
  const pendingExtractUrlRef = useRef(null);

  // Player state
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    const saved = localStorage.getItem('playbackSpeed');
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showSpeedSelector, setShowSpeedSelector] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [progressHover, setProgressHover] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('volume');
    return saved !== null ? parseFloat(saved) : 0.4;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayNext] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // UI state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'history'

  // History & Favorites
  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('watchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Direct URL input state
  const [showDirectUrlModal, setShowDirectUrlModal] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cachedVideos, setCachedVideos] = useState([]);

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Facebook Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [useAuthMode, setUseAuthMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stats
  const [totalWatched, setTotalWatched] = useState(() => {
    return parseInt(localStorage.getItem('totalWatched') || '0');
  });

  // Video progress history - stores timestamp and speed per video
  const [videoProgress, setVideoProgress] = useState(() => {
    const saved = localStorage.getItem('videoProgress');
    return saved ? JSON.parse(saved) : {};
  });
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(null);

  // Brightness control state
  const [brightness, setBrightness] = useState(100);
  const swipeGestureRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    type: null, // 'brightness' or 'volume'
    initialValue: 0,
  });
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [swipeIndicatorValue, setSwipeIndicatorValue] = useState(0);
  const [swipeIndicatorType, setSwipeIndicatorType] = useState(null);

  // NEW: Toast notifications
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // NEW: Keyboard shortcuts help
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // NEW: Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // NEW: Recent URLs for autocomplete
  const [recentUrls, setRecentUrls] = useState(() => {
    const saved = localStorage.getItem('recentUrls');
    return saved ? JSON.parse(saved) : [];
  });
  const [showUrlSuggestions, setShowUrlSuggestions] = useState(false);

  // NEW: Download history (separate from watch history)
  const [downloadHistory, setDownloadHistory] = useState(() => {
    const saved = localStorage.getItem('downloadHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // NEW: Share menu
  const [showShareMenu, setShowShareMenu] = useState(false);

  // NEW: FAQ modal
  const [showFaq, setShowFaq] = useState(false);

  // NEW: Collapsible sections for mobile
  const [showQueueMobile, setShowQueueMobile] = useState(() => {
    const saved = localStorage.getItem('showQueueMobile');
    return saved !== null ? saved === 'true' : true; // Default to open
  });
  const [showFormatsMobile, setShowFormatsMobile] = useState(() => {
    const saved = localStorage.getItem('showFormatsMobile');
    return saved !== null ? saved === 'true' : false; // Default to closed
  });

  // NEW: Auto-extract mode
  const [autoExtract, setAutoExtract] = useState(() => {
    const saved = localStorage.getItem('autoExtract');
    return saved !== null ? saved === 'true' : true; // Default to true
  });

  // NEW: Batch URL mode & extraction progress
  const [batchUrlMode, setBatchUrlMode] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(null);
  const [compactMode, setCompactMode] = useState(() => {
    const saved = localStorage.getItem('compactMode');
    return saved === 'true';
  });

  // NEW: Drag & drop state
  const [isDraggingUrl, setIsDraggingUrl] = useState(false);

  // Controls visibility state (for tap-to-hide feature like YouTube)
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Save compact mode preference
  useEffect(() => {
    localStorage.setItem('compactMode', compactMode.toString());
  }, [compactMode]);

  // Save auto-extract preference
  useEffect(() => {
    localStorage.setItem('autoExtract', autoExtract.toString());
  }, [autoExtract]);

  // Save history and favorites
  useEffect(() => {
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('totalWatched', totalWatched.toString());
  }, [totalWatched]);

  // Save volume to localStorage
  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  // Save playback speed to localStorage
  useEffect(() => {
    localStorage.setItem('playbackSpeed', playbackSpeed.toString());
  }, [playbackSpeed]);

  // Save video progress to localStorage
  useEffect(() => {
    localStorage.setItem('videoProgress', JSON.stringify(videoProgress));
  }, [videoProgress]);

  // Save auto-extract preference to localStorage
  useEffect(() => {
    localStorage.setItem('autoExtract', autoExtract.toString());
  }, [autoExtract]);

  // Save collapsible section states to localStorage
  useEffect(() => {
    localStorage.setItem('showQueueMobile', showQueueMobile.toString());
  }, [showQueueMobile]);

  useEffect(() => {
    localStorage.setItem('showFormatsMobile', showFormatsMobile.toString());
  }, [showFormatsMobile]);

  // Helper function to get backend URL (works on both localhost and network)
  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return `http://${hostname}:3001`;
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/api/auth/status`);
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
        }
      } catch (err) {
        console.error('Failed to check auth status:', err);
      }
    };
    checkAuthStatus();
  }, []);

  // Login to Facebook
  const handleLogin = async (useManual = false) => {
    setIsLoggingIn(true);
    try {
      if (useManual) {
        // Manual login - opens browser
        const response = await fetch(`${getBackendUrl()}/api/auth/manual`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setShowLoginModal(false);
          showError('Successfully logged in to Facebook!', 'success');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } else {
        // Credentials login
        const response = await fetch(`${getBackendUrl()}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setShowLoginModal(false);
          setLoginEmail('');
          setLoginPassword('');
          showError('Successfully logged in to Facebook!', 'success');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout from Facebook
  const handleLogout = async () => {
    try {
      await fetch(`${getBackendUrl()}/api/auth/logout`, { method: 'POST' });
      setIsAuthenticated(false);
      setUseAuthMode(false);
      showError('Logged out from Facebook', 'success');
    } catch (err) {
      showError('Failed to logout', 'error');
    }
  };

  // Save progress periodically as video plays
  useEffect(() => {
    if (!currentVideo?.url || !duration || !videoPlayerRef.current) return;

    const saveInterval = setInterval(() => {
      const video = videoPlayerRef.current;
      if (video && video.currentTime > 5) { // Only save if more than 5 seconds in
        // Use the title from currentVideo if available, otherwise extract from URL
        let title = currentVideo.title;
        if (!title) {
          try {
            const urlObj = new URL(currentVideo.url);
            if (urlObj.pathname.includes('/watch')) {
              const params = new URLSearchParams(urlObj.search);
              title = params.get('v') || 'Facebook Video';
            } else if (urlObj.pathname.includes('/videos')) {
              const parts = urlObj.pathname.split('/');
              title = parts[parts.length - 1] || 'Facebook Video';
            } else if (urlObj.pathname.includes('/reel')) {
              title = 'Reel: ' + urlObj.pathname.split('/').pop();
            } else if (urlObj.hostname.includes('fb.watch')) {
              title = 'FB Watch: ' + urlObj.pathname.slice(1);
            } else {
              title = 'Facebook Video';
            }
            // Limit title length
            if (title.length > 50) title = title.substring(0, 50) + '...';
          } catch {
            title = 'Facebook Video';
          }
        }

        setVideoProgress(prev => ({
          ...prev,
          [currentVideo.url]: {
            url: currentVideo.url,
            title: title,
            timestamp: video.currentTime,
            duration: video.duration,
            playbackSpeed: video.playbackRate,
            lastWatched: new Date().toISOString(),
            thumbnail: currentVideo.thumbnail || null
          }
        }));
      }
    }, 3000); // Save every 3 seconds

    return () => clearInterval(saveInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.url, duration]);

  // Track last video URL to only show resume prompt once per video
  const lastVideoUrlRef = useRef(null);

  // Auto-resume on page load (before video element mounts)
  useEffect(() => {
    if (!currentVideo?.url) return;
    if (!initialMountRef.current) return; // Only run on initial mount

    const progress = videoProgress[currentVideo.url];
    if (progress && 
        progress.timestamp >= 5 && 
        progress.duration > 0 && 
        progress.timestamp < progress.duration - 5) {
      // Set pending seek so video will seek when it loads
      pendingSeekRef.current = progress.timestamp;
      // Restore playback speed
      if (progress.playbackSpeed) {
        setPlaybackSpeed(progress.playbackSpeed);
      }
    }

    initialMountRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.url]);

  // Restore progress when video changes
  useEffect(() => {
    if (!currentVideo?.url || !videoPlayerRef.current) return;

    // Skip if this is the same video we already processed
    if (lastVideoUrlRef.current === currentVideo.url) return;

    const progress = videoProgress[currentVideo.url];
    if (progress && 
        progress.timestamp >= 5 && 
        progress.duration > 0 && 
        progress.timestamp < progress.duration - 5) {
      // Show resume prompt if video was watched more than 5 seconds and not at the end
      setResumeTime(progress.timestamp);
      setShowResumePrompt(true);

      // Restore playback speed
      if (progress.playbackSpeed && videoPlayerRef.current) {
        videoPlayerRef.current.playbackRate = progress.playbackSpeed;
        setPlaybackSpeed(progress.playbackSpeed);
      }
    } else {
      setShowResumePrompt(false);
      setResumeTime(null);
    }

    // Mark this video as processed
    lastVideoUrlRef.current = currentVideo.url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.url]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // App-level shortcuts (work without video)
      switch (e.key) {
        case 'K': // Keyboard shortcuts help
          e.preventDefault();
          setShowKeyboardHelp(true);
          return;
        case '?': // FAQ
          e.preventDefault();
          setShowFaq(true);
          return;
        case '/': // Focus search
          e.preventDefault();
          if (videoLinks.length > 0) {
            setShowSearch(true);
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            searchInput?.focus();
          }
          return;
        case 'u': // Focus URL input
        case 'U':
          e.preventDefault();
          document.getElementById('video-url-input')?.focus();
          return;
        case 'x': // Toggle dark mode
        case 'X':
          e.preventDefault();
          setDarkMode(!darkMode);
          return;
        case 'Delete': // Clear queue
          e.preventDefault();
          if (videoLinks.length > 0 && confirm('Clear all videos from queue?')) {
            setVideoLinks([]);
            showToast('Queue cleared', 'success');
          }
          return;
      }

      // Video-specific shortcuts
      if (!videoPlayerRef.current) return;

      switch (e.key) {
        case ' ':
        case 'k': // lowercase k for play/pause (YouTube style)
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekVideo(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekVideo(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 'l':
          e.preventDefault();
          setIsLooping(!isLooping);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          seekPercentage(parseInt(e.key) * 10);
          break;
        case '>':
        case '.': {
          e.preventDefault();
          const newSpeedUp = Math.min(2, playbackSpeed + 0.25);
          changePlaybackSpeed(newSpeedUp);
          break;
        }
        case '<':
        case ',': {
          e.preventDefault();
          const newSpeedDown = Math.max(0.25, playbackSpeed - 0.25);
          changePlaybackSpeed(newSpeedDown);
          break;
        }
        case 'n':
        case 'N':
          e.preventDefault();
          playNextVideo();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          seekVideo(-10);
          break;
        case 'L': // Shift+L for seek right 10s (changed from K)
          e.preventDefault();
          seekVideo(10);
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          directDownloadVideo();
          break;
        case 'c': // Toggle controls
        case 'C':
          e.preventDefault();
          setControlsVisible(!controlsVisible);
          break;
        case 's': // Screenshot
        case 'S':
          e.preventDefault();
          captureScreenshot();
          break;
        case 'q': // Quality selector
        case 'Q':
          e.preventDefault();
          if (currentVideo?.availableFormats?.length > 1) {
            setShowSettingsMenu(true);
          }
          break;
        case 'h': // Favorite
        case 'H':
          e.preventDefault();
          if (currentVideo) {
            toggleFavorite(currentVideo);
          }
          break;
        case 't': // Settings
        case 'T':
          e.preventDefault();
          setShowSettingsMenu(!showSettingsMenu);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, isLooping, playbackSpeed, controlsVisible, currentVideo, videoLinks, darkMode, showSearch]);

  // Video event listeners
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (autoPlayNext && videoLinks.length > 1) {
        playNextVideo();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoLinks, autoPlayNext]);

  const showError = (message, type = "error", autoDismiss = true) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setError({ message, type });

    if (autoDismiss) {
      const delay = type === "success" ? 2000 : type === "error" ? 4000 : 3000;
      errorTimeoutRef.current = setTimeout(() => {
        setError({ message: "", type: "info" });
      }, delay);
    }
  };

  const dismissError = () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError({ message: "", type: "info" });
  };

  const isFacebookUrl = (url) => {
    try {
      const trimmed = url.trim();
      if (!trimmed) return false;

      const u = new URL(trimmed);
      const host = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^mbasic\./, "");
      const validHosts = ["facebook.com", "fb.com", "fb.watch"];
      return validHosts.some(validHost => host === validHost || host.endsWith(`.${validHost}`));
    } catch {
      return false;
    }
  };

  const isValidVideoUrl = (url) => {
    try {
      const trimmed = url.trim();
      if (!trimmed) return false;

      const u = new URL(trimmed);

      // Must be http or https
      if (!['http:', 'https:'].includes(u.protocol)) {
        return false;
      }

      // For direct video URLs, check if it has a video file extension
      const path = u.pathname.toLowerCase();
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

      // Check for video extension
      if (videoExtensions.some(ext => path.includes(ext))) {
        return true;
      }

      // Check for common video hosting domains
      const host = u.hostname.toLowerCase();
      const videoHosts = [
        'fbcdn.net', 'facebook.com', 'fb.com',
        'youtube.com', 'youtu.be', 'vimeo.com',
        'dailymotion.com', 'twitch.tv'
      ];

      return videoHosts.some(vh => host === vh || host.endsWith(`.${vh}`));

    } catch {
      return false;
    }
  };

  const normalizeFacebookUrl = (url) => {
    try {
      let normalized = url.trim();
      const u = new URL(normalized);
      const hostname = u.hostname.toLowerCase();

      if (hostname === "m.facebook.com" || hostname === "mbasic.facebook.com" || hostname === "fb.com") {
        u.hostname = "www.facebook.com";
      }

      if (u.pathname === "/watch/" || u.pathname.startsWith("/watch")) {
        const videoId = u.searchParams.get("v");
        if (videoId) {
          u.pathname = `/reel/${videoId}/`;
          u.search = "";
        }
      }

      if (u.protocol === "http:" && hostname.includes("facebook")) {
        u.protocol = "https:";
      }

      return u.toString();
    } catch {
      return url.trim();
    }
  };

  // Decode URL-encoded characters in video URLs (e.g., \u00253D -> =)
  const decodeVideoUrl = (url) => {
    try {
      return url.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch {
      return url;
    }
  };

  const addToHistory = (video) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(v => v.url !== video.url);
      return [{ ...video, watchedAt: new Date().toISOString() }, ...filtered].slice(0, 50);
    });
    setTotalWatched(prev => prev + 1);
  };

  const toggleFavorite = (video) => {
    const exists = favorites.find(f => f.url === video.url);
    if (exists) {
      setFavorites(prev => prev.filter(f => f.url !== video.url));
      showError("Removed from favorites", "info");
    } else {
      setFavorites(prev => [{ ...video, addedAt: new Date().toISOString() }, ...prev]);
      showError("Added to favorites", "success");
    }
  };

  const isFavorite = (url) => favorites.some(f => f.url === url);

  const addVideoLink = () => {
    console.log('[Add Video] Function called');
    const raw = videoUrl.trim();
    console.log('[Add Video] Raw URL:', raw);

    if (!raw) return showError("Please enter a video URL", "error", false);

    // Handle batch mode - multiple URLs separated by newlines
    if (batchUrlMode) {
      const urls = raw.split('\n').map(u => u.trim()).filter(u => u.length > 0);

      if (urls.length === 0) {
        return showError("Please enter at least one URL", "error", false);
      }

      // Validate all URLs first
      const invalidUrls = urls.filter(u => !isFacebookUrl(u));
      if (invalidUrls.length > 0) {
        return showError(`${invalidUrls.length} invalid Facebook URL(s) found. Please check your URLs.`, "error", false);
      }

      // Add all URLs to queue
      let addedCount = 0;
      let duplicateCount = 0;
      let firstNewItem = null;

      urls.forEach(rawUrl => {
        const url = normalizeFacebookUrl(rawUrl);

        if (!videoLinks.some((v) => v.url === url)) {
          const newItem = {
            id: Date.now() + Math.random(),
            url,
            addedAt: new Date().toISOString(),
          };

          setVideoLinks((prev) => [newItem, ...prev]);
          addedCount++;

          // Save the first video item for auto-extract
          if (addedCount === 1) {
            firstNewItem = newItem;
          }

          addToRecentUrls(url);
        } else {
          duplicateCount++;
        }
      });

      setVideoUrl("");

      if (addedCount > 0) {
        showToast(`Added ${addedCount} video${addedCount > 1 ? 's' : ''} to queue${duplicateCount > 0 ? ` (${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''} skipped)` : ''}`, 'success', 3000);

        // Auto-extract the first video if enabled (force extract to show animation)
        if (autoExtract && firstNewItem) {
          setTimeout(() => {
            setCurrentVideo(firstNewItem);
            setTimeout(() => {
              extractAndPlayVideo(true);
            }, 50);
          }, 500);
        } else if (firstNewItem) {
          setCurrentVideo(firstNewItem);
        }
      } else {
        showError("All URLs were already in the queue", "info", false);
      }

      return;
    }

    // Single URL mode (existing logic)
    if (!isFacebookUrl(raw)) {
      return showError("Invalid Facebook URL. Please paste a Facebook link.", "error", false);
    }

    const url = normalizeFacebookUrl(raw);
    console.log('[Add Video] Normalized URL:', url);

    if (videoLinks.some((v) => v.url === url)) {
      return showError("This link is already added", "error", false);
    }

    const newItem = {
      id: Date.now() + Math.random(),
      url,
      addedAt: new Date().toISOString(),
    };

    console.log('[Add Video] Adding video:', newItem);
    setVideoLinks((prev) => [newItem, ...prev]);
    setVideoUrl("");
    setError({ message: "", type: "info" });
    addToRecentUrls(url);

    // Auto-extract if enabled (force extract to show animation)
    console.log('[Add Video] Auto-extract enabled:', autoExtract);
    if (autoExtract) {
      showToast('Auto-extracting video...', 'info', 2000);

      // Set current video and extract in same callback to ensure state is updated
      setCurrentVideo(newItem);

      // Use a ref to ensure we extract the correct video
      pendingExtractUrlRef.current = url;

      setTimeout(() => {
        console.log('[Add Video] Calling extractAndPlayVideo...');
        // Update currentVideo state before extracting
        setCurrentVideo(newItem);
        // Small delay to ensure state is updated
        setTimeout(() => {
          extractAndPlayVideo(true);
        }, 50);
      }, 100);
    } else {
      setCurrentVideo(newItem);
    }
  };

  const removeVideo = (id) => {
    setVideoLinks((prev) => prev.filter((v) => v.id !== id));
    if (currentVideo?.id === id) {
      const remaining = videoLinks.filter(v => v.id !== id);
      setCurrentVideo(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
    setError({ message: "", type: "info" });
    addToHistory(video);
  };

  const playDirectUrl = () => {
    if (!directUrlInput.trim()) {
      showError("Please enter a video URL", "error");
      return;
    }

    if (!isValidVideoUrl(directUrlInput)) {
      showError("Invalid video URL. Please enter a valid direct video URL (.mp4, .webm, etc.) or a video hosting URL.", "error");
      return;
    }

    const video = {
      id: Date.now(),
      url: directUrlInput,
      directVideoUrl: directUrlInput,
      availableFormats: [{
        formatId: 0,
        quality: 'Direct',
        label: 'Direct URL',
        url: directUrlInput,
        type: 'video/mp4'
      }]
    };

    setCurrentVideo(video);
    addToHistory(video);
    setShowDirectUrlModal(false);
    setDirectUrlInput("");
    showError("Playing direct video URL!", "success", false);
  };

  const playNextVideo = () => {
    const currentIndex = videoLinks.findIndex(v => v.id === currentVideo?.id);
    if (currentIndex < videoLinks.length - 1) {
      const next = videoLinks[currentIndex + 1];
      setCurrentVideo(next);
      addToHistory(next);
    }
  };

  // Play video from history progress
  const playFromHistory = (url) => {
    const progress = videoProgress[url];
    console.log("playFromHistory called for:", url);
    console.log("Progress:", progress);

    const video = {
      id: Date.now(),
      url: url,
      availableFormats: []
    };

    // Try to get cached video first
    const cached = getCachedVideo(url);
    console.log("Cached video:", cached);

    if (cached && cached.formats && cached.formats.length > 0) {
      // Find the best quality format from cached formats
      const hdFormat = cached.formats.find(f => f.quality === 'HD') || cached.formats[0];
      video.directVideoUrl = hdFormat.url;
      video.availableFormats = cached.formats;
      console.log("Using cached URL:", video.directVideoUrl);
      // Set pending seek position for cached videos
      if (progress && progress.timestamp > 0) {
        pendingSeekRef.current = progress.timestamp;
        console.log("Set pending seek to:", progress.timestamp);
      }
      setCurrentVideo(video);
      addToHistory(video);
      setCurrentView('home');
      lastVideoUrlRef.current = url;
    } else {
      // No cache - set pending seek BEFORE extraction
      console.log("No cache found, triggering extraction");
      if (progress && progress.timestamp > 0) {
        pendingSeekRef.current = progress.timestamp;
        console.log("Set pending seek to:", progress.timestamp);
      }
      // Set video without directVideoUrl to trigger extraction
      setCurrentVideo(video);
      addToHistory(video);
      setCurrentView('home');
      lastVideoUrlRef.current = url;
      // Auto-extract (pendingSeekRef is already set)
      setTimeout(() => {
        extractAndPlayVideo();
      }, 100);
    }
  };

  // Delete video from history
  const deleteFromHistory = (url) => {
    setVideoProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[url];
      return newProgress;
    });
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Video cache helpers
  const getCachedVideo = (url) => {
    try {
      const cacheKey = `fb_video_cache_${btoa(url)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is still valid (7 days)
        const cacheAge = Date.now() - data.timestamp;
        if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
          return data;
        }
        // Cache expired, remove it
        localStorage.removeItem(cacheKey);
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  };

  const setCachedVideo = (url, formats, title) => {
    const cacheKey = `fb_video_cache_${btoa(url)}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        url,
        formats,
        title,
        timestamp: Date.now()
      }));
    } catch (e) {
      // If storage is full, clear old cache entries
      if (e.name === 'QuotaExceededError') {
        clearOldCache();
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            url,
            formats,
            title,
            timestamp: Date.now()
          }));
        } catch {
          // Ignore if still can't save after clearing cache
        }
      }
    }
  };

  const clearOldCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('fb_video_cache_')) {
          const data = JSON.parse(localStorage.getItem(key));
          const cacheAge = Date.now() - data.timestamp;
          // Remove entries older than 7 days
          if (cacheAge > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch {
      // Ignore localStorage errors
    }
  };

  const getCachedVideosCount = () => {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter(k => k.startsWith('fb_video_cache_')).length;
    } catch {
      // Ignore localStorage errors
    }
    return 0;
  };

  const loadCachedVideos = () => {
    try {
      const keys = Object.keys(localStorage);
      const videos = keys
        .filter(k => k.startsWith('fb_video_cache_'))
        .map(k => {
          const data = JSON.parse(localStorage.getItem(k));
          return {
            url: data.url,
            title: data.title,
            formats: data.formats,
            timestamp: data.timestamp,
            cacheAge: Date.now() - data.timestamp
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);
      setCachedVideos(videos);
    } catch {
      // Ignore localStorage errors
    }
  };

  const clearAllCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('fb_video_cache_')) {
          localStorage.removeItem(key);
        }
      });
      setCachedVideos([]);
      showError("All cache cleared!", "success", false);
    } catch {
      // Ignore localStorage errors
    }
  };

  const extractAndPlayVideo = async (forceExtract = false) => {
    if (!currentVideo) return;

    // Check cache first (unless forceExtract is true)
    if (!forceExtract) {
      const cached = getCachedVideo(currentVideo.url);
      if (cached && cached.formats && cached.formats.length > 0) {
        const hdFormat = cached.formats.find(f => f.quality === 'HD') || cached.formats[0];
        const title = cached.title;

        // Update currentVideo
        setCurrentVideo(prev => ({
          ...prev,
          directVideoUrl: hdFormat.url,
          availableFormats: cached.formats,
          title: title || prev.title
        }));

        // Update videoLinks with title
        if (title) {
          setVideoLinks(prev => prev.map(v =>
            v.url === currentVideo.url ? { ...v, title } : v
          ));
        }

        // Update watchHistory with title
        if (title) {
          setWatchHistory(prev => prev.map(v =>
            v.url === currentVideo.url ? { ...v, title } : v
          ));
        }

        // Update favorites with title
        if (title) {
          setFavorites(prev => prev.map(v =>
            v.url === currentVideo.url ? { ...v, title } : v
          ));
        }

        showError(`Loaded from cache! Playing in ${hdFormat.label || 'HD'}`, "success", false);
        return;
      }
    }

    setIsExtracting(true);
    setError({ message: "", type: "info" });

    // Start progress simulation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 90) progress = 90;
      setExtractionProgress({
        percentage: Math.floor(progress),
        step: progress < 20 ? 'Connecting...' : progress < 50 ? 'Analyzing...' : progress < 80 ? 'Extracting...' : 'Processing...',
        detail: progress < 20 ? 'Connecting to Facebook servers' : progress < 50 ? 'Analyzing video URL' : progress < 80 ? 'Extracting video formats' : 'Processing HD quality'
      });
    }, 500);

    try {
      const authParam = useAuthMode && isAuthenticated ? '&auth=true' : '';
      const apiUrl = `${getBackendUrl()}/api/extract?url=${encodeURIComponent(currentVideo.url)}${authParam}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Make sure the backend server is running.');
        }
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || data?.message || `Server error (${response.status})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      if (!data.formats || data.formats.length === 0) {
        throw new Error('No video formats found. The video may be private or deleted.');
      }

      const hdFormat = data.formats.find(f => f.quality === 'HD') || data.formats[0];
      const title = data.title;

      console.log('[Frontend] Title received:', title);
      console.log('[Frontend] Current video URL:', currentVideo.url);
      console.log('[Frontend] Current videoLinks:', videoLinks.map(v => ({ url: v.url, hasTitle: !!v.title, title: v.title })));

      // Update currentVideo
      setCurrentVideo(prev => ({
        ...prev,
        directVideoUrl: hdFormat.url,
        availableFormats: data.formats,
        title: title || prev.title
      }));

      // Save to cache
      setCachedVideo(currentVideo.url, data.formats, title);

      // Update videoLinks with title
      if (title) {
        setVideoLinks(prev => {
          const updated = prev.map(v =>
            v.url === currentVideo.url ? { ...v, title } : v
          );
          console.log('[Frontend] Updated videoLinks:', updated.map(v => ({ url: v.url, hasTitle: !!v.title, title: v.title })));
          return updated;
        });
      }

      // Update watchHistory with title
      if (title) {
        setWatchHistory(prev => prev.map(v =>
          v.url === currentVideo.url ? { ...v, title } : v
        ));
      }

      // Update favorites with title
      if (title) {
        setFavorites(prev => prev.map(v =>
          v.url === currentVideo.url ? { ...v, title } : v
        ));
      }

      console.log('[Frontend] Extraction complete, title:', title);
      console.log('[Frontend] Current watchHistory:', watchHistory.map(v => ({ url: v.url, hasTitle: !!v.title, title: v.title })));

      // Complete progress
      clearInterval(progressInterval);
      setExtractionProgress({ percentage: 100, step: 'Complete!', detail: 'Video ready to play' });
      setTimeout(() => setExtractionProgress(null), 1000);

      showError(`Video extracted! Playing in ${hdFormat.label || 'HD'}`, "success", false);

    } catch (err) {
      console.error("Extract error:", err);

      // Clear progress on error
      clearInterval(progressInterval);
      setExtractionProgress(null);

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError("Backend server not running. Start it with: npm run server", "error", false);
      } else if (err.message.includes('Aborted') || err.message.includes('timeout')) {
        showError("Request timed out. Facebook may be slow. Try again.", "error", false);
      } else {
        showError(`Could not extract: ${err.message}`, "error", false);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const togglePlay = () => {
    if (!videoPlayerRef.current) return;
    const video = videoPlayerRef.current;

    // Check if video has a valid source
    if (!video.src || video.readyState === 0) {
      console.error("No valid video source");
      return;
    }

    if (video.paused) {
      video.play().catch(err => {
        console.error("Play error:", err);
      });
    } else {
      video.pause();
    }
  };

  const seekVideo = (seconds) => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.currentTime += seconds;
  };

  const seekPercentage = (percent) => {
    if (!videoPlayerRef.current || !duration) return;
    videoPlayerRef.current.currentTime = (percent / 100) * duration;
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.volume = newVolume;
      videoPlayerRef.current.muted = newVolume === 0;
    }
    // Update previousVolumeRef for unmuting (only when not muting to 0)
    if (newVolume > 0) {
      previousVolumeRef.current = newVolume;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      changeVolume(previousVolumeRef.current || 0.4);
    } else {
      previousVolumeRef.current = volume;
      changeVolume(0);
    }
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = speed;
    }
    setShowSpeedSelector(false);
  };

  const toggleFullscreen = async () => {
    if (!videoPlayerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      // Restore portrait mode on exit
      try {
        if (screen.orientation && screen.orientation.unlock) {
          await screen.orientation.unlock();
        }
      } catch (e) {
        // Ignore if orientation API not supported
      }
    } else {
      const container = videoPlayerRef.current.parentElement;
      if (container) {
        await container.requestFullscreen();
        // Request landscape mode on mobile
        try {
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
          }
        } catch (e) {
          // Ignore if orientation API not supported or denied
          console.log('Orientation lock not supported or denied');
        }
        // Hide controls when entering fullscreen if playing (YouTube-style)
        if (isPlaying) {
          setControlsVisible(false);
        }
      }
    }
  };

  // Handle touch events for swipe gestures (brightness/volume)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const halfWidth = screenWidth / 2;

    swipeGestureRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      type: touch.clientX < halfWidth ? 'brightness' : 'volume',
      initialValue: touch.clientX < halfWidth ? brightness : volume,
    };

    setShowSwipeIndicator(true);
    setSwipeIndicatorType(touch.clientX < halfWidth ? 'brightness' : 'volume');
    setSwipeIndicatorValue(touch.clientX < halfWidth ? brightness : volume * 100);
  };

  const handleTouchMove = (e) => {
    if (!swipeGestureRef.current.active) return;

    const touch = e.touches[0];
    const deltaY = swipeGestureRef.current.startY - touch.clientY;
    const deltaYPercent = (deltaY / window.innerHeight) * 200;

    const newValue = Math.max(0, Math.min(100, swipeGestureRef.current.initialValue + deltaYPercent));

    if (swipeGestureRef.current.type === 'brightness') {
      const newBrightness = Math.round(newValue);
      setBrightness(newBrightness);
      setSwipeIndicatorValue(newBrightness);
      // Apply brightness to video
      if (videoPlayerRef.current) {
        videoPlayerRef.current.style.filter = `brightness(${newBrightness}%)`;
      }
    } else {
      const newVolume = Math.round(newValue) / 100;
      setVolume(newVolume);
      setSwipeIndicatorValue(newVolume * 100);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.volume = newVolume;
        videoPlayerRef.current.muted = newVolume === 0;
      }
    }
  };

  const handleTouchEnd = () => {
    swipeGestureRef.current.active = false;
    setTimeout(() => {
      setShowSwipeIndicator(false);
    }, 500);
  };

  const toggleControlsVisibility = () => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Toggle controls
    setControlsVisible(prev => {
      const newState = !prev;

      // If showing controls, auto-hide after 3 seconds
      if (newState) {
        controlsTimeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }

      return newState;
    });
  };

  // Video player hover handlers for auto-hiding controls
  const handleVideoMouseEnter = () => {
    // Show controls on hover
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setControlsVisible(true);
  };

  const handleVideoMouseLeave = () => {
    // Hide controls when mouse leaves (only if playing)
    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 500);
    }
  };

  const handleVideoMouseMove = () => {
    // Keep controls visible while mouse is moving, reset auto-hide timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setControlsVisible(true);

    // Auto-hide after 2 seconds of no mouse movement (only if playing)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    }
  };

  // Auto-hide controls when playing in fullscreen (YouTube-style behavior)
  useEffect(() => {
    // Handle fullscreen state changes
    if (isFullscreen) {
      // When paused, show controls
      if (!isPlaying) {
        setControlsVisible(true);
      } else {
        // When playing in fullscreen, hide controls initially (hover will show them)
        setControlsVisible(false);
      }
    }
    // Note: When NOT in fullscreen, controls are managed by hover handlers

    return () => {
      // Don't clear timeout here - let toggleControlsVisibility manage it
    };
  }, [isFullscreen, isPlaying]);

  // Initialize controls as visible when video loads, then let hover behavior manage it
  useEffect(() => {
    if (currentVideo?.directVideoUrl) {
      setControlsVisible(true);
      // Auto-hide after 3 seconds if playing
      if (isPlaying) {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo?.directVideoUrl]);

  const togglePiP = async () => {
    if (!videoPlayerRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoPlayerRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  const captureScreenshot = () => {
    if (!videoPlayerRef.current) return;

    const video = videoPlayerRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showError("Screenshot saved!", "success");
    } catch {
      // Fallback for CORS issues with cross-origin videos
      showError("Screenshot blocked by browser (CORS). Use Print Screen or Snipping Tool instead.", "warning");
    }
  };

  const shareVideo = async () => {
    if (!currentVideo) return;

    const shareData = {
      title: 'Facebook Video',
      text: 'Check out this Facebook video',
      url: currentVideo.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showError("Shared successfully!", "success");
      } else {
        await copyToClipboard(currentVideo.url);
        showError("Link copied to clipboard!", "success");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const directDownloadVideo = async (specificUrl = null, specificTitle = null) => {
    const videoUrl = specificUrl || currentVideo?.directVideoUrl;
    if (!videoUrl) return;

    const title = specificTitle || currentVideo?.title || 'facebook-video';
    const cleanTitle = title.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const filename = `${cleanTitle}-${Date.now()}.mp4`;

    // Use backend proxy to download
    const downloadUrl = `${getBackendUrl()}/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      showError("Starting download...", "info");

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to fetch video');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (total > 0) {
          const progress = Math.round((receivedLength / total) * 100);
          setDownloadProgress(progress);
        }
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      showError("Download complete!", "success");
    } catch (err) {
      console.error("Download error:", err);
      // Fallback: open download URL in new tab
      window.open(downloadUrl, '_blank');
      showError("Download failed. Opening in new tab instead.", "warning");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const getQualityLabel = (format) => {
    if (!format) return '1080p';
    // Check URL for specific resolution indicators first (most accurate)
    if (format.url) {
      if (format.url.includes('1080')) return '1080p';
      if (format.url.includes('720')) return '720p';
      if (format.url.includes('480')) return '480p';
      if (format.url.includes('360')) return '360p';
    }
    // Map quality field to resolution
    if (format.quality === 'HD') return '1080p';
    if (format.quality === 'SD') return '480p';
    if (format.quality === 'unknown') return '480p';
    // Fallback to label or quality
    if (format.label && format.label.includes('1080')) return '1080p';
    if (format.label && format.label.includes('720')) return '720p';
    if (format.label && format.label.includes('480')) return '480p';
    return '1080p'; // Default to HD
  };

  const getEstimatedSize = (url) => {
    if (url.includes('1080') || url.includes('hd')) return '~50-100 MB';
    if (url.includes('720')) return '~30-60 MB';
    if (url.includes('480') || url.includes('sd')) return '~10-30 MB';
    return '~20-80 MB';
  };

  const resumeFromSaved = () => {
    if (resumeTime && videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = resumeTime;
    }
    setShowResumePrompt(false);
  };

  const startFromBeginning = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = 0;
    }
    setShowResumePrompt(false);
  };

  const onUrlKeyDown = (e) => {
    if (e.key === "Enter") addVideoLink();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showError("Link copied!", "success");
    } catch {
      showError("Copy failed - browser blocked", "error");
    }
  };

  // NEW: Toast notification function
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = toastIdRef.current++;
    const toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  };

  // NEW: Add URL to recent history
  const addToRecentUrls = (url) => {
    if (!url || url.length < 10) return;

    setRecentUrls(prev => {
      const filtered = prev.filter(u => u !== url);
      const updated = [url, ...filtered].slice(0, 10); // Keep only 10 most recent
      localStorage.setItem('recentUrls', JSON.stringify(updated));
      return updated;
    });
  };

  // NEW: Add to download history
  const addToDownloadHistory = (video) => {
    const entry = {
      id: Date.now(),
      url: video.url,
      title: video.title || 'Facebook Video',
      thumbnail: video.thumbnail || null,
      quality: video.quality || 'HD',
      timestamp: new Date().toISOString(),
    };

    setDownloadHistory(prev => {
      const filtered = prev.filter(d => d.url !== entry.url);
      const updated = [entry, ...filtered].slice(0, 50); // Keep 50 most recent
      localStorage.setItem('downloadHistory', JSON.stringify(updated));
      return updated;
    });
  };

  // NEW: Share video functionality
  const shareVideoToSocial = async (platform, videoData) => {
    const url = window.location.href;
    const text = `Watch this Facebook video: ${videoData.title || 'Video'}`;
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      await copyToClipboard(url);
      showToast('Link copied to clipboard!', 'success');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      showToast(`Opening ${platform}...`, 'info');
    }
  };

  // NEW: Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're actually leaving the drag zone
    if (e.relatedTarget === null || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const text = e.dataTransfer.getData('text');
    if (text && text.includes('facebook')) {
      setVideoUrl(text);
      addToRecentUrls(text);
      showToast('URL dropped! Click "Extract & Play" to continue.', 'success');
    } else {
      showToast('Please drop a valid Facebook URL', 'error');
    }
  };

  // NEW: Handle paste event for auto-paste
  const handlePaste = async (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.includes('facebook')) {
      setVideoUrl(pastedText);
      addToRecentUrls(pastedText);
      showToast('URL pasted!', 'success');
    }
  };

  // Filter videos based on search
  const filteredVideos = videoLinks.filter(v =>
    v.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Persist videoLinks to localStorage
  useEffect(() => {
    localStorage.setItem('fbVideoQueue', JSON.stringify(videoLinks));
  }, [videoLinks]);

  // Persist currentVideo to localStorage
  useEffect(() => {
    if (currentVideo) {
      localStorage.setItem('currentVideo', JSON.stringify(currentVideo));
    } else {
      localStorage.removeItem('currentVideo');
    }
  }, [currentVideo]);

  // Auto-extract when initialUrl is provided (from Player page)
  useEffect(() => {
    if (initialUrl && !autoExtractPendingRef.current) {
      autoExtractPendingRef.current = true;

      // Normalize the URL
      let url = initialUrl.trim();
      if (url.includes('fb.watch')) {
        url = url.replace('fb.watch/', 'facebook.com/watch/');
      }
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      // Add the video to the queue
      const newItem = {
        id: Date.now().toString(),
        url: url,
        addedAt: new Date().toISOString()
      };

      setVideoLinks(prev => {
        // Check if URL already exists
        if (prev.some(v => v.url === url)) {
          return prev;
        }
        return [newItem, ...prev];
      });

      // Set as current video and extract after state updates
      setCurrentVideo(newItem);

      // Auto-extract after state is updated (force extraction to show animation)
      setTimeout(() => {
        setCurrentVideo(newItem); // Ensure it's set
        setTimeout(() => {
          extractAndPlayVideo(true);
        }, 50);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Toast Notification */}
      {error.message && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm animate-slide-in ${
          error.type === 'success' ? 'bg-green-500' :
          error.type === 'info' ? 'bg-blue-500' :
          'bg-red-500'
        } text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3`}>
          <span className="text-sm font-medium">{error.message}</span>
          <button
            onClick={dismissError}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <div className="fixed top-20 right-4 z-50 w-72 bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Downloading...</span>
            <span className="text-xs text-gray-400">{downloadProgress !== null ? `${downloadProgress}%` : 'Loading...'}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: downloadProgress !== null ? `${downloadProgress}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* NEW: Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-in ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              'bg-blue-500'
            } text-white`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-1 hover:bg-white/20 rounded-lg transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* NEW: Drag and Drop Overlay */}
      {isDragging && (
        <div
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="fixed inset-0 z-[90] bg-indigo-500/90 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center text-white">
            <DownloadCloud className="w-20 h-20 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Drop Facebook URL Here</h2>
            <p className="text-white/80">Drag and drop a Facebook video link to extract</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${darkMode ? 'bg-gradient-to-r from-gray-800/90 via-slate-800/90 to-gray-800/90 backdrop-blur-lg border-gray-700' : 'bg-gradient-to-r from-white/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-lg border-indigo-100'} border-b shadow-lg shadow-indigo-500/5 lg:sticky lg:top-0 z-40 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>FB Video Player</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Extract & Play in HD</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stats Badge - Desktop only */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 ${darkMode ? 'border border-indigo-500/30' : 'border border-indigo-200'}`}>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{totalWatched} watched</span>
            </div>

            {/* History Button - Desktop only */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`hidden sm:flex p-2 min-w-[44px] min-h-[44px] rounded-xl transition items-center justify-center border border-transparent relative ${showHistory ? 'bg-indigo-600 text-white border-indigo-600' : (darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300')}`}
              title="Watch History"
            >
              <History className="w-4 h-4" />
              {watchHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                  {watchHistory.length}
                </span>
              )}
            </button>

            {/* Direct URL Button - Always visible */}
            <button
              onClick={() => setShowDirectUrlModal(true)}
              className={`p-2 min-w-[44px] min-h-[44px] rounded-xl transition flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg hover:scale-105 transform`}
              title="Paste Direct Video URL"
            >
              <Link2 className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>

            {/* Favorites Button - Desktop only */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`hidden sm:flex p-2 min-w-[44px] min-h-[44px] rounded-xl transition items-center justify-center border border-transparent relative ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-red-400 border-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-red-500 border-gray-300'}`}
              title="Favorites"
            >
              <Heart className="w-4 h-4" fill={favorites.length > 0 ? "currentColor" : "none"} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cache Button - Desktop only */}
            <button
              onClick={() => {
                loadCachedVideos();
                setShowCacheModal(true);
              }}
              className={`hidden sm:flex p-2 min-w-[44px] min-h-[44px] rounded-xl transition items-center justify-center border border-transparent relative ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-blue-400 border-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-blue-500 border-gray-300'}`}
              title="Video Cache"
            >
              <Zap className="w-4 h-4" />
              {getCachedVideosCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                  {getCachedVideosCount()}
                </span>
              )}
            </button>

            {/* NEW: Keyboard Shortcuts Help - Desktop only */}
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className={`hidden sm:flex p-2 min-w-[44px] min-h-[44px] rounded-xl transition items-center justify-center border border-transparent ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-purple-400 border-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-purple-500 border-gray-300'}`}
              title="Keyboard Shortcuts (K)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* NEW: FAQ/Help - Desktop only */}
            <button
              onClick={() => setShowFaq(true)}
              className={`hidden sm:flex p-2 min-w-[44px] min-h-[44px] rounded-xl transition items-center justify-center border border-transparent ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-cyan-400 border-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-cyan-500 border-gray-300'}`}
              title="Help & FAQ"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button - Mobile/Tablet only */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`sm:hidden p-2 min-w-[44px] min-h-[44px] rounded-xl transition flex items-center justify-center shadow-md ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle - Always visible */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 min-w-[44px] min-h-[44px] rounded-xl transition flex items-center justify-center shadow-md hover:shadow-lg ${darkMode ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'}`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 sm:w-4 sm:h-4" /> : <Moon className="w-5 h-5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Rendered at root level to avoid positioning issues */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[200] sm:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />

          {/* Dropdown content - compact size */}
          <div className="absolute left-4 right-4 top-20">
            <div className="rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto border">
              <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2`}>
                <div className="p-4">
                  {/* Header with Close button */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h3>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 ${darkMode ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'}`}>
                    <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{totalWatched} watched</span>
                  </div>

                  {/* History */}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowHistory(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition mb-2 ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                  >
                    <History className="w-5 h-5 flex-shrink-0 text-current" />
                    <span className="text-sm font-medium">Watch History</span>
                    {watchHistory.length > 0 && (
                      <span className="ml-auto min-w-[24px] h-6 px-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                        {watchHistory.length}
                      </span>
                    )}
                  </button>

                  {/* Favorites */}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowFavorites(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition mb-2 ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                  >
                    <Heart className="w-5 h-5 flex-shrink-0 text-current" fill={favorites.length > 0 ? "currentColor" : "none"} />
                    <span className="text-sm font-medium">Favorites</span>
                    {favorites.length > 0 && (
                      <span className="ml-auto min-w-[24px] h-6 px-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                        {favorites.length}
                      </span>
                    )}
                  </button>

                  {/* Cache */}
                  <button
                    onClick={() => {
                      loadCachedVideos();
                      setShowMobileMenu(false);
                      setShowCacheModal(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition mb-2 ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                  >
                    <Zap className="w-5 h-5 flex-shrink-0 text-current" />
                    <span className="text-sm font-medium">Video Cache</span>
                    {getCachedVideosCount() > 0 && (
                      <span className="ml-auto min-w-[24px] h-6 px-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                        {getCachedVideosCount()}
                      </span>
                    )}
                  </button>

                  {/* Facebook Login */}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowLoginModal(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                  >
                    <span className="text-xl flex-shrink-0">📘</span>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium block">Facebook Login</span>
                      <span className={`text-xs ${isAuthenticated ? 'text-green-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {isAuthenticated ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </button>

                  {/* Use Auth Toggle - Only show when authenticated */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setUseAuthMode(!useAuthMode);
                        setShowMobileMenu(false);
                        showError(useAuthMode ? 'Auth mode disabled' : 'Auth mode enabled for private videos', 'success');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                    >
                      <span className="flex-1 text-left text-sm font-medium">
                        Use for private videos
                      </span>
                      <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${useAuthMode ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useAuthMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </button>
                  )}

                  {/* Logout - Only show when authenticated */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    >
                      <span className="text-sm font-medium">Logout from Facebook</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
          <div className={`relative w-full sm:w-80 h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-y-auto`}>
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-inherit flex items-center justify-between">
              <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <History className="w-5 h-5" />
                Watch History
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {watchHistory.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No watch history yet</p>
              ) : (
                watchHistory.map((video, index) => {
                  const displayTitle = video.title || (video.url.includes("/reel/") ? 'Facebook Reel' : 'Facebook Video');
                  // Debug logging for history
                  if (index === 0) {
                    console.log('[History Display] First video:', { url: video.url, hasTitle: !!video.title, title: video.title, displayTitle });
                  }
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setCurrentVideo(video);
                        setShowHistory(false);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition border ${darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-100'}`}
                    >
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`} title={displayTitle}>
                        {displayTitle}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{video.url}</p>
                        <p className="text-xs text-gray-400">{new Date(video.watchedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Sidebar */}
      {showFavorites && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFavorites(false)} />
          <div className={`relative w-full sm:w-80 h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-y-auto`}>
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-inherit flex items-center justify-between">
              <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Heart className="w-5 h-5 text-red-500" />
                Favorites
              </h2>
              <button onClick={() => setShowFavorites(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {favorites.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No favorites yet</p>
              ) : (
                favorites.map((video, index) => {
                  const displayTitle = video.title || (video.url.includes("/reel/") ? 'Facebook Reel' : 'Facebook Video');
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-xl cursor-pointer transition border ${darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-100'} flex items-center justify-between group`}
                    >
                      <div className="flex-1 min-w-0" onClick={() => {
                        setCurrentVideo(video);
                        setShowFavorites(false);
                      }}>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`} title={displayTitle}>
                          {displayTitle}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{video.url}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(video);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Remove from favorites"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Direct URL Modal */}
      {showDirectUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDirectUrlModal(false)} />
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Link2 className="w-5 h-5 text-green-500" />
                Paste Direct Video URL
              </h2>
              <button onClick={() => setShowDirectUrlModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Paste a direct video URL from IDM, browser DevTools, or any source. Supports .mp4, .webm, and other video formats.
            </p>

            <input
              type="text"
              value={directUrlInput}
              onChange={(e) => setDirectUrlInput(e.target.value)}
              placeholder="https://scontent.fdac207-1.fna.fbcdn.net/o1/v/t2/f366/..."
              className={`w-full px-4 py-3 rounded-xl outline-none border-2 mb-4 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500'
              }`}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={playDirectUrl}
                disabled={!directUrlInput.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Play className="w-4 h-4" />
                Play Video
              </button>
              <button
                onClick={() => {
                  setShowDirectUrlModal(false);
                  setDirectUrlInput("");
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </button>
            </div>

            {/* Instructions */}
            <div className={`mt-4 p-3 rounded-lg text-xs ${darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-green-50 text-green-700'}`}>
              <p className="font-semibold mb-1">How to get direct video URLs:</p>
              <ul className="space-y-1">
                <li>• <strong>IDM:</strong> Click the video download button in IDM</li>
                <li>• <strong>DevTools:</strong> Open Network tab, refresh, filter by ".mp4"</li>
                <li>• <strong>Any source:</strong> Paste any direct video URL</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLoginModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <span className="text-2xl">📘</span>
                Login to Facebook
              </h2>
              <button onClick={() => setShowLoginModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Login to access private Facebook videos with yt-dlp authentication.
            </p>

            {/* Tabs for login options */}
            <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setLoginEmail('')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  !loginEmail ? (darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow') : (darkMode ? 'text-gray-400' : 'text-gray-500')
                }`}
              >
                Manual Login
              </button>
              <button
                onClick={() => setLoginEmail(' ')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  loginEmail ? (darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow') : (darkMode ? 'text-gray-400' : 'text-gray-500')
                }`}
              >
                Credentials
              </button>
            </div>

            {!loginEmail ? (
              // Manual Login
              <div>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click the button below to open a browser window. Log in to Facebook manually, and the browser will close automatically when done.
                </p>
                <button
                  onClick={() => handleLogin(true)}
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Opening browser...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Open Browser to Login
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Credentials Login
              <div>
                <div className="space-y-4 mb-4">
                  <input
                    type="email"
                    value={loginEmail.trim() || ''}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email or Phone"
                    className={`w-full px-4 py-3 rounded-xl outline-none border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(false)}
                    className={`w-full px-4 py-3 rounded-xl outline-none border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                  />
                </div>
                <button
                  onClick={() => handleLogin(false)}
                  disabled={isLoggingIn || !loginEmail.trim() || !loginPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login to Facebook'
                  )}
                </button>
              </div>
            )}

            <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Your credentials are stored locally and only used to authenticate with Facebook via yt-dlp.
            </p>
          </div>
        </div>
      )}

      {/* Cache Modal */}
      {showCacheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCacheModal(false)} />
          <div className={`relative w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                <Zap className="w-5 h-5 text-blue-500" />
                Video Cache ({cachedVideos.length})
              </h2>
              <button onClick={() => setShowCacheModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Extracted videos are cached for 7 days. Re-extracting the same video will load instantly from cache.
            </p>

            <div className="flex-1 overflow-y-auto mb-4">
              {cachedVideos.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-8">No cached videos yet</p>
              ) : (
                <div className="space-y-2">
                  {cachedVideos.map((video, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`} title={video.title}>
                        {video.title || 'Facebook Video'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{video.url}</p>
                        <p className="text-xs text-gray-400">
                          {video.cacheAge < 60000 ? 'Just now' :
                           video.cacheAge < 3600000 ? `${Math.floor(video.cacheAge / 60000)}m ago` :
                           video.cacheAge < 86400000 ? `${Math.floor(video.cacheAge / 3600000)}h ago` :
                           `${Math.floor(video.cacheAge / 86400000)}d ago`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {cachedVideos.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Clear all ${cachedVideos.length} cached videos?`)) {
                      clearAllCache();
                    }
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Clear Cache
                </button>
              )}
              <button
                onClick={() => setShowCacheModal(false)}
                className={`flex-1 px-4 py-2 rounded-xl font-semibold transition ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Player Mode - Mobile Menu Button */}
        {playerMode && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Settings className="w-5 h-5" />
              {showMobileMenu ? 'Hide Options' : 'Show Options'}
            </button>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className={`mt-3 rounded-2xl shadow-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Add New Video */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Video</h3>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste Facebook URL..."
                    className={`w-full px-4 py-3 rounded-xl border-2 mb-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                    } outline-none transition`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addVideoLink();
                        setShowMobileMenu(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      addVideoLink();
                      setShowMobileMenu(false);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition"
                  >
                    Add & Extract
                  </button>
                </div>

                {/* Queue */}
                {videoLinks.length > 0 && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Queue ({videoLinks.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {videoLinks.slice(0, 5).map((video, index) => (
                        <div
                          key={video.id}
                          onClick={() => {
                            playVideo(video);
                            setShowMobileMenu(false);
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition ${
                            currentVideo?.id === video.id
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                              : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {video.title || `Video ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Options */}
                {currentVideo?.availableFormats && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quality</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {currentVideo.availableFormats.map((format) => (
                        <button
                          key={format.formatId}
                          onClick={() => {
                            setCurrentVideo(prev => ({ ...prev, directVideoUrl: format.url }));
                            setShowMobileMenu(false);
                          }}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                            currentVideo.directVideoUrl === format.url
                              ? 'bg-indigo-600 text-white'
                              : darkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {format.label || format.quality}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="p-4">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (videoPlayerRef.current) {
                          videoPlayerRef.current.playbackRate = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                          setPlaybackSpeed(playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1);
                        }
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-3 px-4 rounded-lg text-left flex items-center gap-3 transition ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      <Gauge className="w-5 h-5 text-indigo-500" />
                      <span>Speed: {playbackSpeed}x</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleMute();
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-3 px-4 rounded-lg text-left flex items-center gap-3 transition ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-red-500" />}
                      <span>Volume: {Math.round(volume * 100)}%</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleFavorite(currentVideo);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-3 px-4 rounded-lg text-left flex items-center gap-3 transition ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(currentVideo?.url) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                      <span>{isFavorite(currentVideo?.url) ? 'Remove Favorite' : 'Add Favorite'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setDarkMode(!darkMode);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-3 px-4 rounded-lg text-left flex items-center gap-3 transition ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className={`w-full py-3 px-4 rounded-lg text-left flex items-center gap-3 transition ${
                        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      <Home className="w-5 h-5 text-indigo-500" />
                      <span>Back to Home</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Home Page - Always shown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Hidden on mobile in player mode */}
            <div className={`${compactMode ? 'hidden lg:block lg:col-span-1' : 'lg:col-span-1'} ${playerMode ? 'hidden lg:block' : ''}`}>
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-slate-900' : 'bg-gradient-to-br from-white to-indigo-50/50'} rounded-2xl shadow-xl shadow-indigo-500/10 ${compactMode ? 'p-3' : 'p-6'} sticky top-24 transition-all duration-300 border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                    <Link2 className="w-4 h-4 text-white" />
                  </div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Video</h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Compact Mode Toggle (Desktop) */}
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    className={`hidden lg:flex p-2 rounded-lg transition ${compactMode ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : (darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}`}
                    title="Toggle compact mode"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  {/* Batch Mode Toggle */}
                  <button
                    onClick={() => setBatchUrlMode(!batchUrlMode)}
                    className={`p-2 rounded-lg transition ${batchUrlMode ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : (darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}`}
                    title="Toggle batch mode"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  {videoLinks.length > 0 && (
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Batch Mode Indicator */}
                {batchUrlMode && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2 flex items-center gap-2">
                    <List className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      Batch mode: One URL per line
                    </span>
                  </div>
                )}

                <div className="relative">
                  <label htmlFor="video-url-input" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {batchUrlMode ? 'Facebook Video URLs (one per line)' : 'Facebook Video URL'}
                  </label>
                  <div className="relative">
                    {batchUrlMode ? (
                      <textarea
                        id="video-url-input"
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            e.preventDefault();
                            addVideoLink();
                          }
                        }}
                        placeholder={`https://www.facebook.com/watch/?v=123&#10;https://www.facebook.com/watch/?v=456&#10;...`}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl outline-none transition border-2 resize-none ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                      />
                    ) : (
                      <input
                        id="video-url-input"
                        type="text"
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setShowUrlSuggestions(e.target.value.length > 3);
                        }}
                        onKeyDown={onUrlKeyDown}
                        onFocus={() => setShowUrlSuggestions(videoUrl.length > 3 && recentUrls.length > 0)}
                        onBlur={() => setTimeout(() => setShowUrlSuggestions(false), 200)}
                        placeholder="https://www.facebook.com/watch/?v=..."
                        className={`w-full px-4 py-3 rounded-xl outline-none transition border-2 ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                      />
                    )}
                    {videoUrl && !batchUrlMode && (
                      <button
                        onClick={() => setVideoUrl('')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition ${darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* NEW: URL Suggestions Dropdown */}
                  {showUrlSuggestions && recentUrls.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                      <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recent URLs</p>
                      </div>
                      {recentUrls.filter(url => url.toLowerCase().includes(videoUrl.toLowerCase()) || videoUrl.length < 5).slice(0, 5).map((url, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setVideoUrl(url);
                            setShowUrlSuggestions(false);
                            addToRecentUrls(url);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition text-sm truncate ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{url}</span>
                          <Copy className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 hover:text-indigo-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={addVideoLink}
                  disabled={!videoUrl.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transform"
                >
                  <Play className="w-4 h-4 text-white fill-current" />
                  {autoExtract ? 'Add & Auto-Extract' : 'Add & Play'}
                </button>

                {/* Auto-Extract Toggle */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${autoExtract ? 'text-yellow-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Auto-Extract
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Automatically extract when adding
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !autoExtract;
                      setAutoExtract(newValue);
                      showToast(
                        newValue ? 'Auto-extract enabled ⚡' : 'Auto-extract disabled',
                        newValue ? 'success' : 'info'
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      autoExtract
                        ? 'bg-indigo-600'
                        : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoExtract ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Search */}
                {showSearch && (
                  <div className={`relative ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search queue..."
                      className={`w-full pl-10 pr-4 py-2 rounded-xl outline-none border-2 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                )}

                {/* Supported Formats - Collapsible on Mobile */}
                <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-indigo-200'}`}>
                  {/* Header - Clickable */}
                  <button
                    onClick={() => setShowFormatsMobile(!showFormatsMobile)}
                    className={`w-full p-4 flex items-center justify-between transition ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1 rounded">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>Supported URL Formats</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFormatsMobile ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  
                  {/* Content - Collapsible */}
                  {showFormatsMobile && (
                    <div className={`p-4 pt-0 ${darkMode ? 'bg-gray-700/30' : 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50'}`}>
                      <ul className={`text-xs space-y-1 ml-5 ${darkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>
                        <li>• /watch/?v=...</li>
                        <li>• /videos/...</li>
                        <li>• /reel/...</li>
                        <li>• /share/v/...</li>
                        <li>• fb.watch/...</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Queue - Collapsible on Mobile */}
                {videoLinks.length > 0 && (
                  <div className="mt-6">
                    {/* Header - Clickable on Mobile */}
                    <button
                      onClick={() => setShowQueueMobile(!showQueueMobile)}
                      className="w-full flex items-center justify-between mb-3 group"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Queue ({filteredVideos.length})
                        </h3>
                        <ChevronDown className={`w-4 h-4 transition-transform lg:hidden ${showQueueMobile ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                      {videoLinks.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Clear all ${videoLinks.length} videos?`)) {
                              setVideoLinks([]);
                              setCurrentVideo(null);
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          Clear all
                        </button>
                      )}
                    </button>

                    {/* Queue List - Collapsible on Mobile, Always Visible on Desktop */}
                    <div className={`lg:block ${showQueueMobile ? 'block' : 'hidden'}`}>
                      <ul className="space-y-2 max-h-80 overflow-y-auto">
                        {filteredVideos.map((video, index) => {
                        const isActive = currentVideo?.id === video.id;
                        const displayTitle = video.title || (video.url.includes("/reel/") ? `Reel ${index + 1}` : `Video ${index + 1}`);

                        // Generate a unique gradient based on video URL
                        const gradientIndex = (video.url.length + index) % 5;
                        const gradients = [
                          'from-indigo-500 to-purple-600',
                          'from-pink-500 to-rose-600',
                          'from-cyan-500 to-blue-600',
                          'from-amber-500 to-orange-600',
                          'from-emerald-500 to-teal-600'
                        ];
                        const thumbnailGradient = gradients[gradientIndex];

                        // Get video type icon
                        const isReel = video.url.includes('/reel/');
                        const isVideo = video.url.includes('/videos/');
                        const videoTypeIcon = isReel ? '📱' : isVideo ? '🎬' : '📺';

                        // Get upload date if available
                        const uploadDate = video.addedAt ? new Date(video.addedAt).toLocaleDateString() : null;

                        // Get duration if available (from cache)
                        const cachedData = getCachedVideo(video.url);
                        const duration = cachedData?.duration || null;

                        // Debug logging
                        if (video.title) {
                          console.log('[Queue Display] Video has title:', video.title);
                        }

                        return (
                          <li
                            key={video.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-pointer group ${
                              isActive
                                ? "border-indigo-500 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 shadow-lg shadow-indigo-500/20"
                                : darkMode
                                  ? "border-gray-700 bg-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-700"
                                  : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                            }`}
                            onClick={() => playVideo(video)}
                          >
                            {/* Thumbnail with gradient and icon */}
                            <div className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 ${isActive ? 'ring-2 ring-indigo-500' : ''}`}>
                              <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailGradient} opacity-80`} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl">{videoTypeIcon}</span>
                              </div>
                              {isActive && (
                                <div className="absolute bottom-1 right-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </div>
                              )}
                              {duration && (
                                <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
                                  <span className="text-[10px] text-white font-medium">{duration}</span>
                                </div>
                              )}
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} title={displayTitle}>
                                {displayTitle}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {video.url.length > 30 ? video.url.substring(0, 30) + '...' : video.url}
                                </p>
                                {uploadDate && (
                                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    • {uploadDate}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(video);
                                }}
                                className={`p-1.5 rounded transition ${isFavorite(video.url) ? 'text-red-500' : darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(video.url) ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeVideo(video.id);
                                }}
                                className="p-1.5 hover:bg-red-100 rounded transition text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Player Area */}
          <div className={`${compactMode ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            {currentVideo ? (
              <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-slate-900' : 'bg-gradient-to-br from-white to-indigo-50/30'} rounded-2xl shadow-xl shadow-indigo-500/10 overflow-hidden transition-colors duration-300 border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
                {currentVideo.directVideoUrl ? (
                  <>
                    {/* Video Player */}
                    <div
                      className="aspect-video bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative group/player"
                      onMouseEnter={handleVideoMouseEnter}
                      onMouseLeave={handleVideoMouseLeave}
                      onMouseMove={handleVideoMouseMove}
                      onClick={(e) => {
                        // Close selectors if clicking outside
                        if (showQualitySelector || showSpeedSelector || showSettingsMenu) {
                          setShowQualitySelector(false);
                          setShowSpeedSelector(false);
                          setShowSettingsMenu(false);
                          return;
                        }

                        // Only toggle controls/play if clicking directly on video area
                        if (e.target === e.currentTarget || e.target.tagName === 'VIDEO') {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const width = rect.width;
                          const percent = (x / width) * 100;

                          // YouTube-style tap behavior:
                          // Center 60% (20% to 80%) → toggle play/pause
                          // Outer 20% on each side → toggle controls visibility
                          if (percent >= 20 && percent <= 80) {
                            // Center tap - toggle play/pause
                            // Check current state before toggling
                            const wasPlaying = isPlaying;
                            togglePlay();

                            // Show controls briefly when toggling play
                            setControlsVisible(true);
                            if (controlsTimeoutRef.current) {
                              clearTimeout(controlsTimeoutRef.current);
                            }

                            if (wasPlaying) {
                              // Was playing, now paused - keep controls visible
                            } else {
                              // Was paused, now playing - auto-hide after 3 seconds
                              controlsTimeoutRef.current = setTimeout(() => {
                                setControlsVisible(false);
                              }, 3000);
                            }
                          } else if ((percent >= 0 && percent < 20) || (percent > 80 && percent <= 100)) {
                            // Side taps - toggle controls visibility
                            toggleControlsVisibility();
                          }
                        }
                      }}
                    >
                      <video
                        key={currentVideo.directVideoUrl}
                        ref={videoPlayerRef}
                        src={decodeVideoUrl(currentVideo.directVideoUrl)}
                        loop={isLooping}
                        volume={volume}
                        muted={isMuted}
                        className="w-full h-full object-contain"
                        onLoadedMetadata={(e) => {
                          setDuration(e.target.duration);
                          setCurrentTime(e.target.currentTime);
                          // Handle pending seek from history resume
                          if (pendingSeekRef.current !== null) {
                            console.log("Seeking on loadedmetadata to:", pendingSeekRef.current);
                            e.target.currentTime = pendingSeekRef.current;
                            pendingSeekRef.current = null;
                          }
                        }}
                        onCanPlay={(e) => {
                          // Backup seek in case loadedmetadata was too early
                          if (pendingSeekRef.current !== null) {
                            console.log("Seeking on canplay to:", pendingSeekRef.current);
                            e.target.currentTime = pendingSeekRef.current;
                            pendingSeekRef.current = null;
                            e.target.play().catch(err => console.error("Auto-play failed:", err));
                          }
                        }}
                        onTimeUpdate={(e) => {
                          setCurrentTime(e.target.currentTime);
                          if (duration === 0) {
                            setDuration(e.target.duration);
                          }
                        }}
                        onDurationChange={(e) => {
                          setDuration(e.target.duration);
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => {
                          if (autoPlayNext && !isLooping) {
                            playNextVideo();
                          }
                        }}
                      />

                      {/* Resume Prompt - Shows when returning to a previously watched video - Compact for mobile */}
                      {showResumePrompt && resumeTime !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30" onClick={(e) => { e.stopPropagation(); startFromBeginning(); }}>
                          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm mx-4 text-center relative`} onClick={(e) => e.stopPropagation()}>
                            {/* Close button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); startFromBeginning(); }}
                              className={`absolute top-2 right-2 p-1 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-800'}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                              <History className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h3 className={`text-base sm:text-xl font-bold mb-1 sm:mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Resume Watching?</h3>
                            <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              You were at <span className="font-bold text-indigo-500">{formatTime(resumeTime)}</span>
                            </p>
                            <div className="flex gap-2 sm:gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); resumeFromSaved(); }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl transition flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                              >
                                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Resume</span>
                                <span className="sm:hidden">Play</span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); startFromBeginning(); }}
                                className={`flex-1 font-semibold py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl transition text-sm sm:text-base ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                              >
                                Restart
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Center Play/Pause Overlay - Visual only, clicks handled by parent */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-300 pointer-events-none ${!isPlaying ? 'opacity-100' : (!controlsVisible ? 'opacity-0' : 'opacity-0')}`}
                      >
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-2xl">
                          {isPlaying ? (
                            <Pause className="w-10 h-10 text-white" strokeWidth={3} />
                          ) : (
                            <Play className="w-10 h-10 text-white fill-white ml-1" strokeWidth={3} />
                          )}
                        </div>
                      </div>

                      {/* Bottom Controls Bar - Hide when controls are hidden */}
                      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent transition-opacity duration-300 ${!controlsVisible ? 'opacity-0' : 'opacity-100'}`}>
                        {/* Progress Bar - Above controls, YouTube style full red */}
                        <div className="px-2 sm:px-4 pt-2 sm:pt-3">
                          {/* Hover time indicator */}
                          {hoverTime && hoverTime.visible && (
                            <div
                              className="absolute bottom-full left-0 mb-2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 whitespace-nowrap z-20"
                              style={{ left: `${hoverTime.position}%` }}
                            >
                              {formatTime(hoverTime.time)}
                            </div>
                          )}

                          {/* Progress bar container - full red like YouTube */}
                          <div className="h-1.5 landscape:h-2 sm:h-1 bg-red-600/30 cursor-pointer group/progress relative rounded-full">
                            <div
                              className="h-full bg-red-600 relative rounded-full"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            >
                              {/* Scrubber - always visible on mobile, hover on desktop */}
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 landscape:w-4 landscape:h-4 sm:w-3 sm:h-3 bg-red-600 rounded-full opacity-100 sm:opacity-0 sm:group-hover/progress:opacity-100 transition-opacity shadow-lg ring-2 ring-white" />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max={duration || 100}
                              value={currentTime}
                              step="0.1"
                              onChange={(e) => {
                                const video = videoPlayerRef.current;
                                if (video) {
                                  video.currentTime = parseFloat(e.target.value);
                                  setCurrentTime(parseFloat(e.target.value));
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                          </div>
                        </div>

                        {/* Controls padding */}
                        <div className="p-2 sm:p-4">

                        {/* Controls Row */}
                        <div className="flex items-center justify-between gap-1 sm:gap-2">
                          {/* Left Controls */}
                          <div className="flex items-center gap-1 sm:gap-3">
                            {/* Play/Pause */}
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                              className="text-white hover:text-indigo-400 transition p-1.5 sm:p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                              title="Play/Pause (Space)"
                            >
                              {isPlaying ? <Pause className="w-5 h-5 sm:w-5 sm:h-5" /> : <Play className="w-5 h-5 sm:w-5 sm:h-5" />}
                            </button>

                            {/* Volume - Professional slider beside icon */}
                            <div className="flex items-center gap-2 group/volume">
                              {/* Volume Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMute();
                                }}
                                className="text-white/90 hover:text-white transition p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                                title="Volume (M)"
                              >
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                              </button>

                              {/* Horizontal Volume Slider - appears on hover */}
                              <div className="opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200 w-0 overflow-hidden group-hover/volume:w-24 group-hover/volume:overflow-visible">
                                <div className="relative h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
                                  {/* Volume fill - RED */}
                                  <div
                                    className="absolute left-0 top-0 bottom-0 bg-red-600 transition-all duration-75"
                                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                  />

                                  {/* Slider input */}
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      changeVolume(parseFloat(e.target.value));
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Time Display - Smaller on mobile */}
                            <span className="text-white text-[10px] sm:text-xs font-mono">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>

                          {/* Center - Quality Badge - Hidden on mobile */}
                          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Film className="w-4 h-4 text-indigo-400" />
                            <span className="text-white text-sm font-medium">
                              {getQualityLabel(currentVideo.availableFormats?.find(f => f.url === currentVideo.directVideoUrl) || {})}
                            </span>
                          </div>

                          {/* Right Controls */}
                          <div className="flex items-center gap-1 sm:gap-2">
                            {/* Loop - Hidden on mobile */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setIsLooping(!isLooping); }}
                              className={`hidden sm:flex p-2 rounded-lg transition min-w-[44px] min-h-[44px] items-center justify-center ${isLooping ? 'bg-green-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                              title="Loop (L)"
                            >
                              <Repeat className="w-4 h-4" />
                            </button>

                            {/* Speed - Hidden on mobile */}
                            <div className="hidden sm:relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowSpeedSelector(!showSpeedSelector); }}
                                className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition flex items-center gap-1 text-sm min-h-[44px]"
                              >
                                <Gauge className="w-3 h-3" />
                                <span>{playbackSpeed}x</span>
                              </button>

                              {showSpeedSelector && (
                                <div className="absolute bottom-full right-0 mb-2 w-36 bg-gray-900 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                                  <div className="p-2 border-b border-gray-700">
                                    <p className="text-xs text-gray-400 text-center">Playback Speed</p>
                                  </div>
                                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={(e) => { e.stopPropagation(); changePlaybackSpeed(speed); }}
                                      className={`w-full text-left px-3 py-3 sm:px-4 sm:py-2 text-sm transition ${
                                        playbackSpeed === speed
                                          ? 'bg-indigo-600 text-white font-medium'
                                          : 'text-gray-200 hover:bg-gray-800'
                                      }`}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* PiP - Hidden on mobile */}
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePiP(); }}
                              className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition min-h-[44px] min-w-[44px] items-center justify-center"
                              title="Picture-in-Picture (P)"
                            >
                              <PictureInPicture className="w-4 h-4" />
                            </button>

                            {/* Settings Menu - Brightness, Volume & Quality */}
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowSettingsMenu(!showSettingsMenu); }}
                                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center"
                                title="Settings"
                              >
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>

                              {showSettingsMenu && (
                                <>
                                  {/* Backdrop - prevents body scroll */}
                                  <div
                                    className="fixed inset-0 bg-black/60 z-[100] lg:hidden"
                                    onClick={(e) => { e.stopPropagation(); setShowSettingsMenu(false); }}
                                  />
                                  {/* Settings Menu - Mobile Bottom Sheet (iOS/YouTube style) */}
                                  <div className="fixed bottom-0 left-0 right-0 z-[110] bg-[#1a1a1a] rounded-t-3xl shadow-2xl lg:bottom-20 lg:left-auto lg:right-4 lg:w-80 lg:rounded-2xl lg:max-h-[70vh] lg:overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out pb-safe lg:pb-0">
                                    {/* Pull handle - visual affordance for swipe-to-dismiss */}
                                    <div className="flex justify-center pt-3 pb-2 lg:hidden">
                                      <div className="w-10 h-1 bg-white/30 rounded-full" />
                                    </div>

                                    {/* Header - only for mobile */}
                                    <div className="flex items-center justify-between px-5 pb-3 lg:hidden">
                                      <h2 className="text-white text-lg font-semibold">Settings</h2>
                                      <button
                                        onClick={() => setShowSettingsMenu(false)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition"
                                      >
                                        <X className="w-5 h-5 text-white" />
                                      </button>
                                    </div>

                                    {/* Settings Content - scrollable area */}
                                    <div className="px-4 pb-6 overflow-y-auto max-h-[65vh] lg:max-h-[calc(70vh-60px)] lg:px-4 lg:pb-4">
                                      {/* Brightness Section */}
                                      <div className="py-4 border-b border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500/20">
                                              <Sun className="w-4 h-4 text-yellow-400" />
                                            </div>
                                            <span className="text-white font-medium">Brightness</span>
                                          </div>
                                          <span className="text-white/60 text-sm min-w-[3rem] text-right">{brightness}%</span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={brightness}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setBrightness(val);
                                            if (videoPlayerRef.current) {
                                              videoPlayerRef.current.style.filter = `brightness(${val}%)`;
                                            }
                                          }}
                                          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                                          style={{ touchAction: 'pan-y' }}
                                        />
                                      </div>

                                      {/* Volume Section */}
                                      <div className="py-4 border-b border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500/20">
                                              {volume === 0 ? <VolumeX className="w-4 h-4 text-indigo-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                                            </div>
                                            <span className="text-white font-medium">Volume</span>
                                          </div>
                                          <span className="text-white/60 text-sm min-w-[3rem] text-right">{Math.round(volume * 100)}%</span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={volume * 100}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) / 100;
                                            setVolume(val);
                                            if (videoPlayerRef.current) {
                                              videoPlayerRef.current.volume = val;
                                              videoPlayerRef.current.muted = val === 0;
                                            }
                                          }}
                                          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                                          style={{ touchAction: 'pan-y' }}
                                        />
                                      </div>

                                      {/* Quality Section */}
                                      <div className="py-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20">
                                            <Film className="w-4 h-4 text-green-400" />
                                          </div>
                                          <span className="text-white font-medium">Quality</span>
                                        </div>
                                        <div className="space-y-1">
                                          {currentVideo.availableFormats?.map((format) => {
                                            const isSelected = format.url === currentVideo.directVideoUrl;
                                            return (
                                              <button
                                                key={format.formatId}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setCurrentVideo(prev => ({ ...prev, directVideoUrl: format.url }));
                                                  setShowSettingsMenu(false);
                                                }}
                                                className={`w-full h-12 px-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98] ${
                                                  isSelected
                                                    ? 'bg-green-600 text-white shadow-lg'
                                                    : 'bg-white/5 text-gray-300 active:bg-white/10'
                                                }`}
                                              >
                                                <span className="font-medium">{getQualityLabel(format)}</span>
                                                {isSelected && <Check className="w-5 h-5" />}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Fullscreen */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition min-h-[36px] sm:min-h-[44px] min-w-[36px] sm:min-w-[44px] flex items-center justify-center"
                              title="Fullscreen (F)"
                            >
                              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                        </div>
                      </div>

                      {/* Top Right Quick Actions - Hide when controls are hidden */}
                      <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${!controlsVisible ? 'opacity-0' : 'opacity-100'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); captureScreenshot(); }}
                          className="bg-black/70 hover:bg-black/80 text-white p-2.5 rounded-xl backdrop-blur-sm transition"
                          title="Screenshot"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : isExtracting ? (
                  <div className="aspect-video bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center relative overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-4">
                      {/* Progress Ring - Smaller on mobile */}
                      <div className="mb-4 sm:mb-6">
                        <div className="relative">
                          <svg className="w-20 h-20 sm:w-32 sm:h-32 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-gray-700"
                              fill="none"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="url(#gradient)"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 36}`}
                              strokeDashoffset={`${2 * Math.PI * 36 * (1 - (extractionProgress?.percentage || 30) / 100)}`}
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-out"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl sm:text-3xl font-bold text-white">{extractionProgress?.percentage || 30}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Current Step - Smaller text on mobile */}
                      <div className="text-center mb-3 sm:mb-6 max-w-md">
                        <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2 animate-pulse">
                          {extractionProgress?.step || 'Initializing...'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {extractionProgress?.detail || 'Connecting to Facebook servers...'}
                        </p>
                      </div>

                      {/* Progress Steps - More compact on mobile */}
                      <div className="space-y-1.5 sm:space-y-2 max-w-md w-full">
                        {[
                          { icon: '🌐', label: 'Connecting', done: true },
                          { icon: '🔍', label: 'Analyzing', done: (extractionProgress?.percentage || 30) > 20 },
                          { icon: '⬇️', label: 'Extracting', done: (extractionProgress?.percentage || 30) > 50 },
                          { icon: '✨', label: 'Processing', done: (extractionProgress?.percentage || 30) > 80 },
                        ].map((step, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                              step.done
                                ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30'
                                : i === Math.floor(((extractionProgress?.percentage || 30) / 100) * 4)
                                ? 'bg-gray-700/50 border border-indigo-500/50 animate-pulse'
                                : 'bg-gray-800/30 border border-gray-700'
                            }`}
                          >
                            <span className="text-base sm:text-xl">{step.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs sm:text-sm font-medium truncate ${step.done ? 'text-indigo-400' : 'text-gray-400'}`}>
                                {step.label}
                              </p>
                            </div>
                            {step.done && (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            {!step.done && i === Math.floor(((extractionProgress?.percentage || 30) / 100) * 4) && (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`aspect-video flex items-center justify-center p-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                        <Download className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Extract Video</h3>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Click the button below to extract and play this Facebook video in HD quality.
                      </p>

                      {/* Auth Section */}
                      <div className={`mb-4 p-4 rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {isAuthenticated ? 'Facebook Connected' : 'Not Connected'}
                            </span>
                          </div>
                          {isAuthenticated ? (
                            <button
                              onClick={handleLogout}
                              className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                            >
                              Logout
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowLoginModal(true)}
                              className="text-xs px-3 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg transition"
                            >
                              Login
                            </button>
                          )}
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useAuthMode}
                            onChange={(e) => setUseAuthMode(e.target.checked)}
                            disabled={!isAuthenticated}
                            className="w-4 h-4 rounded border-gray-500 text-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                          />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Use authentication for private videos
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={extractAndPlayVideo}
                        disabled={isExtracting}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-indigo-600 text-white font-semibold py-4 px-8 rounded-xl transition duration-200 shadow-xl shadow-indigo-500/30 inline-flex items-center gap-3 text-lg hover:scale-105 transform"
                      >
                        {isExtracting ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Extract & Play
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Video Info Panel */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      {/* Video Title */}
                      {currentVideo.title && currentVideo.title !== 'Facebook Video' && (
                        <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2 leading-tight`}>
                          {currentVideo.title}
                        </h3>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <h2 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Now Playing</h2>
                        {currentVideo.directVideoUrl && (
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${darkMode ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Extracted
                          </span>
                        )}
                      </div>

                      {/* Quality Selector - Professional & Mobile-Friendly */}
                      {currentVideo.directVideoUrl && currentVideo.availableFormats && (
                        <div className="mb-5">
                          {/* Compact Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <Film className={`w-4 h-4 ${
                              darkMode ? 'text-indigo-400' : 'text-indigo-600'
                            }`} />
                            <h4 className={`text-sm font-semibold ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Quality</h4>
                            <span className={`text-xs ${
                              darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              ({currentVideo.availableFormats.length} options)
                            </span>
                          </div>

                          {/* Horizontal Scrollable Quality Pills - Mobile Optimized */}
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {currentVideo.availableFormats.map((format, index) => {
                              const isSelected = format.url === currentVideo.directVideoUrl;
                              const qualityLabel = getQualityLabel(format);
                              const qualityNum = parseInt(qualityLabel.replace('p', ''));
                              
                              // Get quality icon/badge
                              const getQualityBadge = () => {
                                if (qualityNum >= 1080) return '4K';
                                if (qualityNum >= 720) return 'HD';
                                return 'SD';
                              };

                              return (
                                <button
                                  key={format.formatId}
                                  onClick={() => {
                                    setCurrentVideo(prev => ({ ...prev, directVideoUrl: format.url }));
                                    showToast(`Switched to ${qualityLabel}`, 'success');
                                  }}
                                  className={`
                                    group relative flex items-center gap-2 flex-shrink-0
                                    px-4 py-2.5 rounded-lg
                                    font-medium text-sm
                                    transition-all duration-200
                                    min-w-[100px]
                                    ${
                                      isSelected
                                        ? darkMode
                                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/50'
                                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/50'
                                        : darkMode
                                          ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-500'
                                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
                                    }
                                  `}
                                >
                                  {/* Quality Badge */}
                                  <div className={`
                                    px-1.5 py-0.5 rounded text-[10px] font-bold
                                    ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : qualityNum >= 1080
                                          ? darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                                          : qualityNum >= 720
                                            ? darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                                            : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-600'
                                    }
                                  `}>
                                    {getQualityBadge()}
                                  </div>

                                  {/* Resolution */}
                                  <span className="font-bold">{qualityLabel}</span>

                                  {/* Check Icon */}
                                  {isSelected && (
                                    <Check className="w-4 h-4 ml-auto" strokeWidth={2.5} />
                                  )}

                                  {/* Size Tooltip - Desktop Only */}
                                  <div className={`
                                    hidden sm:block absolute -top-8 left-1/2 -translate-x-1/2
                                    px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                    ${
                                      darkMode
                                        ? 'bg-gray-900 text-gray-200 border border-gray-700'
                                        : 'bg-gray-800 text-white'
                                    }
                                  `}>
                                    {getEstimatedSize(format.url)}
                                    {/* Tooltip Arrow */}
                                    <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                      darkMode ? 'border-t-gray-900' : 'border-t-gray-800'
                                    }`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Size Info - Mobile */}
                          <p className={`text-xs mt-2 sm:hidden ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            Swipe to see more • Size: {getEstimatedSize(currentVideo.directVideoUrl)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFavorite(currentVideo)}
                        className={`p-3 rounded-xl transition ${isFavorite(currentVideo?.url) ? 'bg-red-100 text-red-600 hover:bg-red-200' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title="Add to Favorites"
                      >
                        <Heart className={`w-5 h-5 ${isFavorite(currentVideo?.url) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={shareVideo}
                        className={`p-3 rounded-xl transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title="Share"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      {currentVideo.directVideoUrl && videoLinks.length > 1 && (
                        <button
                          onClick={playNextVideo}
                          className={`p-3 rounded-xl transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          title="Next Video"
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Source URL */}
                  <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                    <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Source URL</p>
                    <p className={`text-sm break-all font-mono ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{currentVideo.url}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-3 min-h-[48px] sm:min-h-[44px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md font-medium text-xs sm:text-sm"
                    >
                      <ExternalLink className="w-4 h-4 sm:w-4 sm:h-4" />
                      <span>Facebook</span>
                    </a>

                    <button
                      onClick={() => copyToClipboard(currentVideo.url)}
                      className={`inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-3 min-h-[48px] sm:min-h-[44px] rounded-xl transition font-medium text-xs sm:text-sm ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      <Clipboard className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>

                    {currentVideo.directVideoUrl && (
                      <>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentVideo.directVideoUrl);
                            showError('Download URL copied!', 'success');
                          }}
                          className="inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-3 min-h-[48px] sm:min-h-[44px] bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl transition shadow-md font-medium text-xs sm:text-sm col-span-2 sm:col-span-1 sm:flex-none"
                        >
                          <Clipboard className="w-4 h-4" />
                          <span>Copy Download URL</span>
                        </button>

                        <a
                          href={decodeVideoUrl(currentVideo.directVideoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-3 min-h-[48px] sm:min-h-[44px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md font-medium text-xs sm:text-sm"
                        >
                          <Play className="w-4 h-4" />
                          <span>Stream</span>
                        </a>

                        <button
                          onClick={directDownloadVideo}
                          disabled={isDownloading}
                          className="inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-3 min-h-[48px] sm:min-h-[44px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl transition shadow-md font-medium text-xs sm:text-sm disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          {isDownloading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <span>Download</span>
                          )}
                        </button>

                        <button
                          onClick={captureScreenshot}
                          className={`inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-3 min-h-[48px] sm:min-h-[44px] rounded-xl transition font-medium text-xs sm:text-sm ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                          <Camera className="w-4 h-4" />
                          <span>Screenshot</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className={`text-xs font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
                      <Zap className="w-4 h-4" />
                      Keyboard Shortcuts
                    </p>
                    <div className={`text-xs grid grid-cols-2 gap-2 ${darkMode ? 'text-gray-300' : 'text-amber-800'}`}>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Space</kbd> Play/Pause</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">M</kbd> Mute</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">F</kbd> Fullscreen</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">L</kbd> Loop</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">&gt;/&lt;</kbd> Speed</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">N</kbd> Next</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">J</kbd> -10s</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Shift+K</kbd> +10s</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Arrows</kbd> Seek/Vol</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">D</kbd> Download</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">P</kbd> PiP</span>
                      <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">0-9</kbd> Jump %</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 sm:p-12 text-center transition-colors duration-300 relative overflow-hidden`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingUrl(true); }}
                onDragLeave={() => setIsDraggingUrl(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingUrl(false);
                  const url = e.dataTransfer.getData('text/plain');
                  if (url && isFacebookUrl(url)) {
                    setVideoUrl(url);
                    if (autoExtract) {
                      addVideoLink(url);
                    }
                  }
                }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
                </div>

                {/* Drag & Drop Overlay */}
                {isDraggingUrl && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 border-2 border-dashed border-indigo-500">
                    <div className="text-center">
                      <Link2 className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-bounce" />
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Drop URL here</p>
                    </div>
                  </div>
                )}

                {/* Animated Floating Icons */}
                <div className="relative mb-8">
                  <div className="flex justify-center items-center gap-4">
                    <Video className={`w-12 h-12 text-indigo-500 animate-float ${darkMode ? 'text-indigo-400' : ''}`} style={{ animationDelay: '0s' }} />
                    <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'} flex items-center justify-center shadow-lg animate-pulse`}>
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <Sparkles className={`w-12 h-12 text-purple-500 animate-float ${darkMode ? 'text-purple-400' : ''}`} style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>

                {/* Main Message */}
                <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Video Selected
                </h3>
                <p className={`text-base sm:text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paste a Facebook video URL or drag & drop to get started
                </p>

                {/* Quick Start Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-3xl mx-auto">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-indigo-50 border border-indigo-200'}`}>
                    <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-indigo-600' : 'bg-indigo-500'} flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold">1</span>
                    </div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Copy URL</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>From Facebook</p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-purple-50 border border-purple-200'}`}>
                    <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-purple-600' : 'bg-purple-500'} flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold">2</span>
                    </div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Paste & Extract</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Click button</p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-pink-50 border border-pink-200'}`}>
                    <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-pink-600' : 'bg-pink-500'} flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold">3</span>
                    </div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Watch in HD</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Enjoy quality!</p>
                  </div>
                </div>

                {/* Example Videos */}
                <div className={`max-w-2xl mx-auto ${darkMode ? 'bg-gray-700/30' : 'bg-gradient-to-r from-gray-50 to-indigo-50'} rounded-xl p-5 border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
                  <p className={`text-xs font-semibold mb-3 flex items-center justify-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Sparkles className="w-3 h-3" />
                    Try these example formats:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['facebook.com/watch/', 'fb.watch/', 'facebook.com/videos/', 'facebook.com/reel/'].map((format, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setVideoUrl(`https://www.${format}`);
                          if (autoExtract) {
                            addVideoLink(`https://www.${format}`);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          darkMode
                            ? 'bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white border border-gray-600 hover:border-indigo-500'
                            : 'bg-white hover:bg-indigo-500 text-gray-700 hover:text-white border border-gray-200 hover:border-indigo-500 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features Badge */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['HD Quality', 'No Ads', 'Fast', 'Free'].map((feature, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode
                          ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-300'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* NEW: Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowKeyboardHelp(false)} />
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl">
                    <Keyboard className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Playback Controls</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Play/Pause</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Space</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Seek ±5s</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">← / →</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Seek ±10s</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Shift+← / →</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Volume</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">↑ / ↓</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Mute</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">M</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Jump %</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">0-9</kbd></div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>View & Display</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Fullscreen</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">F</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Exit Fullscreen</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Esc</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Picture-in-Picture</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">P</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Toggle Controls</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">C</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Screenshot</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">S</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Settings</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">T</kbd></div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Video Features</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Download</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">D</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Speed</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">&lt; / &gt;</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loop</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">L</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Quality</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Q</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Favorite</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">H</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Next Video</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">N</kbd></div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>App Controls</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Shortcuts Help</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">K</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Focus Search</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">/</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Focus URL Input</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">U</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Dark Mode</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">X</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Clear Queue</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Del</kbd></div>
                    <div className="flex justify-between items-center"><span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Help</span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">?</kbd></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: FAQ Modal */}
      {showFaq && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFaq(false)} />
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Help & FAQ</h2>
                </div>
                <button
                  onClick={() => setShowFaq(false)}
                  className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  How to extract a Facebook video?
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Copy any Facebook video URL (posts, reels, stories) and paste it in the input field. Click "Extract & Play" and wait 10-20 seconds for processing.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Lock className="w-4 h-4 text-indigo-500" />
                  How to download private group videos?
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  For private group videos, enable authentication by clicking "Login" first. Log in to your Facebook account, then enable "Use authentication" checkbox before extracting.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Download className="w-4 h-4 text-indigo-500" />
                  How to download videos?
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">D</kbd> or click the download icon in player controls. Select your preferred quality (480p/720p/1080p) from settings before downloading.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Zap className="w-4 h-4 text-indigo-500" />
                  What quality options are available?
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  We support multiple quality options: 1080p (HD), 720p, and 480p (SD). Click the Settings (gear icon) in player controls to change quality.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <History className="w-4 h-4 text-indigo-500" />
                  Is my watch history saved?
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Yes! Your watch history and progress are automatically saved in your browser. You can resume watching from where you left off.
                </p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Tips & Tricks
                </h3>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Drag & drop URLs anywhere on the page</li>
                  <li>• Use keyboard shortcuts for faster control</li>
                  <li>• Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">K</kbd> anytime to see shortcuts</li>
                  <li>• Double-click video for fullscreen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
