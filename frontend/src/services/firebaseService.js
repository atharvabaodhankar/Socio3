import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    return !!db && !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
  } catch (error) {
    console.warn('Firebase not configured:', error);
    return false;
  }
};

// Collections
const LIKES_COLLECTION = 'likes';
const COMMENTS_COLLECTION = 'comments';
const POST_STATS_COLLECTION = 'postStats';
const WELCOME_GIFTS_COLLECTION = 'welcomeGifts';

// Like functions
export const likePost = async (postId, userAddress) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Please set up Firestore database.');
    throw new Error('Firebase not configured');
  }

  try {
    const likeId = `${postId}_${userAddress.toLowerCase()}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    
    await setDoc(likeRef, {
      postId: postId.toString(),
      userAddress: userAddress.toLowerCase(),
      timestamp: serverTimestamp()
    });

    // Update post stats
    await updatePostStats(postId, { likes: increment(1) });
    
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Please set up Firebase Firestore in test mode. See FIREBASE_QUICK_SETUP.md');
    }
    throw error;
  }
};

export const unlikePost = async (postId, userAddress) => {
  try {
    const likeId = `${postId}_${userAddress.toLowerCase()}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    
    await deleteDoc(likeRef);

    // Update post stats
    await updatePostStats(postId, { likes: increment(-1) });
    
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const hasUserLiked = async (postId, userAddress) => {
  try {
    const likeId = `${postId}_${userAddress.toLowerCase()}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    const likeDoc = await getDoc(likeRef);
    
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const getLikesCount = async (postId) => {
  if (!isFirebaseConfigured()) {
    return 0;
  }

  try {
    const statsRef = doc(db, POST_STATS_COLLECTION, postId.toString());
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data().likes || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting likes count:', error);
    return 0;
  }
};

// Comment functions
export const addComment = async (postId, userAddress, text) => {
  try {
    const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      postId: postId.toString(),
      userAddress: userAddress.toLowerCase(),
      text: text.trim(),
      timestamp: serverTimestamp()
    });

    // Update post stats
    await updatePostStats(postId, { comments: increment(1) });
    
    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('postId', '==', postId.toString()),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

export const getCommentsCount = async (postId) => {
  if (!isFirebaseConfigured()) {
    return 0;
  }

  try {
    const statsRef = doc(db, POST_STATS_COLLECTION, postId.toString());
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data().comments || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting comments count:', error);
    return 0;
  }
};

// Real-time listeners
export const subscribeToComments = (postId, callback) => {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('postId', '==', postId.toString()),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(comments);
  });
};

export const subscribeToPostStats = (postId, callback) => {
  const statsRef = doc(db, POST_STATS_COLLECTION, postId.toString());
  
  return onSnapshot(statsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({ likes: 0, comments: 0 });
    }
  });
};

// Helper function to update post stats
const updatePostStats = async (postId, updates) => {
  try {
    const statsRef = doc(db, POST_STATS_COLLECTION, postId.toString());
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Initialize stats if they don't exist
      await setDoc(statsRef, {
        postId: postId.toString(),
        likes: 0,
        comments: 0,
        ...updates
      });
    } else {
      // Update existing stats
      const batch = writeBatch(db);
      batch.update(statsRef, updates);
      await batch.commit();
    }
  } catch (error) {
    console.error('Error updating post stats:', error);
  }
};

// Batch operations for better performance
export const getMultiplePostStats = async (postIds) => {
  try {
    const stats = {};
    
    // Get all stats in parallel
    const promises = postIds.map(async (postId) => {
      const [likes, comments] = await Promise.all([
        getLikesCount(postId),
        getCommentsCount(postId)
      ]);
      
      stats[postId] = { likes, comments };
    });
    
    await Promise.all(promises);
    return stats;
  } catch (error) {
    console.error('Error getting multiple post stats:', error);
    return {};
  }
};

// Welcome Gift Tracking Functions
export const hasUserBeenWelcomed = async (userAddress) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, falling back to localStorage');
    return localStorage.getItem(`welcomed_${userAddress.toLowerCase()}`) === 'true';
  }

  try {
    const welcomeRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
    const welcomeDoc = await getDoc(welcomeRef);
    
    return welcomeDoc.exists();
  } catch (error) {
    console.error('Error checking welcome status:', error);
    // Fallback to localStorage if Firebase fails
    return localStorage.getItem(`welcomed_${userAddress.toLowerCase()}`) === 'true';
  }
};

export const markUserAsWelcomed = async (userAddress, giftResult = null) => {
  try {
    const welcomeData = {
      userAddress: userAddress.toLowerCase(),
      welcomedAt: serverTimestamp(),
      giftSent: !!giftResult?.success,
      transactionHash: giftResult?.transactionHash || null,
      amount: giftResult?.amount || null,
      explorerUrl: giftResult?.explorerUrl || null
    };

    if (isFirebaseConfigured()) {
      const welcomeRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
      await setDoc(welcomeRef, welcomeData);
      console.log('[Firebase] User marked as welcomed:', userAddress);
    }
    
    // Also set localStorage as backup
    localStorage.setItem(`welcomed_${userAddress.toLowerCase()}`, 'true');
    
    return true;
  } catch (error) {
    console.error('Error marking user as welcomed:', error);
    // Fallback to localStorage if Firebase fails
    localStorage.setItem(`welcomed_${userAddress.toLowerCase()}`, 'true');
    return false;
  }
};

export const getWelcomeGiftHistory = async (userAddress) => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const welcomeRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
    const welcomeDoc = await getDoc(welcomeRef);
    
    if (welcomeDoc.exists()) {
      return welcomeDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting welcome gift history:', error);
    return null;
  }
};

// Admin function to get all welcome gift statistics
export const getWelcomeGiftStats = async () => {
  if (!isFirebaseConfigured()) {
    return { total: 0, successful: 0, failed: 0 };
  }

  try {
    const welcomeQuery = query(collection(db, WELCOME_GIFTS_COLLECTION));
    const querySnapshot = await getDocs(welcomeQuery);
    
    let total = 0;
    let successful = 0;
    let failed = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      if (data.giftSent) {
        successful++;
      } else {
        failed++;
      }
    });
    
    return { total, successful, failed };
  } catch (error) {
    console.error('Error getting welcome gift stats:', error);
    return { total: 0, successful: 0, failed: 0 };
  }
};