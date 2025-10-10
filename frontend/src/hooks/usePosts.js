import { useState, useEffect } from 'react';
import { useContracts } from './useContracts';
import { useWeb3 } from '../context/Web3Context';
import { getIPFSUrl } from '../config/pinata';

export const usePosts = (authorAddress = null) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAllPosts, getPostsByAuthor, getLikesCount, getTipsAmount } = useContracts();
  const { isConnected } = useWeb3();

  const fetchPosts = async () => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let rawPosts;
      if (authorAddress) {
        rawPosts = await getPostsByAuthor(authorAddress);
      } else {
        rawPosts = await getAllPosts();
      }

      // Process posts and get additional data
      const processedPosts = await Promise.all(
        rawPosts.map(async (post, index) => {
          try {
            const [likesCount, tipsAmount] = await Promise.all([
              getLikesCount(post.id || index),
              getTipsAmount(post.id || index)
            ]);

            return {
              id: post.id ? Number(post.id) : index,
              author: post.author,
              ipfsHash: post.ipfsHash,
              imageUrl: getIPFSUrl(post.ipfsHash),
              timestamp: post.timestamp ? new Date(Number(post.timestamp) * 1000) : new Date(),
              likes: Number(likesCount),
              tips: parseFloat(tipsAmount),
              commentCount: 0 // TODO: Implement comments
            };
          } catch (err) {
            console.error('Error processing post:', err);
            return {
              id: index,
              author: post.author,
              ipfsHash: post.ipfsHash,
              imageUrl: getIPFSUrl(post.ipfsHash),
              timestamp: new Date(),
              likes: 0,
              tips: 0,
              commentCount: 0
            };
          }
        })
      );

      setPosts(processedPosts.reverse()); // Show newest first
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [isConnected, authorAddress]);

  const refetch = () => {
    fetchPosts();
  };

  return {
    posts,
    loading,
    error,
    refetch
  };
};