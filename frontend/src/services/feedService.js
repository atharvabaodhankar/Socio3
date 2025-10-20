import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, SOCIAL_CONTRACT_ABI } from '../config/contracts';

// Get posts from users that the current user follows (using blockchain data)
export const getFollowingFeed = async (userAddress, posts = [], provider = null, limitCount = 20) => {
  try {
    if (!userAddress || !posts || posts.length === 0 || !provider) {
      return [];
    }

    // Create social contract instance to check follow relationships
    const socialContract = new ethers.Contract(
      CONTRACT_ADDRESSES.SOCIAL_CONTRACT,
      SOCIAL_CONTRACT_ABI,
      provider
    );

    // Get unique authors from posts
    const uniqueAuthors = [...new Set(posts.map(post => post.author.toLowerCase()))];
    const followedAddresses = new Set();

    // Check each author to see if the user follows them
    for (const authorAddress of uniqueAuthors) {
      try {
        const isFollowing = await socialContract.isFollowing(userAddress, authorAddress);
        if (isFollowing) {
          followedAddresses.add(authorAddress.toLowerCase());
        }
      } catch (error) {
        console.error(`Error checking follow status for ${authorAddress}:`, error);
      }
    }

    if (followedAddresses.size === 0) {
      return [];
    }

    // Filter posts to only include posts from followed users
    const followingPosts = posts.filter(post => 
      followedAddresses.has(post.author.toLowerCase())
    );

    // Sort by timestamp (newest first) and limit
    const sortedPosts = followingPosts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limitCount);
    return sortedPosts;

  } catch (error) {
    console.error('Error getting following feed:', error);
    return [];
  }
};

// Get all posts for the general feed
export const getAllPostsFeed = (posts = [], limitCount = 20) => {
  try {
    if (!posts || posts.length === 0) {
      return [];
    }

    // Sort by timestamp (newest first) and limit
    return posts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limitCount);

  } catch (error) {
    console.error('Error getting all posts feed:', error);
    return [];
  }
};

// Get user's following count
export const getFollowingCount = async (userAddress) => {
  try {
    if (!userAddress) return 0;

    const followersRef = collection(db, 'followers');
    const followingQuery = query(
      followersRef,
      where('followerAddress', '==', userAddress.toLowerCase())
    );
    
    const followingSnapshot = await getDocs(followingQuery);
    return followingSnapshot.size;

  } catch (error) {
    console.error('Error getting following count:', error);
    return 0;
  }
};

// Check if user is following anyone (using blockchain data)
export const hasFollowing = async (userAddress, posts = [], provider = null) => {
  try {
    if (!provider || !posts || posts.length === 0) {
      return false;
    }

    // Create social contract instance
    const socialContract = new ethers.Contract(
      CONTRACT_ADDRESSES.SOCIAL_CONTRACT,
      SOCIAL_CONTRACT_ABI,
      provider
    );

    // Get unique authors from posts
    const uniqueAuthors = [...new Set(posts.map(post => post.author.toLowerCase()))];

    // Check if user follows any of the authors
    for (const authorAddress of uniqueAuthors) {
      try {
        const isFollowing = await socialContract.isFollowing(userAddress, authorAddress);
        if (isFollowing) {
          return true;
        }
      } catch (error) {
        console.error(`Error checking follow status for ${authorAddress}:`, error);
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking if user has following:', error);
    return false;
  }
};