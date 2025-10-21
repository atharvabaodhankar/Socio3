import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { getIPFSUrl, fetchPostMetadata } from '../config/pinata';
import { CONTRACT_ADDRESSES, POST_CONTRACT_ABI, SOCIAL_CONTRACT_ABI } from '../config/contracts';
import { getMultiplePostStats } from '../services/firebaseService';
import { getMultiplePostSettings } from '../services/postSettingsService';

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
        console.log('Fetching posts for author:', authorAddress);
        rawPosts = await postContract.getPostsByAuthor(authorAddress);
      } else {
        console.log('Fetching all posts');
        rawPosts = await postContract.getAllPosts();
      }
      console.log('Raw posts fetched:', rawPosts.length);

      // Process posts and get additional data
      const processedPosts = await Promise.all(
        rawPosts.map(async (post, index) => {
          try {
            // Post structure: (address author, string ipfsHash, uint256 timestamp, uint256 id)
            const postId = Number(post[3]);
            const author = post[0];
            const ipfsHash = post[1];
            const timestamp = Number(post[2]);

            // Fetch metadata from IPFS to get caption and image URL
            let caption = '';
            let imageUrl = getIPFSUrl(ipfsHash); // Fallback to direct hash
            
            try {
              const metadata = await fetchPostMetadata(ipfsHash);
              if (metadata) {
                if (metadata.isDirectImage) {
                  // Old format: direct image file
                  caption = '';
                  imageUrl = metadata.imageUrl;
                } else {
                  // New format: metadata JSON
                  caption = metadata.caption || metadata.description || '';
                  imageUrl = metadata.imageUrl || getIPFSUrl(metadata.image?.replace('ipfs://', '') || ipfsHash);
                }
              }
            } catch (metadataError) {
              console.warn('Could not fetch metadata for post', postId, metadataError);
              // Use fallback values
            }

            // Get tips from blockchain (financial data stays on-chain)
            const tipsAmount = await socialContract.getTipsAmount(postId);

            return {
              id: postId,
              author: author,
              ipfsHash: ipfsHash,
              imageUrl: imageUrl,
              timestamp: new Date(timestamp * 1000),
              likes: 0, // Will be loaded from Firebase
              tips: parseFloat(ethers.formatEther(tipsAmount)),
              commentCount: 0, // Will be loaded from Firebase
              caption: caption
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

      // Get social data and settings from Firebase for all posts
      if (processedPosts.length > 0) {
        try {
          const postIds = processedPosts.map(post => post.id);
          const socialStats = await getMultiplePostStats(postIds);
          const postSettings = await getMultiplePostSettings(processedPosts);
          
          // Merge Firebase social data and settings with blockchain data
          processedPosts.forEach(post => {
            const stats = socialStats[post.id];
            const settings = postSettings[post.id];
            
            if (stats) {
              post.likes = stats.likes || 0;
              post.commentCount = stats.comments || 0;
            }
            
            if (settings) {
              post.allowComments = settings.allowComments;
              post.showLikeCount = settings.showLikeCount;
            } else {
              // Default settings
              post.allowComments = true;
              post.showLikeCount = true;
            }
          });
        } catch (error) {
          console.error('Error loading social stats and settings from Firebase:', error);
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
    console.log('usePosts: authorAddress changed to:', authorAddress);
    // Clear posts immediately when authorAddress changes to prevent showing wrong posts
    setPosts([]);
    setError(null);
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