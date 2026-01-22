import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Player from './pages/Player';
import { Video, Home as HomeIcon, Settings, Download } from 'lucide-react';

export default function RouterApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPlayerRoute = location.pathname === '/player';
  const isHomeRoute = location.pathname === '/';

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/' },
    { icon: Download, label: 'Extract', path: '/' },
    { icon: Settings, label: 'Settings', path: '/' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      {!isPlayerRoute && (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-purple-100 dark:border-purple-900/30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate('/')}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold gradient-text">FB Video Player</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Extract & Play in HD</p>
                </div>
              </div>

              {/* Navigation - Desktop */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${isHomeRoute && index === 0
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<Player />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isPlayerRoute && (
        <footer className="relative border-t border-purple-100 dark:border-purple-900/30 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Video className="w-4 h-4" />
                <span>FB Video Player</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Extract and watch Facebook videos in HD quality
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
