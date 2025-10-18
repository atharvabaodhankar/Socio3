import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { usePosts } from '../hooks/usePosts';
import { useContracts } from '../hooks/useContracts';
import { useFollow } from '../hooks/useFollow';
import PostModal from '../components/PostModal';
import EditProfileModal from '../components/EditProfileModal';
import FollowButton from '../components/FollowButton';
import { getUserProfile, getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';

const Profile = () => {
  const { address } = useParams();
  const { account, formatAddress, isConnected, provider } = useWeb3();
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Determine if this is the current user's profile
  const isOwnProfile = !address || address.toLowerCase() === account?.toLowerCase();
  const profileAddress = address || account;
  
  // Fetch posts for this profile - ensure it updates when account changes
  const { posts, loading, error, refetch } = usePosts(profileAddress);
  const { getFollowerCount } = useContracts();
  const { followerCount: liveFollowerCount } = useFollow(profileAddress);

  // Load user profile
  useEffect(() => {
    if (profileAddress && provider) {
      loadUserProfile();
    }
  }, [profileAddress, provider, account]); // Add account as dependency

  // Reset profile state when account changes (for own profile)
  useEffect(() => {
    if (isOwnProfile) {
      setUserProfile(null);
      setProfileLoading(true);
    }
  }, [account, isOwnProfile]);

  const loadUserProfile = async () => {
    if (!profileAddress || !provider) return;
    
    console.log('Loading profile for address:', profileAddress);
    
    try {
      setProfileLoading(true);
      const profile = await getUserProfile(provider, profileAddress);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set default profile on error (for accounts created before ProfileContract)
      setUserProfile({
        userAddress: profileAddress.toLowerCase(),
        username: '',
        displayName: '',
        bio: '',
        website: '',
        twitter: '',
        profileImage: '',
        coverImage: '',
        exists: false
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  const openPostModal = (index) => {
    setSelectedPostIndex(index);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPostIndex(null);
  };

  const goToNextPost = () => {
    if (selectedPostIndex < posts.length - 1) {
      setSelectedPostIndex(selectedPostIndex + 1);
    }
  };

  const goToPrevPost = () => {
    if (selectedPostIndex > 0) {
      setSelectedPostIndex(selectedPostIndex - 1);
    }
  };



  // If no wallet connected and no address provided, show connect message
  if (!isConnected && !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to View Your Profile</h2>
        <p className="text-gray-400">Connect your wallet to view your profile and interact with the community.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Setup Profile Banner */}
      {isOwnProfile && userProfile && !userProfile.exists && !profileLoading && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Complete Your Web3 Profile</h3>
              <p className="text-purple-100">
                Set up your username, profile picture, and bio to get the full Socio3 experience!
              </p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-white font-medium transition-colors"
            >
              Setup Now
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="glass rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-full flex items-center justify-center text-4xl shadow-2xl overflow-hidden">
              {userProfile?.profileImage ? (
                <img
                  src={getIPFSUrl(userProfile.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {(userProfile?.username || profileAddress)?.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2 text-white">
                {profileLoading ? (
                  <div className="w-48 h-8 bg-gray-700 rounded animate-pulse"></div>
                ) : userProfile?.exists ? (
                  getDisplayName(userProfile, profileAddress)
                ) : (
                  formatAddress(profileAddress)
                )}
              </h1>
              {!profileLoading && profileAddress && (
                <p className="text-gray-400 text-sm mb-2">
                  {formatAddress(profileAddress)}
                </p>
              )}
              {profileLoading ? (
                <div className="w-64 h-6 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <p className="text-gray-400 text-lg">
                  {userProfile?.bio ? (
                    userProfile.bio
                  ) : userProfile?.exists ? (
                    'Web3 Creator • Blockchain Enthusiast • NFT Artist'
                  ) : (
                    'New to Socio3 • Setup your profile to get started!'
                  )}
                </p>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{posts.length}</div>
                <div className="text-sm text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{liveFollowerCount}</div>
                <div className="text-sm text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  {posts.reduce((total, post) => total + post.tips, 0).toFixed(3)} ETH
                </div>
                <div className="text-sm text-gray-400">Tips Earned</div>
              </div>
            </div>
            
            {/* Bio */}
            {userProfile?.bio && (
              <p className="text-gray-300 mb-6 max-w-md">
                {userProfile.bio}
              </p>
            )}

            {/* Links */}
            {(userProfile?.website || userProfile?.twitter) && (
              <div className="flex items-center space-x-4 mb-6">
                {userProfile.website && (
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    🌐 Website
                  </a>
                )}
                {userProfile.twitter && (
                  <a
                    href={`https://twitter.com/${userProfile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    🐦 @{userProfile.twitter}
                  </a>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-center md:justify-start space-x-4">
              {isOwnProfile ? (
                <>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="glass px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>{userProfile?.exists ? 'Edit Profile' : 'Setup Profile'}</span>
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="glass px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center space-x-2"
                    title="Refresh profile data"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                </>
              ) : (
                <>
                  <FollowButton 
                    userAddress={profileAddress}
                    size="large"
                    variant="primary"
                  />
                  <button className="glass px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Tip</span>
                  </button>
                  <button className="glass px-4 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 glass rounded-2xl p-1">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors ${
              activeTab === 'posts' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Posts</span>
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors ${
              activeTab === 'liked' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Liked</span>
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors ${
              activeTab === 'saved' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>Saved</span>
          </button>
        </div>
      </div>

      {/* Posts Content */}
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
      ) : activeTab === 'posts' && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              onClick={() => openPostModal(index)}
              className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg md:rounded-2xl cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 relative group overflow-hidden"
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
                <svg className="w-8 h-8 md:w-12 md:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg md:rounded-2xl flex items-center justify-center">
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-sm font-medium">{post.tips.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'liked' ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">No Liked Posts</h3>
          <p className="text-gray-400">Posts you like will appear here.</p>
        </div>
      ) : activeTab === 'saved' ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">No Saved Posts</h3>
          <p className="text-gray-400">Posts you save will appear here.</p>
        </div>
      ) : null}
        
      {/* Empty state for own profile */}
      {isOwnProfile && posts.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">Share Your First Post</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Start your Web3 social journey by sharing your first post with the community.
          </p>
          <button 
            onClick={() => window.location.href = '/upload'} 
            className="btn-primary px-8 py-3 rounded-xl font-medium"
          >
            Create Post
          </button>
        </div>
      )}

      {/* Post Modal */}
      <PostModal
        post={selectedPostIndex !== null ? posts[selectedPostIndex] : null}
        isOpen={isModalOpen}
        onClose={closePostModal}
        onNext={goToNextPost}
        onPrev={goToPrevPost}
        hasNext={selectedPostIndex !== null && selectedPostIndex < posts.length - 1}
        hasPrev={selectedPostIndex !== null && selectedPostIndex > 0}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;