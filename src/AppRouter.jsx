import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Player from './pages/Player';
import { Video } from 'lucide-react';

export default function RouterApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPlayerRoute = location.pathname === '/player';

  return (
    <div>
      {/* Header - Only show on non-player routes */}
      {!isPlayerRoute && (
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FB Video Player</h1>
                <p className="text-xs text-white/70 hidden sm:block">Extract & Play in HD</p>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player" element={<Player />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
