import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getFollowingFeed, getAllPostsFeed, hasFollowing } from '../services/feedService';

export const useFeed = (posts = []) => {
  const { account, isConnected, provider } = useWeb3();
  const [followingFeed, setFollowingFeed] = useState([]);
  const [allPostsFeed, setAllPostsFeed] = useState([]);
  const [hasFollowingUsers, setHasFollowingUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (posts.length > 0) {
      loadFeeds();
    } else {
      setLoading(false);
    }
  }, [account, posts, isConnected, provider]);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all posts feed (always available)
      const allPosts = getAllPostsFeed(posts, 20);
      setAllPostsFeed(allPosts);

      // Get following feed (only if user is connected)
      if (account && isConnected && provider) {
        const [followingPosts, userHasFollowing] = await Promise.all([
          getFollowingFeed(account, posts, provider, 20),
          hasFollowing(account, posts, provider)
        ]);
        
        setFollowingFeed(followingPosts);
        setHasFollowingUsers(userHasFollowing);
      } else {
        setFollowingFeed([]);
        setHasFollowingUsers(false);
      }

    } catch (err) {
      console.error('Error loading feeds:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshFeeds = () => {
    if (posts.length > 0) {
      loadFeeds();
    }
  };

  return {
    followingFeed,
    allPostsFeed,
    hasFollowingUsers,
    loading,
    error,
    refreshFeeds
  };
};