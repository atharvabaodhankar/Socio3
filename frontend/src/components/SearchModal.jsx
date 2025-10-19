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
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Search Users</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by wallet address (0x...)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-800 text-white placeholder-gray-400 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    clearSearch();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Searching...</p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-400 mb-2">Search Error</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && query && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-2">No users found</p>
                <p className="text-gray-500 text-sm">Try searching with a valid wallet address</p>
              </div>
            )}

            {!loading && searchResults.length > 0 && (
              <div className="p-2">
                <div className="text-sm text-gray-400 px-3 py-2">
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
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-2">Search for users</p>
                <p className="text-gray-500 text-sm">Enter a wallet address to find users</p>
                <div className="mt-4 text-xs text-gray-600">
                  <p>💡 Use ↑↓ arrows to navigate, Enter to select</p>
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
          ? 'bg-purple-500/10 border-purple-500/30' 
          : 'hover:bg-gray-800/50 border-transparent hover:border-gray-700'
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {result.profile?.profileImage ? (
            <img
              src={getIPFSUrl(result.profile.profileImage)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-lg">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-white truncate text-lg">{displayName}</h3>
            {result.matchType === 'username' && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                @username
              </span>
            )}
            {result.matchType === 'displayName' && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                display name
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate mb-1">
            {formatAddress(result.address)}
          </p>
          {result.profile?.bio && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">
              {result.profile.bio}
            </p>
          )}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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