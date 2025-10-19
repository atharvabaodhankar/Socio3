import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  getLikedPosts, 
  isPostLiked, 
  likePost, 
  unlikePost 
} from '../services/likedPostsService';

export const useLikedPosts = (userAddress) => {
  const { account, isConnected } = useWeb3();
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userAddress && isConnected) {
      loadLikedPosts();
    }
  }, [userAddress, isConnected]);

  const loadLikedPosts = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading liked posts for ${userAddress}`);
      const likedPostsData = await getLikedPosts(userAddress);
      console.log(`Found ${likedPostsData.length} liked posts`);
      
      // Convert Firebase data to post format
      const formattedPosts = likedPostsData.map(likedPost => ({
        id: likedPost.postId,
        author: likedPost.postAuthor,
        caption: likedPost.postCaption,
        imageUrl: likedPost.postImageUrl,
        timestamp: likedPost.likedAt?.toDate() || new Date(),
        likes: 0, // We'll load this separately if needed
        tips: 0,
        commentCount: 0
      }));
      
      setLikedPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading liked posts:', error);
      setError('Failed to load liked posts');
    } finally {
      setLoading(false);
    }
  };

  const refreshLikedPosts = () => {
    if (userAddress && isConnected) {
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

// Hook for individual post like status and toggle
export const usePostLike = (postId, post) => {
  const { account, isConnected } = useWeb3();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId && account && isConnected) {
      checkLikeStatus();
    }
  }, [postId, account, isConnected]);

  const checkLikeStatus = async () => {
    if (!postId || !account) return;
    
    try {
      const liked = await isPostLiked(account, postId);
      setIsLiked(liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const toggleLike = async () => {
    if (!account || !post || loading) return;
    
    setLoading(true);
    
    try {
      if (isLiked) {
        await unlikePost(account, postId);
        setIsLiked(false);
      } else {
        await likePost(account, postId, post.author, {
          caption: post.caption,
          imageUrl: post.imageUrl
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    loading,
    toggleLike,
    checkLikeStatus
  };
};