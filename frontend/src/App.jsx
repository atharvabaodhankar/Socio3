import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import NetworkChecker from './components/NetworkChecker';
import AccountDebugger from './components/AccountDebugger';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Wallet from './pages/Wallet';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <NetworkChecker />
          <AccountDebugger />
          <main className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile/:address?" element={<Profile />} />
              <Route path="/wallet" element={<Wallet />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
