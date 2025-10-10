import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { 
  CONTRACT_ADDRESSES, 
  POST_CONTRACT_ABI, 
  SOCIAL_CONTRACT_ABI 
} from '../config/contracts';

export const useContracts = () => {
  const { signer, provider } = useWeb3();
  const [postContract, setPostContract] = useState(null);
  const [socialContract, setSocialContract] = useState(null);

  useEffect(() => {
    if (signer && provider) {
      try {
        const postContractInstance = new ethers.Contract(
          CONTRACT_ADDRESSES.POST_CONTRACT,
          POST_CONTRACT_ABI,
          signer
        );

        const socialContractInstance = new ethers.Contract(
          CONTRACT_ADDRESSES.SOCIAL_CONTRACT,
          SOCIAL_CONTRACT_ABI,
          signer
        );

        setPostContract(postContractInstance);
        setSocialContract(socialContractInstance);
      } catch (error) {
        console.error('Error initializing contracts:', error);
      }
    }
  }, [signer, provider]);

  // Post contract functions
  const createPost = async (ipfsHash) => {
    if (!postContract) throw new Error('Post contract not initialized');
    
    try {
      const tx = await postContract.createPost(ipfsHash);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const getAllPosts = async () => {
    if (!postContract) throw new Error('Post contract not initialized');
    
    try {
      const posts = await postContract.getAllPosts();
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  const getPostsByAuthor = async (authorAddress) => {
    if (!postContract) throw new Error('Post contract not initialized');
    
    try {
      const posts = await postContract.getPostsByAuthor(authorAddress);
      return posts;
    } catch (error) {
      console.error('Error fetching posts by author:', error);
      throw error;
    }
  };

  // Social contract functions
  const followUser = async (userAddress) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const tx = await socialContract.followUser(userAddress);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (userAddress) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const tx = await socialContract.unfollowUser(userAddress);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const tx = await socialContract.likePost(postId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const unlikePost = async (postId) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const tx = await socialContract.unlikePost(postId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  };

  const tipPost = async (postId, recipientAddress, amount) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const tx = await socialContract.tipPost(postId, recipientAddress, {
        value: ethers.parseEther(amount.toString())
      });
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error tipping post:', error);
      throw error;
    }
  };

  const isFollowing = async (followerAddress, followedAddress) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      return await socialContract.isFollowing(followerAddress, followedAddress);
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  };

  const hasUserLiked = async (postId, userAddress) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      return await socialContract.hasUserLiked(postId, userAddress);
    } catch (error) {
      console.error('Error checking like status:', error);
      throw error;
    }
  };

  const getFollowerCount = async (userAddress) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const count = await socialContract.getFollowerCount(userAddress);
      return Number(count);
    } catch (error) {
      console.error('Error getting follower count:', error);
      throw error;
    }
  };

  const getLikesCount = async (postId) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const count = await socialContract.getLikesCount(postId);
      return Number(count);
    } catch (error) {
      console.error('Error getting likes count:', error);
      throw error;
    }
  };

  const getTipsAmount = async (postId) => {
    if (!socialContract) throw new Error('Social contract not initialized');
    
    try {
      const amount = await socialContract.getTipsAmount(postId);
      return ethers.formatEther(amount);
    } catch (error) {
      console.error('Error getting tips amount:', error);
      throw error;
    }
  };

  return {
    postContract,
    socialContract,
    // Post functions
    createPost,
    getAllPosts,
    getPostsByAuthor,
    // Social functions
    followUser,
    unfollowUser,
    likePost,
    unlikePost,
    tipPost,
    isFollowing,
    hasUserLiked,
    getFollowerCount,
    getLikesCount,
    getTipsAmount
  };
};