import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useFollow } from '../hooks/useFollow';
import { useWeb3 } from '../context/Web3Context';
import { getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { formatAddress } = useWeb3();
  const { searchResults, loading, error, searchUsers, clearSearch } = useSearch();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleUserClick(searchResults[selectedIndex].address);
      }
    }
  };

  const handleUserClick = (address) => {
    onClose();
    setQuery('');
    clearSearch();
    navigate(`/profile/${address}`);
  };

  const handleClose = () => {
    setQuery('');
    clearSearch();
    setSelectedIndex(-1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 z-[999]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-16 px-4">
        <div 
          className="bg-black border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Search Users</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by username, name, or address..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/5 text-white placeholder-white/40 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    clearSearch();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Searching...</p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white mb-2">Search Error</p>
                <p className="text-white/60 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && query && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-white mb-2">No users found</p>
                <p className="text-white/60 text-sm">Try different keywords or check spelling</p>
              </div>
            )}

            {!loading && searchResults.length > 0 && (
              <div className="p-2">
                <div className="text-sm text-white/60 px-3 py-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((result, index) => (
                  <SearchResultItem
                    key={result.address}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleUserClick(result.address)}
                    formatAddress={formatAddress}
                  />
                ))}
              </div>
            )}

            {!query && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-white/80 mb-2">Search for users</p>
                <p className="text-white/60 text-sm">Search by username, display name, or wallet address</p>
                <div className="mt-4 text-xs text-white/40 flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Use ↑↓ arrows to navigate, Enter to select</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const SearchResultItem = ({ result, isSelected, onClick, formatAddress }) => {
  const { isFollowingUser, followerCount, loading, toggleFollow, canFollow } = useFollow(result.address);
  
  const displayName = getDisplayName(result.profile, result.address);
  
  const handleFollowClick = (e) => {
    e.stopPropagation();
    toggleFollow();
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 mx-2 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected 
          ? 'bg-white/10 border-white/20' 
          : 'hover:bg-white/5 border-transparent hover:border-white/10'
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {result.profile?.profileImage ? (
            <img
              src={getIPFSUrl(result.profile.profileImage)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-black font-semibold text-lg">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-white truncate text-lg">{displayName}</h3>
            {result.matchType === 'username' && (
              <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">
                @username
              </span>
            )}
            {result.matchType === 'displayName' && (
              <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">
                display name
              </span>
            )}
          </div>
          <p className="text-sm text-white/60 truncate mb-1">
            {formatAddress(result.address)}
          </p>
          {result.profile?.bio && (
            <p className="text-sm text-white/80 line-clamp-2 mb-2">
              {result.profile.bio}
            </p>
          )}
          <div className="flex items-center space-x-4 text-xs text-white/40">
            <span>{followerCount} followers</span>
            {result.profile?.postCount && (
              <span>{result.profile.postCount} posts</span>
            )}
          </div>
        </div>
      </div>

      {canFollow && (
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleFollowClick}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
              isFollowingUser
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                : 'bg-white hover:bg-white/90 text-black shadow-lg'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : isFollowingUser ? (
              'Following'
            ) : (
              'Follow'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchModal;