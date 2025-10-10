import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  likePost as firebaseLikePost,
  unlikePost as firebaseUnlikePost,
  hasUserLiked,
  addComment,
  subscribeToComments,
  subscribeToPostStats
} from '../services/firebaseService';

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
      const liked = await hasUserLiked(postId, account);
      setIsLiked(liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const toggleLike = async () => {
    if (!isConnected || !account || !postId || loading) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        await firebaseUnlikePost(postId, account);
        setIsLiked(false);
      } else {
        await firebaseLikePost(postId, account);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
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