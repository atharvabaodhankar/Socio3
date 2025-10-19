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

const SAVED_POSTS_COLLECTION = 'savedPosts';

// Save a post for a user
export const savePost = async (userAddress, postId, postAuthor, postData = {}) => {
  try {
    const savedPostsRef = collection(db, SAVED_POSTS_COLLECTION);
    
    const savedPostDocument = {
      userAddress: userAddress.toLowerCase(),
      postId: postId,
      postAuthor: postAuthor.toLowerCase(),
      postCaption: postData.caption || '',
      postImageUrl: postData.imageUrl || '',
      savedAt: serverTimestamp()
    };

    const docRef = await addDoc(savedPostsRef, savedPostDocument);
    return docRef.id;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

// Remove a saved post
export const unsavePost = async (userAddress, postId) => {
  try {
    const savedPostsRef = collection(db, SAVED_POSTS_COLLECTION);
    const q = query(
      savedPostsRef,
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
    console.error('Error unsaving post:', error);
    throw error;
  }
};

// Check if a post is saved by a user
export const isPostSaved = async (userAddress, postId) => {
  try {
    const savedPostsRef = collection(db, SAVED_POSTS_COLLECTION);
    const q = query(
      savedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase()),
      where('postId', '==', postId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if post is saved:', error);
    return false;
  }
};

// Get all saved posts for a user
export const getSavedPosts = async (userAddress, limitCount = 50) => {
  try {
    const savedPostsRef = collection(db, SAVED_POSTS_COLLECTION);
    const q = query(
      savedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase()),
      orderBy('savedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const savedPosts = [];
    
    querySnapshot.forEach((doc) => {
      savedPosts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return savedPosts;
  } catch (error) {
    console.error('Error getting saved posts:', error);
    throw error;
  }
};

// Get saved posts count for a user
export const getSavedPostsCount = async (userAddress) => {
  try {
    const savedPostsRef = collection(db, SAVED_POSTS_COLLECTION);
    const q = query(
      savedPostsRef,
      where('userAddress', '==', userAddress.toLowerCase())
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting saved posts count:', error);
    return 0;
  }
};