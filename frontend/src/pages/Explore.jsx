import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import FollowButton from '../components/FollowButton';
import AutoScrollButton from '../components/AutoScrollButton';

const Explore = () => {
  const navigate = useNavigate();
  const { isConnected, formatAddress } = useWeb3();
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { posts, loading, error } = usePosts(); // Fetch all posts

  // Users can browse posts without connecting wallet

  const tabs = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'tipped', label: 'Most Tipped', icon: '💰' },
    { id: 'recent', label: 'Recent', icon: '⏰' }
  ];

  // Sort posts based on active tab
  const getSortedPosts = () => {
    if (!posts.length) return [];
    
    switch (activeTab) {
      case 'trending':
        return [...posts].sort((a, b) => b.likes - a.likes);
      case 'tipped':
        return [...posts].sort((a, b) => b.tips - a.tips);
      case 'recent':
      default:
        return [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  };

  const sortedPosts = getSortedPosts();

  const openPostModal = (index) => {
    setSelectedPostIndex(index);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPostIndex(null);
  };

  const goToNextPost = () => {
    if (selectedPostIndex < sortedPosts.length - 1) {
      setSelectedPostIndex(selectedPostIndex + 1);
    }
  };

  const goToPrevPost = () => {
    if (selectedPostIndex > 0) {
      setSelectedPostIndex(selectedPostIndex - 1);
    }
  };

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
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-400 mb-4">Error loading posts: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-primary px-6 py-3 rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : sortedPosts.length > 0 ? (
              sortedPosts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => openPostModal(index)}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">No Posts Yet</h3>
                <p className="text-gray-400">Be the first to share something amazing!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Creators */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Trending Creators</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => navigate(`/profile/0x${i.toString().padStart(40, '0')}`)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{i}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm hover:text-purple-300 transition-colors">creator{i}.eth</p>
                        <p className="text-xs text-gray-400">{Math.floor(Math.random() * 1000)}K followers</p>
                      </div>
                    </div>
                    <FollowButton 
                      userAddress={`0x${i.toString().padStart(40, '0')}`}
                      size="small"
                      variant="primary"
                    />
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
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sortedPosts.length > 0 ? (
          <>
            {/* Posts Grid for Mobile */}
            <div className="grid grid-cols-3 gap-1 mb-8">
              {sortedPosts.slice(0, 12).map((post, index) => (
                <div 
                  key={post.id} 
                  onClick={() => openPostModal(index)}
                  className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                >
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center">
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
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No Posts Yet</h3>
            <p className="text-gray-400">Be the first to share something amazing!</p>
          </div>
        )}
      </div>

      {/* Load more */}
      <div className="text-center mt-12">
        <button className="glass px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-200">
          Load More Posts
        </button>
      </div>

      {/* Post Modal */}
      <PostModal
        post={selectedPostIndex !== null ? sortedPosts[selectedPostIndex] : null}
        isOpen={isModalOpen}
        onClose={closePostModal}
        onNext={goToNextPost}
        onPrev={goToPrevPost}
        hasNext={selectedPostIndex !== null && selectedPostIndex < sortedPosts.length - 1}
        hasPrev={selectedPostIndex !== null && selectedPostIndex > 0}
      />

      {/* Auto Scroll Button */}
      <AutoScrollButton />
    </div>
  );
};

export default Explore;