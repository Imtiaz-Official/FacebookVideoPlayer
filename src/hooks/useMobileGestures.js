import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for enhanced mobile video player gestures
 * Supports:
 * - Double-tap to seek (left side: -10s, right side: +10s)
 * - Horizontal swipe for next/previous video
 * - Visual feedback overlays
 */
export const useMobileGestures = ({
  onSeekForward,
  onSeekBackward,
  onNextVideo,
  onPreviousVideo,
  onToggleControls,
  enabled = true,
}) => {
  const doubleTapRef = useRef({
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
    tapCount: 0,
    tapTimer: null,
  });

  const swipeRef = useRef({
    startX: 0,
    startY: 0,
    isSwiping: false,
    threshold: 50, // Minimum distance for swipe
  });

  const [showSeekIndicator, setShowSeekIndicator] = useState(false);
  const [seekDirection, setSeekDirection] = useState(null);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Clear tap timer on unmount
  useEffect(() => {
    return () => {
      if (doubleTapRef.current.tapTimer) {
        clearTimeout(doubleTapRef.current.tapTimer);
      }
    };
  }, []);

  const handleDoubleTap = useCallback((clientX, clientY) => {
    const now = Date.now();
    const timeSinceLastTap = now - doubleTapRef.current.lastTapTime;
    const distance = Math.sqrt(
      Math.pow(clientX - doubleTapRef.current.lastTapX, 2) +
      Math.pow(clientY - doubleTapRef.current.lastTapY, 2)
    );

    // Check if this is a double tap (within 300ms and close in position)
    if (timeSinceLastTap < 300 && distance < 50) {
      // Double tap detected
      const screenWidth = window.innerWidth;
      const isLeftSide = clientX < screenWidth / 2;
      const direction = isLeftSide ? 'backward' : 'forward';
      const seconds = isLeftSide ? -10 : 10;

      setSeekDirection(direction);
      setShowSeekIndicator(true);

      if (isLeftSide) {
        onSeekBackward?.();
      } else {
        onSeekForward?.();
      }

      setTimeout(() => {
        setShowSeekIndicator(false);
        setSeekDirection(null);
      }, 600);

      // Reset tap count
      doubleTapRef.current.tapCount = 0;
      doubleTapRef.current.lastTapTime = 0;

      if (doubleTapRef.current.tapTimer) {
        clearTimeout(doubleTapRef.current.tapTimer);
        doubleTapRef.current.tapTimer = null;
      }
    } else {
      // Single tap or first tap of potential double tap
      doubleTapRef.current.lastTapTime = now;
      doubleTapRef.current.lastTapX = clientX;
      doubleTapRef.current.lastTapY = clientY;
      doubleTapRef.current.tapCount++;

      // Clear previous timer
      if (doubleTapRef.current.tapTimer) {
        clearTimeout(doubleTapRef.current.tapTimer);
      }

      // Set timer to reset tap count
      doubleTapRef.current.tapTimer = setTimeout(() => {
        // Single tap - toggle controls
        if (doubleTapRef.current.tapCount === 1) {
          onToggleControls?.();
        }
        doubleTapRef.current.tapCount = 0;
        doubleTapRef.current.lastTapTime = 0;
        doubleTapRef.current.tapTimer = null;
      }, 300);
    }
  }, [onSeekForward, onSeekBackward, onToggleControls]);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;

    const touch = e.touches[0];
    swipeRef.current.startX = touch.clientX;
    swipeRef.current.startY = touch.clientY;
    swipeRef.current.isSwiping = false;
  }, [enabled]);

  const handleTouchMove = useCallback((e) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - swipeRef.current.startX);
    const deltaY = Math.abs(touch.clientY - swipeRef.current.startY);

    // Only register as swipe if horizontal movement is greater than vertical
    if (deltaX > deltaY && deltaX > 30) {
      swipeRef.current.isSwiping = true;
      e.preventDefault(); // Prevent default scroll behavior
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeRef.current.startX;
    const deltaY = touch.clientY - swipeRef.current.startY;

    // Check for horizontal swipe
    if (swipeRef.current.isSwiping && Math.abs(deltaX) > swipeRef.current.threshold) {
      const direction = deltaX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setShowSwipeIndicator(true);

      if (direction === 'left') {
        onNextVideo?.();
      } else {
        onPreviousVideo?.();
      }

      setTimeout(() => {
        setShowSwipeIndicator(false);
        setSwipeDirection(null);
      }, 500);
    } else {
      // No swipe detected, check for double tap
      handleDoubleTap(touch.clientX, touch.clientY);
    }

    swipeRef.current.isSwiping = false;
  }, [enabled, handleDoubleTap, onNextVideo, onPreviousVideo]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    showSeekIndicator,
    seekDirection,
    showSwipeIndicator,
    swipeDirection,
  };
};
