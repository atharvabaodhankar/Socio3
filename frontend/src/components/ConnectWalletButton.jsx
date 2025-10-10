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
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            Wrong Network
          </div>
        )}
        <div className="bg-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-mono">{formatAddress(account)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-white transition-colors"
          title="Disconnect Wallet"
        >
          ⏻
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
    >
      {isConnecting ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

export default ConnectWalletButton;