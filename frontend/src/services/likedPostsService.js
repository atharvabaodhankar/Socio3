import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

const LIKED_POSTS_COLLECTION = 'likedPosts';

// Like a post for a user
export const likePost = async (userAddress, postId, postAuthor, postData = {}) => {
  try {
    const likedPostsRef = collection(db, LIKED_POSTS_COLLECTION);
    
    const likedPostDocument = {
      userAddress: userAddress.toLowerCase(),
      postId: postId,
      postAuthor: postAuthor.toLowerCase(),
      postCaption: postData.caption || '',
      postImageUrl: postData.imageUrl || '',
      likedAt: serverTimestamp()
    };

    const docRef = await addDoc(likedPostsRef, likedPostDocument);
    return docRef.id;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (userAddress, postId) => {
  try {
    const likedPostsRef = collection(db, LIKED_POSTS_COLLECTION);
    const q = query(
      likedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase()),
      where('postId', '==', postId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Check if a post is liked by a user
export const isPostLiked = async (userAddress, postId) => {
  try {
    const likedPostsRef = collection(db, LIKED_POSTS_COLLECTION);
    const q = query(
      likedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase()),
      where('postId', '==', postId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if post is liked:', error);
    return false;
  }
};

// Get all liked posts for a user
export const getLikedPosts = async (userAddress, limitCount = 50) => {
  try {
    const likedPostsRef = collection(db, LIKED_POSTS_COLLECTION);
    const q = query(
      likedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase()),
      orderBy('likedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const likedPosts = [];
    
    querySnapshot.forEach((doc) => {
      likedPosts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return likedPosts;
  } catch (error) {
    console.error('Error getting liked posts:', error);
    throw error;
  }
};

// Get liked posts count for a user
export const getLikedPostsCount = async (userAddress) => {
  try {
    const likedPostsRef = collection(db, LIKED_POSTS_COLLECTION);
    const q = query(
      likedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase())
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting liked posts count:', error);
    return 0;
  }
};

// Get like count for a specific post
export const getPostLikeCount = async (postId) => {
  try {
    const likedPostsRef = collection(db, LIKED_POSTS_COLLECTION);
    const q = query(
      likedPostsRef,
      where('postId', '==', postId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting post like count:', error);
    return 0;
  }
};