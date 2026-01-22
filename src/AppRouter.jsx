import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Player from './pages/Player';
import { Video, Github, Twitter } from 'lucide-react';

export default function RouterApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPlayerRoute = location.pathname === '/player';
  const isHomeRoute = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      {!isPlayerRoute && (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-purple-100 dark:border-purple-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl shadow-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-lg font-bold gradient-text hidden sm:block">FB Video Player</span>
              </button>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/Imtiaz-Official/FacebookVideoPlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="btn-icon"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<Player />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isPlayerRoute && (
        <footer className="relative border-t border-purple-100 dark:border-purple-900/30 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Logo & Name */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-lg">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">FB Video Player</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Extract & Play Facebook Videos</p>
                </div>
              </div>

              {/* Copyright */}
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                © {new Date().getFullYear()} FB Video Player. All rights reserved.
              </p>

              {/* Links */}
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="https://github.com/Imtiaz-Official/FacebookVideoPlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  GitHub
                </a>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
