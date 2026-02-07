import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useTipNotifications } from '../hooks/useTipNotifications';
import ConnectWalletButton from './ConnectWalletButton';
import SearchModal from './SearchModal';

const Navbar = () => {
  const location = useLocation();
  const { isConnected } = useWeb3();
  const { unreadCount } = useTipNotifications();
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

  const isMessages = location.pathname === '/messages';

  const navItems = [
    {
      path: '/', label: 'Home', icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      path: '/search', label: 'Search', icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      path: '/explore', label: 'Explore', icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/messages', label: 'Messages', icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      path: '/upload', label: 'Create', icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      path: '/profile', label: 'Profile', icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen border-r border-white/10 bg-black z-[100] transition-all duration-300 ease-in-out group w-20 hover:w-64 hover:bg-black/95 hover:backdrop-blur-xl hover:shadow-[15px_0_30px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col h-full p-3 pt-8 overflow-hidden">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-10 px-3 transition-all duration-300 justify-center group-hover:justify-start">
             <div className="flex-shrink-0">
               <img
                src="/socio3.png"
                alt="Socio3 Logo"
                className="w-10 h-10 rounded-xl shadow-lg transition-transform duration-300"
              />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight transition-all duration-300 overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-4 whitespace-nowrap">
              Socio3
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.path === '/search' ? (e) => { e.preventDefault(); setIsSearchOpen(true); } : undefined}
                className={`flex items-center p-3 rounded-xl transition-all duration-200 relative group/item justify-center group-hover:justify-start ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="transition-transform duration-300 flex-shrink-0 group-hover/item:scale-110">
                  {item.icon}
                </div>
                <span className="text-lg font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-4">
                  {item.label}
                </span>
                
                {item.path === '/profile' && unreadCount > 0 && (
                  <div className={`absolute top-1 transition-all duration-300 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-black z-10 ${
                    item.path === location.pathname ? 'border-white/20' : 'border-black'
                  } right-1 group-hover:right-3`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom Sidebar Action - Wallet/Connect */}
          <div className="mt-auto p-2 transition-all duration-300 flex justify-center group-hover:justify-start">
             <ConnectWalletButton showText={false} forceShowTextOnHover={true} />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Fixed Bottom */}
      {isConnected && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/95 backdrop-blur-xl z-50 pb-safe">
          <div className="flex justify-between items-center px-6 py-3">
            {navItems
              .filter(item => ['/', '/explore', '/upload', '/messages', '/profile'].includes(item.path))
              .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 relative ${location.pathname === item.path
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80'
                  }`}
              >
                <div className={`${location.pathname === item.path ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {item.icon}
                </div>
                {item.path === '/profile' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;