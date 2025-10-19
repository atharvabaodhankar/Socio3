import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { 
  savePost, 
  unsavePost, 
  isPostSaved, 
  getSavedPosts 
} from '../services/savedPostsService';

export const useSavedPosts = (postId = null) => {
  const { account, isConnected } = useWeb3();
  const [isSaved, setIsSaved] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if specific post is saved (when postId is provided)
  useEffect(() => {
    if (postId && account && isConnected) {
      checkIfSaved();
    }
  }, [postId, account, isConnected]);

  const checkIfSaved = async () => {
    if (!postId || !account) return;
    
    try {
      const saved = await isPostSaved(account, postId);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking if post is saved:', error);
    }
  };

  const toggleSave = async (post) => {
    if (!account || !post) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isSaved) {
        await unsavePost(account, post.id);
        setIsSaved(false);
      } else {
        await savePost(account, post.id, post.author, {
          caption: post.caption,
          imageUrl: post.imageUrl
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setError('Failed to save/unsave post');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPosts = async () => {
    if (!account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const posts = await getSavedPosts(account);
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error loading saved posts:', error);
      setError('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSaved,
    savedPosts,
    loading,
    error,
    toggleSave,
    loadSavedPosts,
    checkIfSaved
  };
};