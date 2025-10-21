import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { usePosts } from '../hooks/usePosts';
import { useTrendingCreators, useTopPosts } from '../hooks/useTrending';
import { getDisplayName } from '../services/profileService';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import FollowButton from '../components/FollowButton';
import AutoScrollButton from '../components/AutoScrollButton';

const Explore = () => {
  const navigate = useNavigate();
  const { isConnected, formatAddress, account } = useWeb3();
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { posts, loading, error } = usePosts(); // Fetch all posts
  
  // Fetch trending data (exclude current user from trending creators)
  const { trendingCreators, loading: creatorsLoading } = useTrendingCreators(posts, account, 5);
  const { topPosts, loading: topPostsLoading } = useTopPosts(posts, 9);

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
        <h1 className="text-4xl font-bold text-white mb-2">Explore</h1>
        <p className="text-white/60 text-lg">Discover trending posts and new creators</p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-8 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
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
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-white/60 mb-4">Error loading posts: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-white hover:bg-white/80 text-black px-6 py-3 rounded-xl font-medium transition-colors"
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
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">No Posts Yet</h3>
                <p className="text-white/60">Be the first to share something amazing!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Creators */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Trending Creators</h3>
              <div className="space-y-4">
                {creatorsLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
                        <div>
                          <div className="w-20 h-4 bg-white/10 rounded animate-pulse mb-1"></div>
                          <div className="w-16 h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-16 h-8 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : trendingCreators.length > 0 ? (
                  trendingCreators.map((creator, index) => (
                    <div key={creator.address} className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                        onClick={() => navigate(`/profile/${creator.address}`)}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-semibold text-sm">{index + 1}</span>
                          </div>
                          {/* Trending badge */}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs">🔥</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm hover:text-white/80 transition-colors">
                            {creator.profile?.exists 
                              ? getDisplayName(creator.profile, creator.address)
                              : formatAddress(creator.address)
                            }
                          </p>
                          <p className="text-xs text-white/60">
                            {creator.followerCount} followers • {creator.postCount} posts
                          </p>
                        </div>
                      </div>
                      <FollowButton 
                        userAddress={creator.address}
                        size="small"
                        variant="primary"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/60 text-sm">No trending creators yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Posts Grid */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Top Posts</h3>
              <div className="grid grid-cols-3 gap-2">
                {topPostsLoading ? (
                  // Loading skeleton
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white/10 rounded-lg animate-pulse"></div>
                  ))
                ) : topPosts.length > 0 ? (
                  topPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="aspect-square bg-white/10 rounded-lg cursor-pointer hover:scale-105 transition-transform relative group overflow-hidden"
                      onClick={() => {
                        // Find the post in the main posts array and open modal
                        const postIndex = sortedPosts.findIndex(p => p.id === post.id);
                        if (postIndex !== -1) {
                          openPostModal(postIndex);
                        }
                      }}
                    >
                      {post.imageUrl ? (
                        <img 
                          src={post.imageUrl} 
                          alt="Top Post" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Top post indicator */}
                      <div className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                      
                      {/* Hover overlay with stats */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="flex items-center justify-center space-x-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span>{post.likesCount}</span>
                            </div>
                            {post.tips > 0 && (
                              <div className="flex items-center space-x-1">
                                <span>💰</span>
                                <span>{post.tips.toFixed(3)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white/40 text-xs">No posts</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sortedPosts.length > 0 ? (
          <>
            {/* Posts Grid for Mobile */}
            <div className="grid grid-cols-3 gap-1 mb-8">
              {sortedPosts.slice(0, 12).map((post, index) => (
                <div 
                  key={post.id} 
                  onClick={() => openPostModal(index)}
                  className="aspect-square bg-white/10 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
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
                    <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Feed View Toggle */}
            <div className="text-center mb-8">
              <button className="bg-white hover:bg-white/80 text-black px-6 py-3 rounded-xl font-medium transition-colors">
                Switch to Feed View
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No Posts Yet</h3>
            <p className="text-white/60">Be the first to share something amazing!</p>
          </div>
        )}
      </div>

      {/* Load more */}
      <div className="text-center mt-12">
        <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 text-white">
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