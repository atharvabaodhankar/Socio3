import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from './useContracts';

export const useFollow = (userAddress) => {
  const { account, isConnected } = useWeb3();
  const { followUser, unfollowUser, isFollowing, getFollowerCount } = useContracts();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check follow status when component mounts or dependencies change
  useEffect(() => {
    if (userAddress && account && isConnected && userAddress !== account) {
      checkFollowStatus();
      loadFollowerCount();
    } else {
      setIsFollowingUser(false);
      if (userAddress) {
        loadFollowerCount();
      }
    }
  }, [userAddress, account, isConnected]);

  const checkFollowStatus = async () => {
    if (!userAddress || !account || userAddress === account || !isFollowing) return;
    
    try {
      const following = await isFollowing(account, userAddress);
      setIsFollowingUser(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
      // Don't throw error, just log it - contracts might not be ready yet
    }
  };

  const loadFollowerCount = async () => {
    if (!userAddress || !getFollowerCount) return;
    
    try {
      const count = await getFollowerCount(userAddress);
      setFollowerCount(count);
    } catch (error) {
      console.error('Error loading follower count:', error);
      // Don't throw error, just log it - contracts might not be ready yet
      setFollowerCount(0);
    }
  };

  const toggleFollow = async () => {
    if (!isConnected || !account || !userAddress || userAddress === account || loading || !followUser || !unfollowUser) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFollowingUser) {
        await unfollowUser(userAddress);
        setIsFollowingUser(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(userAddress);
        setIsFollowingUser(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setError(error.message);
      
      // Revert optimistic update on error
      if (isFollowingUser) {
        setFollowerCount(prev => prev + 1);
      } else {
        setFollowerCount(prev => Math.max(0, prev - 1));
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const canFollow = isConnected && account && userAddress && userAddress !== account;

  return {
    isFollowingUser,
    followerCount,
    loading,
    error,
    toggleFollow,
    canFollow
  };
};