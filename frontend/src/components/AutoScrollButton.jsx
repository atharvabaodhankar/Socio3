import React, { useState } from 'react';
import { useAutoScroll } from '../hooks/useAutoScroll';

const AutoScrollButton = ({ className = '' }) => {
  const [enabled, setEnabled] = useState(false);
  const [speed, setSpeed] = useState(1);
  const { isScrolling, isPaused, toggleAutoScroll } = useAutoScroll(enabled, speed);

  const handleToggle = () => {
    if (!enabled) {
      setEnabled(true);
    } else {
      toggleAutoScroll();
    }
  };

  const handleStop = () => {
    setEnabled(false);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <div className="flex flex-col items-end space-y-2">
        {/* Speed Controls - Show when scrolling */}
        {enabled && (
          <div className="glass rounded-xl p-3 flex items-center space-x-2">
            <span className="text-xs text-gray-400">Speed:</span>
            {[0.5, 1, 2, 3].map((speedOption) => (
              <button
                key={speedOption}
                onClick={() => handleSpeedChange(speedOption)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  speed === speedOption
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {speedOption}x
              </button>
            ))}
          </div>
        )}

        {/* Main Control Button */}
        <div className="flex items-center space-x-2">
          {enabled && (
            <button
              onClick={handleStop}
              className="glass p-3 rounded-full hover:bg-red-500/20 transition-colors group"
              title="Stop auto-scroll"
            >
              <svg className="w-5 h-5 text-red-400 group-hover:text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <button
            onClick={handleToggle}
            className={`glass p-3 rounded-full transition-all duration-200 group ${
              isScrolling
                ? 'bg-purple-500/20 hover:bg-purple-500/30'
                : 'hover:bg-white/10'
            }`}
            title={
              !enabled
                ? 'Start auto-scroll'
                : isPaused
                ? 'Resume auto-scroll'
                : 'Pause auto-scroll'
            }
          >
            {!enabled ? (
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : isPaused ? (
              <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Status Indicator */}
        {enabled && (
          <div className="text-xs text-center">
            <div className={`px-2 py-1 rounded-full text-xs ${
              isScrolling
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-gray-700 text-gray-400'
            }`}>
              {isScrolling ? `Auto-scrolling ${speed}x` : 'Paused'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoScrollButton;