import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { getIPFSUrl } from '../config/pinata';
import { CONTRACT_ADDRESSES, POST_CONTRACT_ABI, SOCIAL_CONTRACT_ABI } from '../config/contracts';

export const usePosts = (authorAddress = null) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { provider, signer } = useWeb3();

  const fetchPosts = async () => {
    // We need at least a provider to read from the blockchain
    if (!provider) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create contract instances for reading (using provider for read-only operations)
      const postContract = new ethers.Contract(
        CONTRACT_ADDRESSES.POST_CONTRACT,
        POST_CONTRACT_ABI,
        provider
      );

      const socialContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SOCIAL_CONTRACT,
        SOCIAL_CONTRACT_ABI,
        provider
      );

      let rawPosts;
      if (authorAddress) {
        rawPosts = await postContract.getPostsByAuthor(authorAddress);
      } else {
        rawPosts = await postContract.getAllPosts();
      }

      // Process posts and get additional data
      const processedPosts = await Promise.all(
        rawPosts.map(async (post, index) => {
          try {
            const [likesCount, tipsAmount] = await Promise.all([
              socialContract.getLikesCount(post.id || index),
              socialContract.getTipsAmount(post.id || index)
            ]);

            return {
              id: post.id ? Number(post.id) : index,
              author: post.author,
              ipfsHash: post.ipfsHash,
              imageUrl: getIPFSUrl(post.ipfsHash),
              timestamp: post.timestamp ? new Date(Number(post.timestamp) * 1000) : new Date(),
              likes: Number(likesCount),
              tips: parseFloat(ethers.formatEther(tipsAmount)),
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
  }, [provider, authorAddress]);

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