import React from 'react';
import { useFollow } from '../hooks/useFollow';

const FollowButton = ({ 
  userAddress, 
  size = 'medium', 
  variant = 'primary',
  showFollowerCount = false,
  className = '' 
}) => {
  const { isFollowingUser, followerCount, loading, toggleFollow, canFollow } = useFollow(userAddress);

  if (!canFollow) {
    return null;
  }

  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: isFollowingUser 
      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
      : 'btn-primary',
    secondary: isFollowingUser
      ? 'glass hover:bg-white/10 text-white'
      : 'glass hover:bg-white/10 text-white border border-purple-500',
    outline: isFollowingUser
      ? 'border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
      : 'border border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          rounded-xl font-medium transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2
        `}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {isFollowingUser ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Following</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Follow</span>
              </>
            )}
          </>
        )}
      </button>
      
      {showFollowerCount && (
        <span className="text-sm text-gray-400">
          {followerCount} followers
        </span>
      )}
    </div>
  );
};

export default FollowButton;