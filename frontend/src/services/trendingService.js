import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { getUserProfile } from './profileService';

// Get trending creators based on follower count and recent activity
export const getTrendingCreators = async (provider, posts = [], limitCount = 10) => {
  try {
    if (!posts || posts.length === 0) {
      return [];
    }
    
    // Count posts per author and get unique authors from blockchain posts
    const authorStats = {};
    const uniqueAuthors = new Set();
    
    posts.forEach((post) => {
      const author = post.author?.toLowerCase();
      if (author) {
        uniqueAuthors.add(author);
        authorStats[author] = (authorStats[author] || 0) + 1;
      }
    });

    // Get follower counts and profile data for each author
    const creatorsData = [];
    
    for (const authorAddress of uniqueAuthors) {
      try {
        // Get follower count from Firebase
        const followersRef = collection(db, 'followers');
        const followersQuery = query(
          followersRef, 
          where('followedAddress', '==', authorAddress)
        );
        const followersSnapshot = await getDocs(followersQuery);
        const followerCount = followersSnapshot.size;
        
        // Get total likes for this creator's posts
        let totalLikes = 0;
        const creatorPosts = posts.filter(p => p.author?.toLowerCase() === authorAddress);
        for (const post of creatorPosts) {
          const likesRef = collection(db, 'likedPosts');
          const likesQuery = query(likesRef, where('postId', '==', post.id));
          const likesSnapshot = await getDocs(likesQuery);
          totalLikes += likesSnapshot.size;
        }
        
        // Get profile data
        let profile = null;
        if (provider) {
          try {
            profile = await getUserProfile(provider, authorAddress);
          } catch (error) {
            // Use default profile if not found
            profile = {
              userAddress: authorAddress,
              username: '',
              displayName: '',
              bio: '',
              exists: false
            };
          }
        }
        
        creatorsData.push({
          address: authorAddress,
          followerCount: followerCount,
          postCount: authorStats[authorAddress] || 0,
          totalLikes: totalLikes,
          profile: profile,
          // Calculate trending score based on followers, posts, and likes
          trendingScore: followerCount * 10 + (authorStats[authorAddress] || 0) * 5 + totalLikes * 2
        });
      } catch (error) {
        console.error(`Error getting data for creator ${authorAddress}:`, error);
      }
    }
    
    // Sort by trending score and return top creators
    return creatorsData
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limitCount);
      
  } catch (error) {
    console.error('Error getting trending creators:', error);
    return [];
  }
};

// Get top posts based on likes, tips, and engagement
export const getTopPosts = async (posts = [], limitCount = 9) => {
  try {
    if (!posts || posts.length === 0) {
      return [];
    }
    
    const postsData = [];
    
    for (const post of posts) {
      // Get likes count from Firebase
      const likesRef = collection(db, 'likedPosts');
      const likesQuery = query(likesRef, where('postId', '==', post.id));
      const likesSnapshot = await getDocs(likesQuery);
      const likesCount = likesSnapshot.size;
      
      // Get comments count from Firebase (if available)
      const commentsCount = post.commentCount || 0;
      
      // Calculate engagement score
      const engagementScore = likesCount * 10 + commentsCount * 5 + (post.tips || 0) * 100;
      
      postsData.push({
        ...post,
        likesCount,
        commentsCount,
        engagementScore
      });
    }
    
    // Sort by engagement score and return top posts
    return postsData
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limitCount);
      
  } catch (error) {
    console.error('Error getting top posts:', error);
    return [];
  }
};

// Get creator stats for a specific address
export const getCreatorStats = async (creatorAddress) => {
  try {
    // Get follower count
    const followersRef = collection(db, 'followers');
    const followersQuery = query(
      followersRef, 
      where('followedAddress', '==', creatorAddress.toLowerCase())
    );
    const followersSnapshot = await getDocs(followersQuery);
    
    // Get post count
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
      postsRef, 
      where('author', '==', creatorAddress.toLowerCase())
    );
    const postsSnapshot = await getDocs(postsQuery);
    
    // Get total likes received
    let totalLikes = 0;
    for (const postDoc of postsSnapshot.docs) {
      const post = postDoc.data();
      const likesRef = collection(db, 'likedPosts');
      const likesQuery = query(likesRef, where('postId', '==', post.id));
      const likesSnapshot = await getDocs(likesQuery);
      totalLikes += likesSnapshot.size;
    }
    
    return {
      followerCount: followersSnapshot.size,
      postCount: postsSnapshot.size,
      totalLikes,
      engagementRate: postsSnapshot.size > 0 ? (totalLikes / postsSnapshot.size).toFixed(1) : 0
    };
    
  } catch (error) {
    console.error('Error getting creator stats:', error);
    return {
      followerCount: 0,
      postCount: 0,
      totalLikes: 0,
      engagementRate: 0
    };
  }
};