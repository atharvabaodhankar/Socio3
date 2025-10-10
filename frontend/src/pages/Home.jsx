import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { isConnected, account } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Welcome to Socio3
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            The decentralized social media platform where you truly own your content. 
            Share posts, connect with creators, and tip with crypto.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">True Ownership</h3>
            <p className="text-gray-400">Your posts are stored on IPFS and blockchain, ensuring permanent ownership.</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Crypto Tips</h3>
            <p className="text-gray-400">Support your favorite creators directly with cryptocurrency tips.</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold mb-2">Decentralized</h3>
            <p className="text-gray-400">No central authority controls your data or content.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-gray-400">Connect your wallet to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Feed</h1>
        <p className="text-gray-400">Welcome back, {account?.slice(0, 6)}...{account?.slice(-4)}</p>
      </div>
      
      {/* Feed will be implemented here */}
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-4">Start following creators or create your first post!</p>
          <div className="flex gap-4 justify-center">
            <button className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors">
              Explore Posts
            </button>
            <button className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition-colors">
              Create Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;