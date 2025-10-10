import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const Explore = () => {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to Explore</h2>
        <p className="text-gray-400">Connect your wallet to discover amazing content from creators around the world.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-gray-400">Discover trending posts and new creators</p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-4 mb-8">
        <button className="bg-violet-600 px-4 py-2 rounded-lg font-medium">
          Trending
        </button>
        <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors">
          Most Tipped
        </button>
        <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors">
          Recent
        </button>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder posts */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <div className="aspect-square bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-4xl">🖼️</span>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
                <span className="text-sm text-gray-400">0x1234...5678</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Sample post caption goes here...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>❤️ 12</span>
                  <span>💰 0.05 ETH</span>
                </div>
                <span>2h ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="text-center mt-8">
        <button className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium transition-colors">
          Load More Posts
        </button>
      </div>
    </div>
  );
};

export default Explore;