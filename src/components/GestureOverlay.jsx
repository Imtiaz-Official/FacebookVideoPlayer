import { FastForward, Rewind, SkipForward, SkipBack } from 'lucide-react';

/**
 * Visual feedback overlay for mobile gestures
 * Shows icons when double-tap or swipe gestures are performed
 */
export const GestureOverlay = ({
  showSeekIndicator,
  seekDirection,
  showSwipeIndicator,
  swipeDirection,
  darkMode,
}) => {
  return (
    <>
      {/* Double-tap seek indicator */}
      {showSeekIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            seekDirection === 'forward' ? 'animate-pulse' : ''
          }`} />

          {/* Left side rewind */}
          <div
            className={`absolute left-8 flex items-center justify-center w-32 h-32 rounded-full transition-all duration-200 ${
              seekDirection === 'backward'
                ? 'bg-white/20 scale-110'
                : 'bg-transparent'
            }`}
          >
            <Rewind
              className={`w-16 h-16 text-white transition-all duration-200 ${
                seekDirection === 'backward'
                  ? 'scale-110'
                  : 'opacity-0'
              }`}
            />
            {seekDirection === 'backward' && (
              <span className="absolute mt-24 text-white text-xl font-bold animate-bounce">
                -10s
              </span>
            )}
          </div>

          {/* Right side forward */}
          <div
            className={`absolute right-8 flex items-center justify-center w-32 h-32 rounded-full transition-all duration-200 ${
              seekDirection === 'forward'
                ? 'bg-white/20 scale-110'
                : 'bg-transparent'
            }`}
          >
            <FastForward
              className={`w-16 h-16 text-white transition-all duration-200 ${
                seekDirection === 'forward'
                  ? 'scale-110'
                  : 'opacity-0'
              }`}
            />
            {seekDirection === 'forward' && (
              <span className="absolute mt-24 text-white text-xl font-bold animate-bounce">
                +10s
              </span>
            )}
          </div>
        </div>
      )}

      {/* Swipe navigation indicator */}
      {showSwipeIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="absolute inset-0 bg-black/40 animate-pulse" />

          <div className={`flex items-center justify-center w-40 h-40 rounded-full ${
            darkMode ? 'bg-gray-800/80' : 'bg-white/80'
          } shadow-2xl`}>
            {swipeDirection === 'left' ? (
              <>
                <SkipForward className="w-20 h-20 text-indigo-500 animate-pulse" />
                <span className="absolute mt-28 text-gray-900 dark:text-white text-lg font-bold">
                  Next Video
                </span>
              </>
            ) : (
              <>
                <SkipBack className="w-20 h-20 text-indigo-500 animate-pulse" />
                <span className="absolute mt-28 text-gray-900 dark:text-white text-lg font-bold">
                  Previous Video
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
