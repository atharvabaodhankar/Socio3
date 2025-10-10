import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import PostCard from '../components/PostCard';

const Explore = () => {
  const { isConnected, formatAddress } = useWeb3();
  const [activeTab, setActiveTab] = useState('trending');

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="glass p-12 rounded-2xl max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Discover Amazing Content</h2>
          <p className="text-gray-400 leading-relaxed">Connect your wallet to explore trending posts and discover new creators from around the world.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'tipped', label: 'Most Tipped', icon: '💰' },
    { id: 'recent', label: 'Recent', icon: '⏰' }
  ];

  // Sample posts data
  const samplePosts = [
    {
      id: 1,
      author: '0x1234567890123456789012345678901234567890',
      caption: 'Just deployed my first smart contract! 🚀 #Web3 #Ethereum',
      timestamp: '2 hours ago',
      likes: 24,
      tips: '0.15',
      commentCount: 8,
      comments: [
        { author: '0x9876543210987654321098765432109876543210', text: 'Congrats! 🎉' },
        { author: '0x1111222233334444555566667777888899990000', text: 'Amazing work!' }
      ]
    },
    {
      id: 2,
      author: '0x9876543210987654321098765432109876543210',
      caption: 'Beautiful sunset from my balcony 🌅',
      timestamp: '4 hours ago',
      likes: 156,
      tips: '0.08',
      commentCount: 23
    },
    {
      id: 3,
      author: '0x1111222233334444555566667777888899990000',
      caption: 'Building the future of social media, one block at a time ⛓️',
      timestamp: '6 hours ago',
      likes: 89,
      tips: '0.22',
      commentCount: 15
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Explore</h1>
        <p className="text-gray-400 text-lg">Discover trending posts and new creators</p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-8 p-1 glass rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="col-span-2 space-y-8">
            {samplePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Creators */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Trending Creators</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{i}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">creator{i}.eth</p>
                        <p className="text-xs text-gray-400">{Math.floor(Math.random() * 1000)}K followers</p>
                      </div>
                    </div>
                    <button className="btn-primary px-3 py-1 rounded-lg text-xs">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Posts Grid */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Top Posts</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">{i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Posts Grid for Mobile */}
        <div className="grid grid-cols-3 gap-1 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Feed View Toggle */}
        <div className="text-center mb-8">
          <button className="btn-primary px-6 py-3 rounded-xl font-medium">
            Switch to Feed View
          </button>
        </div>
      </div>

      {/* Load more */}
      <div className="text-center mt-12">
        <button className="glass px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-200">
          Load More Posts
        </button>
      </div>
    </div>
  );
};

export default Explore;