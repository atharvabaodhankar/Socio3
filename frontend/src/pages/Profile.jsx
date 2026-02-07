import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { usePosts } from '../hooks/usePosts';
import { useContracts } from '../hooks/useContracts';
import { useFollow } from '../hooks/useFollow';
import PostModal from '../components/PostModal';
import EditProfileModal from '../components/EditProfileModal';
import TipModal from '../components/TipModal';
import TipNotifications from '../components/TipNotifications';
import FollowButton from '../components/FollowButton';
import { getUserProfile, getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';

import { createUserMapping, getUserByAddress } from '../services/userMappingService';
import { getTipStats } from '../services/tipService';
import { useLikedPosts } from '../hooks/useLikedPosts';
import { useSavedPosts } from '../hooks/useSavedPosts';
import { createOrGetChat } from '../services/firebaseService';
import UserListModal from '../components/UserListModal';

const Profile = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const { account, formatAddress, isConnected, provider } = useWeb3();
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isTipNotificationsOpen, setIsTipNotificationsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tipStats, setTipStats] = useState({ totalReceived: '0', totalSent: '0', tipCount: 0, sentCount: 0 });

  // User List State
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followingCount, setFollowingCount] = useState(0); // Add state for following count
  const [listLoading, setListLoading] = useState(false);

  // Determine if this is the current user's profile
  const isOwnProfile = !address || address.toLowerCase() === account?.toLowerCase();
  const profileAddress = address || account;

  // Hooks for liked and saved posts
  const { likedPosts, loading: likedLoading, refreshLikedPosts } = useLikedPosts(profileAddress);
  const { savedPosts, loading: savedLoading, loadSavedPosts } = useSavedPosts();

  // Fetch posts for this profile - ensure it updates when account changes
  const { posts, loading, error, refetch } = usePosts(profileAddress);
  const { getFollowerCount, getFollowers, getFollowing } = useContracts();
  const { followerCount: liveFollowerCount } = useFollow(profileAddress);

  // Load user profile and tip stats
  useEffect(() => {
    if (profileAddress && provider) {
      // Reset profile state before loading
      setUserProfile(null);
      setProfileLoading(true);

      loadUserProfile();
      loadTipStats();

      // Load saved posts if it's own profile
      if (isOwnProfile && account) {
        loadSavedPosts();
      }
    }
  }, [profileAddress, provider, account, isOwnProfile]); // Add account as dependency

  // Separate effect to load following count
  useEffect(() => {
    if (profileAddress) {
      const loadFollowingCount = async () => {
        try {
          const following = await getFollowing(profileAddress);
          setFollowingCount(following.length);
        } catch (error) {
          console.error('Error loading following count:', error);
        }
      };
      loadFollowingCount();
    }
  }, [profileAddress, getFollowing]);

  const loadUserProfile = async () => {
    if (!profileAddress || !provider) {
      console.log('[Profile] Cannot load profile - missing address or provider');
      return;
    }

    console.log('[Profile] Loading profile for address:', profileAddress);

    try {
      setProfileLoading(true);
      const profile = await getUserProfile(provider, profileAddress);
      console.log('[Profile] Profile loaded:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('[Profile] Error loading user profile:', error);
      // Set default profile on error (for accounts created before ProfileContract)
      const defaultProfile = {
        userAddress: profileAddress.toLowerCase(),
        username: '',
        displayName: '',
        bio: '',
        website: '',
        twitter: '',
        profileImage: '',
        coverImage: '',
        exists: false
      };
      console.log('[Profile] Setting default profile:', defaultProfile);
      setUserProfile(defaultProfile);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadTipStats = async () => {
    if (!profileAddress) return;

    try {
      const stats = await getTipStats(profileAddress);
      setTipStats(stats);
    } catch (error) {
      console.error('Error loading tip stats:', error);
    }
  };

  const handleOpenFollowers = async () => {
    setIsFollowersModalOpen(true);
    setListLoading(true);
    try {
      const followerAddresses = await getFollowers(profileAddress);
      
      // Fetch user details for each address
      const usersWithDetails = await Promise.all(
        followerAddresses.map(async (addr) => {
          const user = await getUserByAddress(addr);
          return user || { address: addr };
        })
      );
      
      setFollowersList(usersWithDetails);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setListLoading(false);
    }
  };

  const handleOpenFollowing = async () => {
    setIsFollowingModalOpen(true);
    setListLoading(true);
    try {
      const followingAddresses = await getFollowing(profileAddress);
      
      // Fetch user details for each address
      const usersWithDetails = await Promise.all(
        followingAddresses.map(async (addr) => {
          const user = await getUserByAddress(addr);
          return user || { address: addr };
        })
      );
      
      setFollowingList(usersWithDetails);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setListLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile) => {
    console.log('[Profile] Profile updated, reloading from blockchain...');

    // Reload profile from blockchain to get fresh data
    await loadUserProfile();

    // Update Firebase mapping when profile is updated
    try {
      await createUserMapping(profileAddress, updatedProfile);
    } catch (error) {
      console.error('Error updating user mapping:', error);
    }
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
        <p className="text-white/60">Connect your wallet to view your profile and interact with the community.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Setup Profile Banner */}
      {isOwnProfile && userProfile && !userProfile.exists && !profileLoading && (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Complete Your Web3 Profile</h3>
              <p className="text-white/80">
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xl overflow-hidden">
              {userProfile?.profileImage ? (
                <img
                  src={getIPFSUrl(userProfile.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-black font-bold">
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
                  <div className="w-48 h-8 bg-white/10 rounded animate-pulse"></div>
                ) : (
                  getDisplayName(userProfile, profileAddress)
                )}
              </h1>
              {!profileLoading && profileAddress && (
                <p className="text-white/60 text-sm mb-2">
                  {formatAddress(profileAddress)}
                </p>
              )}
              {profileLoading ? (
                <div className="w-64 h-6 bg-white/10 rounded animate-pulse"></div>
              ) : (
                <p className="text-white/60 text-lg">
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

            <div className="grid grid-cols-2 gap-4 md:flex md:space-x-8 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-xl md:bg-transparent md:p-0">
                <div className="text-2xl font-bold text-white">{posts.length}</div>
                <div className="text-sm text-white/60">Posts</div>
              </div>
              <div 
                className="text-center p-3 bg-white/5 rounded-xl md:bg-transparent md:p-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleOpenFollowers}
              >
                <div className="text-2xl font-bold text-white">{liveFollowerCount}</div>
                <div className="text-sm text-white/60">Followers</div>
              </div>
              <div 
                className="text-center p-3 bg-white/5 rounded-xl md:bg-transparent md:p-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleOpenFollowing}
              >
                {/* We don't have a live count hook for following yet, so specific number might be slightly off until modal opens if not tracked elsewhere */}
                <div className="text-2xl font-bold text-white">{followingCount}</div>
                <div className="text-sm text-white/60">Following</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl md:bg-transparent md:p-0">
                <div className="text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  {(parseFloat(tipStats.totalReceived) + posts.reduce((total, post) => total + post.tips, 0)).toFixed(3)}
                  <span className="text-sm text-white/60 ml-1">ETH</span>
                </div>
                <div className="text-sm text-white/60">Tips Earned</div>
              </div>
            </div>

            {/* Bio */}
            {userProfile?.bio && (
              <p className="text-white/80 mb-6 max-w-md">
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
                    className="text-white/80 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <span>Website</span>
                  </a>
                )}
                {userProfile.twitter && (
                  <a
                    href={`https://twitter.com/${userProfile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <span>@{userProfile.twitter}</span>
                  </a>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 md:flex md:justify-start md:space-x-4">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="col-span-2 md:col-span-1 bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setIsTipNotificationsOpen(true)}
                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
                    title="View tip messages"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Tips</span>
                  </button>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
                    title="View wallet"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Wallet</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="col-span-2 md:w-auto">
                    <FollowButton
                      userAddress={profileAddress}
                      size="large"
                      variant="primary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!isConnected) {
                        alert('Please connect your wallet to send tips');
                        return;
                      }
                      setIsTipModalOpen(true);
                    }}
                    className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Tip</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!isConnected) {
                        alert('Please connect your wallet to send messages');
                        return;
                      }
                      try {
                        await createOrGetChat(account, profileAddress);
                        navigate('/messages');
                      } catch (error) {
                        console.error('Error creating chat:', error);
                        alert('Failed to create chat. Please try again.');
                      }
                    }}
                    className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors ${activeTab === 'posts' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors ${activeTab === 'liked' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Liked</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors ${activeTab === 'saved' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
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
      ) : activeTab === 'posts' && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              onClick={() => openPostModal(index)}
              className="aspect-square bg-white/10 rounded-lg md:rounded-2xl cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 relative group overflow-hidden"
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
                <svg className="w-8 h-8 md:w-12 md:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        likedLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : likedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {likedPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => openPostModal(index)}
                className="aspect-square bg-white/10 rounded-lg md:rounded-2xl cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 relative group overflow-hidden"
              >
                <img
                  src={post.imageUrl}
                  alt="Liked Post"
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
                {/* Heart overlay for liked posts */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg md:rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No Liked Posts</h3>
            <p className="text-white/60">Posts you like will appear here.</p>
            <button
              onClick={refreshLikedPosts}
              className="mt-4 bg-white hover:bg-white/80 text-black px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Refresh Liked Posts
            </button>
          </div>
        )
      ) : activeTab === 'saved' ? (
        savedLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : savedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {savedPosts.map((savedPost, index) => (
              <div
                key={savedPost.id}
                onClick={() => {
                  // Navigate to the saved post
                  navigate(`/post/${savedPost.postId}/${savedPost.postAuthor}`);
                }}
                className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg md:rounded-2xl cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 relative group overflow-hidden"
              >
                <img
                  src={savedPost.postImageUrl}
                  alt="Saved Post"
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
                {/* Bookmark overlay for saved posts */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg md:rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-500 fill-current" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-white">No Saved Posts</h3>
            <p className="text-white/60">Posts you save will appear here.</p>
          </div>
        )
      ) : null}

      {/* Empty state for own profile */}
      {isOwnProfile && posts.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">Share Your First Post</h3>
          <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            Start your Web3 social journey by sharing your first post with the community.
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-white hover:bg-white/80 text-black px-8 py-3 rounded-xl font-medium transition-colors"
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

      {/* Tip Modal */}
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        recipientAddress={profileAddress}
        recipientName={getDisplayName(userProfile, profileAddress)}
      />

      {/* Tip Notifications Modal */}
      <TipNotifications
        isOpen={isTipNotificationsOpen}
        onClose={() => {
          setIsTipNotificationsOpen(false);
          // Refresh tip stats when closing notifications
          loadTipStats();
        }}
      />

      {/* User List Modals */}
      <UserListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="Followers"
        users={followersList}
        loading={listLoading}
      />
      <UserListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="Following"
        users={followingList}
        loading={listLoading}
      />
    </div>
  );
};

export default Profile;