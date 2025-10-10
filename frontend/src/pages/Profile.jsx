import React from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Profile = () => {
  const { address } = useParams();
  const { account, formatAddress, isConnected } = useWeb3();
  
  // Determine if this is the current user's profile
  const isOwnProfile = !address || address.toLowerCase() === account?.toLowerCase();
  const profileAddress = address || account;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to View Profile</h2>
        <p className="text-gray-400">Connect your wallet to view profiles and interact with the community.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">
              {formatAddress(profileAddress)}
            </h1>
            <p className="text-gray-400 mb-4">
              Web3 Creator • Blockchain Enthusiast
            </p>
            
            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold">12</div>
                <div className="text-sm text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">1.2K</div>
                <div className="text-sm text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">345</div>
                <div className="text-sm text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">2.5 ETH</div>
                <div className="text-sm text-gray-400">Tips Earned</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center md:justify-start space-x-4">
              {isOwnProfile ? (
                <button className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-medium transition-colors">
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-lg font-medium transition-colors">
                    Follow
                  </button>
                  <button className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-medium transition-colors">
                    Tip
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample posts */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-4xl">🖼️</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Sample post caption #{i}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>❤️ {Math.floor(Math.random() * 50) + 1}</span>
                    <span>💰 {(Math.random() * 0.1).toFixed(3)} ETH</span>
                  </div>
                  <span>{Math.floor(Math.random() * 24) + 1}h ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {isOwnProfile && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-4">Share your first post with the community!</p>
            <button className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-lg font-medium transition-colors">
              Create Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;