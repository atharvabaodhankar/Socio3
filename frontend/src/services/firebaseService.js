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

// Collections
const LIKES_COLLECTION = 'likes';
const COMMENTS_COLLECTION = 'comments';
const POST_STATS_COLLECTION = 'postStats';

// Like functions
export const likePost = async (postId, userAddress) => {
  try {
    const likeId = `${postId}_${userAddress}`;
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
    throw error;
  }
};

export const unlikePost = async (postId, userAddress) => {
  try {
    const likeId = `${postId}_${userAddress}`;
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
    const likeId = `${postId}_${userAddress}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    const likeDoc = await getDoc(likeRef);
    
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const getLikesCount = async (postId) => {
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