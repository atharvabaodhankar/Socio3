import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const ConnectWalletButton = () => {
  const { 
    account, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    isCorrectNetwork 
  } = useWeb3();

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        {!isCorrectNetwork && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
            Wrong Network
          </div>
        )}
        <div className="glass px-4 py-2 rounded-xl flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-gray-300">{formatAddress(account)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Disconnect Wallet"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="btn-primary px-6 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {isConnecting ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Connect Wallet</span>
        </div>
      )}
    </button>
  );
};

export default ConnectWalletButton;