import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { getIPFSUrl } from '../config/pinata';
import { CONTRACT_ADDRESSES, POST_CONTRACT_ABI, SOCIAL_CONTRACT_ABI } from '../config/contracts';
import { getMultiplePostStats } from '../services/firebaseService';

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
            // Post structure: (address author, string ipfsHash, uint256 timestamp, uint256 id)
            const postId = Number(post[3]);
            const author = post[0];
            const ipfsHash = post[1];
            const timestamp = Number(post[2]);



            // Get tips from blockchain (financial data stays on-chain)
            const tipsAmount = await socialContract.getTipsAmount(postId);

            return {
              id: postId,
              author: author,
              ipfsHash: ipfsHash,
              imageUrl: getIPFSUrl(ipfsHash),
              timestamp: new Date(timestamp * 1000),
              likes: 0, // Will be loaded from Firebase
              tips: parseFloat(ethers.formatEther(tipsAmount)),
              commentCount: 0, // Will be loaded from Firebase
              caption: '' // TODO: Add caption support to smart contract
            };
          } catch (err) {
            console.error('Error processing post:', err);
            // Fallback with array access
            return {
              id: index,
              author: post[0] || 'Unknown',
              ipfsHash: post[1] || '',
              imageUrl: getIPFSUrl(post[1] || ''),
              timestamp: new Date(),
              likes: 0,
              tips: 0,
              commentCount: 0,
              caption: ''
            };
          }
        })
      );

      // Get social data from Firebase for all posts
      if (processedPosts.length > 0) {
        try {
          const postIds = processedPosts.map(post => post.id);
          const socialStats = await getMultiplePostStats(postIds);
          
          // Merge Firebase social data with blockchain data
          processedPosts.forEach(post => {
            const stats = socialStats[post.id];
            if (stats) {
              post.likes = stats.likes || 0;
              post.commentCount = stats.comments || 0;
            }
          });
        } catch (error) {
          console.error('Error loading social stats from Firebase:', error);
        }
      }

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
  }, [provider, authorAddress]); // This is correct - authorAddress changes when account changes

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