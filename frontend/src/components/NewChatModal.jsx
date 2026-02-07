import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useWeb3 } from '../context/Web3Context';
import { getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';

const NewChatModal = ({ isOpen, onClose, onSelect }) => {
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
    onSelect(address);
    handleClose();
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
        className="fixed inset-0 bg-black/90 z-[999] backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-16 px-4">
        <div 
          className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[70vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white">New Message</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">To:</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white placeholder-white/20 pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-colors border-none text-lg"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/40">Searching users...</p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <p className="text-red-400 mb-2">Search Error</p>
                <p className="text-white/40 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && query && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-white/40">No users found for "{query}"</p>
              </div>
            )}

            {!loading && searchResults.length > 0 && (
              <div className="py-2">
                {searchResults.map((result, index) => {
                  const displayName = getDisplayName(result.profile, result.address);
                  return (
                    <div
                      key={result.address}
                      onClick={() => handleUserClick(result.address)}
                      className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                        index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mr-4">
                        {result.profile?.profileImage ? (
                          <img
                            src={getIPFSUrl(result.profile.profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-black font-bold text-lg">
                            {displayName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{displayName}</h4>
                        <p className="text-sm text-white/40 truncate">{formatAddress(result.address)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!query && !loading && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-white/60 font-medium">No accounts found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewChatModal;
