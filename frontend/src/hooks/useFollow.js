import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from './useContracts';

export const useFollow = (userAddress) => {
  const { account, isConnected } = useWeb3();
  const { followUser, unfollowUser, isFollowing, getFollowerCount, socialContract } = useContracts();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check follow status when component mounts or dependencies change
  useEffect(() => {
    // Add a small delay to ensure contracts are initialized
    const timer = setTimeout(() => {
      if (userAddress && account && isConnected && userAddress !== account && socialContract) {
        checkFollowStatus();
        loadFollowerCount();
        setRetryCount(0); // Reset retry count on successful connection
      } else {
        setIsFollowingUser(false);
        if (userAddress && socialContract) {
          loadFollowerCount();
        } else if (userAddress && !socialContract && retryCount < 3) {
          // Retry after a longer delay if contracts aren't ready
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      }
    }, socialContract ? 100 : 1000); // Shorter delay if contracts are ready

    return () => clearTimeout(timer);
  }, [userAddress, account, isConnected, socialContract, retryCount]);

  const checkFollowStatus = async () => {
    if (!userAddress || !account || userAddress === account || !isFollowing) return;
    
    const following = await isFollowing(account, userAddress);
    setIsFollowingUser(following);
  };

  const loadFollowerCount = async () => {
    if (!userAddress || !getFollowerCount) return;
    
    const count = await getFollowerCount(userAddress);
    setFollowerCount(count);
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