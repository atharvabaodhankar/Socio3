import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { usePosts } from '../hooks/usePosts';
import { useFeed } from '../hooks/useFeed';
import { useTrendingCreators } from '../hooks/useTrending';
import { getDisplayName } from '../services/profileService';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import FollowButton from '../components/FollowButton';
import AutoScrollButton from '../components/AutoScrollButton';

const Home = () => {
  const navigate = useNavigate();
  const { isConnected, account, formatAddress, provider } = useWeb3();
  // Remove activeTab state since we only show following feed
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch all posts
  const { posts, loading: postsLoading, error: postsError } = usePosts();
  
  // Get feed data
  const { 
    followingFeed, 
    allPostsFeed, 
    hasFollowingUsers, 
    loading: feedLoading 
  } = useFeed(posts);
  
  // Get suggested creators to follow (exclude current user)
  const { trendingCreators } = useTrendingCreators(posts, account, 3);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
          {/* Subtle Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center max-w-5xl mx-auto">
            {/* Logo with Animation */}
            <div className="mb-8 flex justify-center">
              <img 
                src="/socio3.png" 
                alt="Socio3 Logo" 
                className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-float"
              />
            </div>
            
            {/* Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight text-white">
              Socio3
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-white/80 font-light mb-8 tracking-wide">
              Own Your Social
            </p>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
              The first truly decentralized social platform. Create, share, and monetize your content 
              with complete ownership through blockchain technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="bg-white hover:bg-white/90 text-black px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                Connect Wallet
              </button>
              <Link 
                to="/explore" 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-lg font-medium rounded-xl inline-flex items-center transition-all duration-200 hover:scale-105"
              >
                Explore Posts
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <svg className="w-5 h-5 text-white/40 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-32 px-4 bg-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Why Socio3?
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
                Experience true ownership, direct monetization, and complete freedom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl card-hover group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">True Ownership</h3>
                <p className="text-white/60 leading-relaxed font-light">
                  Your content lives on IPFS and Ethereum. No platform can delete or censor your posts.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl card-hover group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Direct Monetization</h3>
                <p className="text-white/60 leading-relaxed font-light">
                  Earn ETH directly from your audience. No middleman, no fees, instant payments.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl card-hover group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Decentralized</h3>
                <p className="text-white/60 leading-relaxed font-light">
                  Built on Ethereum. No single point of failure, no corporate control.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-32 px-4 bg-black/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                How It Works
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
                Get started in four simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-semibold text-white">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Connect</h3>
                <p className="text-white/60 text-sm font-light">Connect your Web3 wallet</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-semibold text-white">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Profile</h3>
                <p className="text-white/60 text-sm font-light">Set up your identity</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-semibold text-white">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Create</h3>
                <p className="text-white/60 text-sm font-light">Share your content</p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-semibold text-white">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Earn</h3>
                <p className="text-white/60 text-sm font-light">Receive crypto tips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-24 px-4 bg-black">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-white/50 text-sm font-light">Decentralized</div>
              </div>
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">0%</div>
                <div className="text-white/50 text-sm font-light">Platform Fees</div>
              </div>
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">∞</div>
                <div className="text-white/50 text-sm font-light">Ownership</div>
              </div>
              <div className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/50 text-sm font-light">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-32 px-4 bg-black">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/60 mb-12 font-light">
              Join the future of social media. Connect your wallet and start sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-white/90 text-black px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                Connect Wallet
              </button>
              <Link 
                to="/explore" 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-10 py-4 text-lg font-medium rounded-xl inline-flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                Explore Posts
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-16 px-4 border-t border-white/10 bg-black">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <img 
                src="/socio3.png" 
                alt="Socio3 Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-white">Socio3</span>
            </div>
            <div className="text-white/40 text-sm font-light">
              Built on Ethereum • Powered by IPFS
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use following feed as the main feed, fallback to all posts if no following
  const currentFeed = hasFollowingUsers ? followingFeed : allPostsFeed;

  const openPostModal = (index) => {
    setSelectedPostIndex(index);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPostIndex(null);
  };

  const goToNextPost = () => {
    if (selectedPostIndex < currentFeed.length - 1) {
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3">
          {/* Stories Section */}
          <div className="mb-8">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              <Link to="/upload" className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Your story</span>
              </Link>
              {trendingCreators.slice(0, 5).map((creator, i) => (
                <div 
                  key={creator.address} 
                  className="flex-shrink-0 text-center cursor-pointer"
                  onClick={() => navigate(`/profile/${creator.address}`)}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-2 hover:scale-105 transition-transform">
                    <span className="text-white font-semibold text-sm">{i + 1}</span>
                  </div>
                  <span className="text-xs text-gray-400 hover:text-purple-300 transition-colors">
                    {creator.profile?.exists 
                      ? getDisplayName(creator.profile, creator.address).slice(0, 8)
                      : formatAddress(creator.address).slice(0, 8)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Header */}
          {isConnected && hasFollowingUsers && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Your Feed</h2>
              <p className="text-gray-400">Recent posts from people you follow ({followingFeed.length} posts)</p>
            </div>
          )}
          


          {/* Feed Content */}
          <div className="space-y-8">
            {postsLoading || feedLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : postsError ? (
              <div className="text-center py-16">
                <p className="text-red-400 mb-4">Error loading posts: {postsError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-primary px-6 py-3 rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : currentFeed.length > 0 ? (
              currentFeed.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => openPostModal(index)}
                />
              ))
            ) : !hasFollowingUsers ? (
              // No following users state - show recent posts from all users
              <>
                <div className="glass rounded-2xl p-8 text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Follow creators for a personalized feed</h3>
                  <p className="text-gray-400 mb-4">
                    Here are some recent posts to get you started
                  </p>
                  <Link 
                    to="/explore" 
                    className="btn-primary px-6 py-2 rounded-xl font-medium inline-flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Discover Creators</span>
                  </Link>
                </div>
                
                {/* Show recent posts from all users */}
                {allPostsFeed.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => openPostModal(index)}
                  />
                ))}
              </>
            ) : followingFeed.length === 0 ? (
              // Following users but no posts
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">No Recent Posts</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  The creators you follow haven't posted recently. Try following more creators or check back later.
                </p>
                <Link 
                  to="/explore" 
                  className="btn-primary px-8 py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Explore More</span>
                </Link>
              </div>
            ) : (
              // General empty state
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Welcome to Socio3</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Start your decentralized social journey. Follow creators, share content, and earn crypto rewards.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/explore" 
                    className="btn-primary px-8 py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Explore Posts</span>
                  </Link>
                  <Link 
                    to="/upload" 
                    className="glass px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Post</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {isConnected && (
          <div className="hidden lg:block space-y-6">
            {/* Suggested Creators */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Suggested for You</h3>
              <div className="space-y-4">
                {trendingCreators.slice(0, 3).map((creator) => (
                  <div key={creator.address} className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => navigate(`/profile/${creator.address}`)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {creator.profile?.exists 
                            ? getDisplayName(creator.profile, creator.address).slice(0, 2).toUpperCase()
                            : formatAddress(creator.address).slice(2, 4).toUpperCase()
                          }
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm hover:text-purple-300 transition-colors">
                          {creator.profile?.exists 
                            ? getDisplayName(creator.profile, creator.address)
                            : formatAddress(creator.address)
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {creator.followerCount} followers
                        </p>
                      </div>
                    </div>
                    <FollowButton 
                      userAddress={creator.address}
                      size="small"
                      variant="primary"
                    />
                  </div>
                ))}
              </div>
              <Link 
                to="/explore" 
                className="block text-center text-purple-400 hover:text-purple-300 text-sm mt-4 transition-colors"
              >
                See all suggestions
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/upload" 
                  className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Create Post</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">My Profile</span>
                </Link>
                <Link 
                  to="/explore" 
                  className="flex items-center space-x-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Explore</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        post={selectedPostIndex !== null ? currentFeed[selectedPostIndex] : null}
        isOpen={isModalOpen}
        onClose={closePostModal}
        onNext={goToNextPost}
        onPrev={goToPrevPost}
        hasNext={selectedPostIndex !== null && selectedPostIndex < currentFeed.length - 1}
        hasPrev={selectedPostIndex !== null && selectedPostIndex > 0}
      />

      {/* Auto Scroll Button */}
      {isConnected && <AutoScrollButton />}
    </div>
  );
};

export default Home;