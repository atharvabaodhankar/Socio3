import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const ConnectWalletButton = ({ showText = true, forceShowTextOnHover = false }) => {
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
      <div className={`flex items-center ${showText ? 'space-x-3' : 'flex-col space-y-4 group-hover:flex-row group-hover:space-y-0 group-hover:space-x-3'}`}>
        {!isCorrectNetwork && (showText || forceShowTextOnHover) && (
          <div className={`bg-white/10 border border-white/20 text-white/80 px-3 py-1 rounded-full text-sm font-medium ${!showText && forceShowTextOnHover ? 'hidden group-hover:block' : ''}`}>
            Wrong Network
          </div>
        )}
        <div className={`bg-white/5 border border-white/10 rounded-xl flex items-center transition-all ${showText ? 'px-4 py-2 space-x-3' : 'p-3 group-hover:px-4 group-hover:py-2 group-hover:space-x-3'}`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0"></div>
          {(showText || forceShowTextOnHover) && (
            <span className={`text-sm font-mono text-white/80 ${!showText && forceShowTextOnHover ? 'hidden group-hover:block' : ''}`}>
              {formatAddress(account)}
            </span>
          )}
        </div>
        <button
          onClick={disconnectWallet}
          className="p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Disconnect Wallet"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className={`${showText ? 'px-6 py-2.5 btn-primary' : 'p-3 bg-white/10 group-hover:px-6 group-hover:py-2.5 group-hover:btn-primary'} rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 hover:bg-white/20 w-full`}
      title={!showText ? "Connect Wallet" : ""}
    >
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {(showText || forceShowTextOnHover) && (
           <span className={`whitespace-nowrap ${!showText && forceShowTextOnHover ? 'hidden group-hover:block' : ''}`}>
             {isConnecting ? 'Connecting...' : 'Connect Wallet'}
           </span>
        )}
      </div>
    </button>
  );
};

export default ConnectWalletButton;