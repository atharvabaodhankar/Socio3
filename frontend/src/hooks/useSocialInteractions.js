import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  addComment,
  subscribeToComments,
  subscribeToPostStats
} from '../services/firebaseService';
import {
  isPostLiked,
  likePost,
  unlikePost,
  getPostLikeCount
} from '../services/likedPostsService';

export const useSocialInteractions = (postId) => {
  const { account, isConnected } = useWeb3();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if user has liked the post
  useEffect(() => {
    if (postId && account && isConnected) {
      checkLikeStatus();
    }
  }, [postId, account, isConnected]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!postId) return;

    // Subscribe to comments
    const unsubscribeComments = subscribeToComments(postId, (newComments) => {
      setComments(newComments);
    });

    // Subscribe to post stats
    const unsubscribeStats = subscribeToPostStats(postId, (stats) => {
      setLikes(stats.likes || 0);
      setCommentsCount(stats.comments || 0);
    });

    return () => {
      unsubscribeComments();
      unsubscribeStats();
    };
  }, [postId]);

  const checkLikeStatus = async () => {
    if (!postId || !account) return;
    
    try {
      const liked = await isPostLiked(account, postId);
      setIsLiked(liked);
      
      // Also get the current like count
      const likeCount = await getPostLikeCount(postId);
      setLikes(likeCount);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const toggleLike = async (post) => {
    if (!isConnected || !account || !postId || loading) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        await unlikePost(account, postId);
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
      } else {
        await likePost(account, postId, post?.author || 'unknown', {
          caption: post?.caption || '',
          imageUrl: post?.imageUrl || ''
        });
        setIsLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      
      // Show user-friendly error message
      if (error.message.includes('Firebase not configured')) {
        alert('Firebase is not set up yet. Likes will be available once Firebase is configured.');
      } else if (error.message.includes('permission-denied')) {
        alert('Please set up Firebase Firestore in test mode. Check the setup guide.');
      } else {
        alert('Failed to update like. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const postComment = async (text) => {
    if (!isConnected || !account || !postId || !text.trim()) return;
    
    try {
      const commentId = await addComment(postId, account, text);
      return commentId;
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  };

  return {
    isLiked,
    likes,
    comments,
    commentsCount,
    loading,
    toggleLike,
    postComment
  };
};