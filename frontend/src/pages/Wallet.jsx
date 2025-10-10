import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const Wallet = () => {
  const { account, provider, isConnected, formatAddress } = useWeb3();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && provider && account) {
      fetchBalance();
    }
  }, [isConnected, provider, account]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to View Details</h2>
        <p className="text-gray-400">Connect your wallet to view your balance and transaction history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-gray-400">Manage your crypto assets and view transaction history</p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">ETH Balance</h3>
            <div className="text-2xl">💰</div>
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold mb-2">{parseFloat(balance).toFixed(4)} ETH</div>
              <div className="text-sm opacity-80">≈ ${(parseFloat(balance) * 2000).toFixed(2)} USD</div>
            </>
          )}
        </div>

        {/* Wallet Info Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wallet Address</h3>
            <div className="text-2xl">🔑</div>
          </div>
          <div className="font-mono text-sm bg-slate-700 p-3 rounded-lg mb-4">
            {account}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(account)}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Copy Address
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <div className="text-2xl mb-2">📤</div>
          <div className="text-2xl font-bold text-green-400">2.5 ETH</div>
          <div className="text-sm text-gray-400">Tips Received</div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <div className="text-2xl mb-2">📥</div>
          <div className="text-2xl font-bold text-blue-400">0.8 ETH</div>
          <div className="text-sm text-gray-400">Tips Sent</div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-purple-400">42</div>
          <div className="text-sm text-gray-400">Total Transactions</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        
        <div className="space-y-4">
          {/* Sample transactions */}
          {[
            { type: 'received', amount: '0.05', from: '0x1234...5678', time: '2 hours ago' },
            { type: 'sent', amount: '0.02', to: '0x9876...4321', time: '1 day ago' },
            { type: 'received', amount: '0.1', from: '0x5555...9999', time: '3 days ago' },
          ].map((tx, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'received' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {tx.type === 'received' ? '↓' : '↑'}
                </div>
                <div>
                  <div className="font-medium">
                    {tx.type === 'received' ? 'Tip Received' : 'Tip Sent'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.type === 'received' ? `From ${formatAddress(tx.from)}` : `To ${formatAddress(tx.to)}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  tx.type === 'received' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.type === 'received' ? '+' : '-'}{tx.amount} ETH
                </div>
                <div className="text-sm text-gray-400">{tx.time}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <button className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-medium transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;