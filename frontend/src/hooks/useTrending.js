import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getTrendingCreators, getTopPosts } from '../services/trendingService';

export const useTrendingCreators = (posts = [], limit = 5) => {
  const { provider } = useWeb3();
  const [trendingCreators, setTrendingCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (posts.length > 0) {
      loadTrendingCreators();
    } else {
      setLoading(false);
    }
  }, [provider, posts, limit]);

  const loadTrendingCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const creators = await getTrendingCreators(provider, posts, limit);
      setTrendingCreators(creators);
    } catch (err) {
      console.error('Error loading trending creators:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshTrendingCreators = () => {
    if (posts.length > 0) {
      loadTrendingCreators();
    }
  };

  return {
    trendingCreators,
    loading,
    error,
    refreshTrendingCreators
  };
};

export const useTopPosts = (posts = [], limit = 9) => {
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (posts.length > 0) {
      loadTopPosts();
    } else {
      setLoading(false);
    }
  }, [posts, limit]);

  const loadTopPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const topPostsData = await getTopPosts(posts, limit);
      setTopPosts(topPostsData);
    } catch (err) {
      console.error('Error loading top posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshTopPosts = () => {
    if (posts.length > 0) {
      loadTopPosts();
    }
  };

  return {
    topPosts,
    loading,
    error,
    refreshTopPosts
  };
};