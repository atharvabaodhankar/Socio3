import { useEffect, useRef, useState } from 'react';

export const useAutoScroll = (enabled = false, speed = 1) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const lastScrollTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsScrolling(false);
      return;
    }

    setIsScrolling(true);
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - lastScrollTime.current;
      
      // Only scroll if user hasn't manually scrolled recently
      if (timeDiff > 2000) { // 2 second delay after manual scroll
        window.scrollBy({
          top: speed,
          behavior: 'smooth'
        });
      }
    }, 50); // Scroll every 50ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, speed, isPaused]);

  // Pause auto-scroll when user manually scrolls
  useEffect(() => {
    const handleScroll = () => {
      lastScrollTime.current = Date.now();
    };

    const handleMouseMove = () => {
      lastScrollTime.current = Date.now();
    };

    const handleKeyDown = (e) => {
      // Pause on arrow keys, page up/down, space, etc.
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'].includes(e.code)) {
        lastScrollTime.current = Date.now();
      }
    };

    if (enabled) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('keydown', handleKeyDown, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  const toggleAutoScroll = () => {
    setIsPaused(!isPaused);
  };

  const startAutoScroll = () => {
    setIsPaused(false);
  };

  const stopAutoScroll = () => {
    setIsPaused(true);
  };

  return {
    isScrolling: isScrolling && !isPaused,
    isPaused,
    toggleAutoScroll,
    startAutoScroll,
    stopAutoScroll
  };
};