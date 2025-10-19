import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getTipStats } from '../services/tipService';

const TipDashboard = ({ userAddress }) => {
  const { formatAddress } = useWeb3();
  const [stats, setStats] = useState({
    totalReceived: '0',
    totalSent: '0',
    tipCount: 0,
    sentCount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userAddress) {
      loadStats();
    }
  }, [userAddress]);

  const loadStats = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const tipStats = await getTipStats(userAddress);
      setStats(tipStats);
    } catch (error) {
      console.error('Error loading tip stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <span>Tip Statistics</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-green-400 text-2xl font-bold">
            {stats.totalReceived} ETH
          </div>
          <div className="text-gray-400 text-sm">
            Received ({stats.tipCount} tips)
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-blue-400 text-2xl font-bold">
            {stats.totalSent} ETH
          </div>
          <div className="text-gray-400 text-sm">
            Sent ({stats.sentCount} tips)
          </div>
        </div>
      </div>
      
      {stats.tipCount === 0 && stats.sentCount === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            No tip activity yet. Start by tipping other creators!
          </p>
        </div>
      )}
    </div>
  );
};

export default TipDashboard;