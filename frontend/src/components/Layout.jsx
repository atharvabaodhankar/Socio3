import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ScrollToTop from './ScrollToTop';
import WalletConnectionHandler from './WalletConnectionHandler';

const Layout = ({ children }) => {
  const location = useLocation();
  const isMessages = location.pathname === '/messages';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <WalletConnectionHandler />
      <div className="md:pl-20 transition-all duration-300">
        <main className="max-w-6xl mx-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Layout;
