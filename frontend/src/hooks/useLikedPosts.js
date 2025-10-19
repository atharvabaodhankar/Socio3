import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from './useContracts';
import { usePosts } from './usePosts';

export const useLikedPosts = (userAddress) => {
  const { account, isConnected } = useWeb3();
  const { socialContract } = useContracts();
  const { posts: allPosts } = usePosts(); // Get all posts to filter liked ones
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userAddress && socialContract && allPosts.length > 0) {
      loadLikedPosts();
    }
  }, [userAddress, socialContract, allPosts]);

  const loadLikedPosts = async () => {
    if (!userAddress || !socialContract || allPosts.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const likedPostsData = [];
      
      // Check each post to see if the user has liked it
      for (const post of allPosts) {
        try {
          const hasLiked = await socialContract.hasUserLiked(post.id, userAddress);
          if (hasLiked) {
            likedPostsData.push(post);
          }
        } catch (error) {
          console.error(`Error checking like status for post ${post.id}:`, error);
        }
      }
      
      // Sort by most recently liked (we'll use post ID as a proxy for now)
      likedPostsData.sort((a, b) => b.id - a.id);
      
      setLikedPosts(likedPostsData);
    } catch (error) {
      console.error('Error loading liked posts:', error);
      setError('Failed to load liked posts');
    } finally {
      setLoading(false);
    }
  };

  const refreshLikedPosts = () => {
    if (userAddress && socialContract && allPosts.length > 0) {
      loadLikedPosts();
    }
  };

  return {
    likedPosts,
    loading,
    error,
    refreshLikedPosts
  };
};