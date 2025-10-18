import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import ConnectWalletButton from './ConnectWalletButton';
import SearchModal from './SearchModal';

const Navbar = () => {
  const location = useLocation();
  const { isConnected } = useWeb3();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for search (Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isConnected) {
          setIsSearchOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isConnected]);

  const navItems = [
    { path: '/', label: 'Home', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )},
    { path: '/explore', label: 'Explore', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    { path: '/search', label: 'Search', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    { path: '/upload', label: 'Create', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )},
    { path: '/profile', label: 'Profile', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    )},
    { path: '/wallet', label: 'Wallet', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )}
  ];

  return (
    <nav className="bg-black/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S3</span>
            </div>
            <span className="text-2xl font-bold gradient-text hidden sm:block">
              Socio3
            </span>
          </Link>

          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Search Button */}
            {isConnected && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5"
                title="Search users (Ctrl+K)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-medium">Search</span>
                <kbd className="hidden lg:inline-block ml-2 px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>

          {/* Connect Wallet Button */}
          <ConnectWalletButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isConnected && (
        <div className="md:hidden border-t border-gray-800/50 bg-black/90 backdrop-blur-xl">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs mt-1 font-medium">Search</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;