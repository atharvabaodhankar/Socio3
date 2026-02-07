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
  setDoc,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    return db !== null && db !== undefined;
  } catch (error) {
    console.warn('Firebase not properly configured:', error);
    return false;
  }
};

// Collections
const LIKES_COLLECTION = 'likes';
const COMMENTS_COLLECTION = 'comments';
const POST_STATS_COLLECTION = 'postStats';
const WELCOME_GIFTS_COLLECTION = 'welcomeGifts';
const CHATS_COLLECTION = 'chats';
const USERS_COLLECTION = 'users';

// Like functions
export const likePost = async (postId, userAddress) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping like');
    return;
  }

  try {
    // Add like document
    await addDoc(collection(db, LIKES_COLLECTION), {
      postId,
      userAddress: userAddress.toLowerCase(),
      timestamp: serverTimestamp()
    });

    // Update post stats
    const postStatsRef = doc(db, POST_STATS_COLLECTION, postId);
    const postStatsDoc = await getDoc(postStatsRef);

    if (postStatsDoc.exists()) {
      await setDoc(postStatsRef, {
        likeCount: increment(1)
      }, { merge: true });
    } else {
      await setDoc(postStatsRef, {
        likeCount: 1,
        commentCount: 0,
        shareCount: 0
      });
    }

    console.log(`[Firebase] Liked post ${postId}`);
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId, userAddress) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping unlike');
    return;
  }

  try {
    // Find and delete the like document
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where('postId', '==', postId),
      where('userAddress', '==', userAddress.toLowerCase())
    );

    const querySnapshot = await getDocs(likesQuery);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Update post stats
    const postStatsRef = doc(db, POST_STATS_COLLECTION, postId);
    await setDoc(postStatsRef, {
      likeCount: increment(-1)
    }, { merge: true });

    console.log(`[Firebase] Unliked post ${postId}`);
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const isPostLiked = async (postId, userAddress) => {
  if (!isFirebaseConfigured()) {
    return false;
  }

  try {
    const likesQuery = query(
      collection(db, LIKES_COLLECTION),
      where('postId', '==', postId),
      where('userAddress', '==', userAddress.toLowerCase()),
      limit(1)
    );

    const querySnapshot = await getDocs(likesQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if post is liked:', error);
    return false;
  }
};

export const getPostLikeCount = async (postId) => {
  if (!isFirebaseConfigured()) {
    return 0;
  }

  try {
    const postStatsRef = doc(db, POST_STATS_COLLECTION, postId);
    const postStatsDoc = await getDoc(postStatsRef);

    if (postStatsDoc.exists()) {
      return postStatsDoc.data().likeCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting post like count:', error);
    return 0;
  }
};

// Comment functions
export const addComment = async (postId, userAddress, comment) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping comment');
    return;
  }

  try {
    await addDoc(collection(db, COMMENTS_COLLECTION), {
      postId,
      userAddress: userAddress.toLowerCase(),
      comment,
      timestamp: serverTimestamp()
    });

    // Update post stats
    const postStatsRef = doc(db, POST_STATS_COLLECTION, postId);
    const postStatsDoc = await getDoc(postStatsRef);

    if (postStatsDoc.exists()) {
      await setDoc(postStatsRef, {
        commentCount: increment(1)
      }, { merge: true });
    } else {
      await setDoc(postStatsRef, {
        likeCount: 0,
        commentCount: 1,
        shareCount: 0
      });
    }

    console.log(`[Firebase] Added comment to post ${postId}`);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('postId', '==', postId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(commentsQuery);
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

export const subscribeToComments = (postId, callback) => {
  if (!isFirebaseConfigured()) {
    callback([]);
    return () => { };
  }

  const commentsQuery = query(
    collection(db, COMMENTS_COLLECTION),
    where('postId', '==', postId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(commentsQuery, (querySnapshot) => {
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

export const getCommentCount = async (postId) => {
  if (!isFirebaseConfigured()) {
    return 0;
  }

  try {
    const postStatsRef = doc(db, POST_STATS_COLLECTION, postId);
    const postStatsDoc = await getDoc(postStatsRef);

    if (postStatsDoc.exists()) {
      return postStatsDoc.data().commentCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
};

// Post stats functions
export const getPostStats = async (postId) => {
  if (!isFirebaseConfigured()) {
    return { likeCount: 0, commentCount: 0, shareCount: 0 };
  }

  try {
    const postStatsRef = doc(db, POST_STATS_COLLECTION, String(postId));
    const postStatsDoc = await getDoc(postStatsRef);

    if (postStatsDoc.exists()) {
      const data = postStatsDoc.data();
      return {
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        shareCount: data.shareCount || 0
      };
    }

    return { likeCount: 0, commentCount: 0, shareCount: 0 };
  } catch (error) {
    console.error('Error getting post stats:', error);
    return { likeCount: 0, commentCount: 0, shareCount: 0 };
  }
};

export const incrementShareCount = async (postId) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping share count');
    return;
  }

  try {
    const postStatsRef = doc(db, POST_STATS_COLLECTION, postId);
    const postStatsDoc = await getDoc(postStatsRef);

    if (postStatsDoc.exists()) {
      await setDoc(postStatsRef, {
        shareCount: increment(1)
      }, { merge: true });
    } else {
      await setDoc(postStatsRef, {
        likeCount: 0,
        commentCount: 0,
        shareCount: 1
      });
    }

    console.log(`[Firebase] Incremented share count for post ${postId}`);
  } catch (error) {
    console.error('Error incrementing share count:', error);
    throw error;
  }
};

export const getMultiplePostStats = async (postIds) => {
  if (!isFirebaseConfigured()) {
    return {};
  }

  try {
    const statsPromises = postIds.map(postId =>
      getPostStats(postId).then(stats => ({ postId, stats }))
    );

    const results = await Promise.all(statsPromises);

    const statsMap = {};
    results.forEach(({ postId, stats }) => {
      statsMap[postId] = stats;
    });

    return statsMap;
  } catch (error) {
    console.error('Error getting multiple post stats:', error);
    return {};
  }
};

// Welcome gift tracking functions
export const hasReceivedWelcomeGift = async (userAddress) => {
  if (!isFirebaseConfigured()) {
    return false;
  }

  try {
    const userDocRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking welcome gift status:', error);
    return false;
  }
};

export const recordWelcomeGift = async (userAddress, txHash) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping welcome gift record');
    return;
  }

  try {
    const userDocRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
    await setDoc(userDocRef, {
      userAddress: userAddress.toLowerCase(),
      txHash,
      timestamp: serverTimestamp(),
      giftSent: true
    });

    console.log(`[Firebase] Recorded welcome gift for ${userAddress}`);
  } catch (error) {
    console.error('Error recording welcome gift:', error);
    throw error;
  }
};

export const recordFailedWelcomeGift = async (userAddress, error) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping failed gift record');
    return;
  }

  try {
    const userDocRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
    await setDoc(userDocRef, {
      userAddress: userAddress.toLowerCase(),
      error: error.message || String(error),
      timestamp: serverTimestamp(),
      giftSent: false
    });

    console.log(`[Firebase] Recorded failed welcome gift for ${userAddress}`);
  } catch (firebaseError) {
    console.error('Error recording failed welcome gift:', firebaseError);
  }
};

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

// Subscribe to post stats in real-time
export const subscribeToPostStats = (postId, callback) => {
  if (!isFirebaseConfigured()) {
    callback({ likes: 0, comments: 0, shares: 0 });
    return () => { };
  }

  const postStatsRef = doc(db, POST_STATS_COLLECTION, String(postId));

  return onSnapshot(postStatsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        likes: data.likeCount || 0,
        comments: data.commentCount || 0,
        shares: data.shareCount || 0
      });
    } else {
      callback({ likes: 0, comments: 0, shares: 0 });
    }
  });
};

// Alternative names for welcome gift functions (for compatibility)
export const hasUserBeenWelcomed = hasReceivedWelcomeGift;
export const markUserAsWelcomed = recordWelcomeGift;

export const getWelcomeGiftHistory = async (userAddress) => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const userDocRef = doc(db, WELCOME_GIFTS_COLLECTION, userAddress.toLowerCase());
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting welcome gift history:', error);
    return null;
  }
};

// Chat Functions
export const createOrGetChat = async (currentUserAddress, otherUserAddress) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured');
  }

  try {
    // Generate deterministic chatId by sorting addresses
    const addresses = [currentUserAddress.toLowerCase(), otherUserAddress.toLowerCase()].sort();
    const chatId = `${addresses[0]}_${addresses[1]}`;

    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      // Create new chat with proper initial values
      await setDoc(chatRef, {
        participants: addresses,
        lastMessage: '', // Empty string instead of null
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('[Chat] Created new chat:', chatId);
    } else {
      // Update timestamp to bring chat to top
      await setDoc(chatRef, {
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, senderAddress, text) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured');
  }

  try {
    const trimmedText = text.trim();
    
    // Add message to messages subcollection
    const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    await addDoc(messagesRef, {
      text: trimmedText,
      sender: senderAddress.toLowerCase(),
      timestamp: serverTimestamp(),
      reactions: {}
    });

    // Update chat metadata - CRITICAL for showing in chat list
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await setDoc(chatRef, {
      lastMessage: trimmedText,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('[Chat] Message sent and chat updated:', chatId);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(messages);
  });
};

export const subscribeToMyChats = (userAddress, callback, onError) => {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Not configured, returning empty chats');
    callback([]);
    return () => { };
  }

  try {
    const chatsRef = collection(db, CHATS_COLLECTION);
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userAddress.toLowerCase()),
      orderBy('lastMessageTime', 'desc')
    );

    console.log('[Firebase] Setting up chat subscription for:', userAddress);

    return onSnapshot(q, 
      (querySnapshot) => {
        const chats = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          chats.push({
            id: doc.id,
            ...data
          });
        });
        console.log('[Firebase] Chat snapshot received:', chats.length, 'chats');
        callback(chats);
      },
      (error) => {
        console.error('[Firebase] Error in chat subscription:', error);
        console.error('[Firebase] Error code:', error.code);
        console.error('[Firebase] Error message:', error.message);
        
        // If it's an index error, provide helpful message
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
          console.error('[Firebase] ⚠️ FIRESTORE INDEX REQUIRED!');
          console.error('[Firebase] Create a composite index for:');
          console.error('[Firebase] Collection: chats');
          console.error('[Firebase] Fields: participants (Array), lastMessageTime (Descending)');
          console.error('[Firebase] The error message should contain a link to create the index.');
        }
        
        if (onError) {
          onError(error);
        }
      }
    );
  } catch (error) {
    console.error('[Firebase] Error setting up subscription:', error);
    callback([]);
    return () => { };
  }
};

// Presence Functions
export const updateUserPresence = async (userAddress) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping presence update');
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userAddress.toLowerCase());
    await setDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user presence:', error);
  }
};

export const setUserOffline = async (userAddress) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, skipping offline status');
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, userAddress.toLowerCase());
    await setDoc(userRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

export const subscribeToUserStatus = (address, callback) => {
  const userRef = doc(db, USERS_COLLECTION, address.toLowerCase());

  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback({ isOnline: false, lastSeen: null });
    }
  });
};

// Message Management Functions
export const deleteMessage = async (chatId, messageId) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured');
  }

  try {
    const messageRef = doc(db, CHATS_COLLECTION, chatId, 'messages', messageId);
    await deleteDoc(messageRef);
    console.log('[Chat] Message deleted:', messageId);
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const editMessage = async (chatId, messageId, newText) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured');
  }

  try {
    const messageRef = doc(db, CHATS_COLLECTION, chatId, 'messages', messageId);
    await setDoc(messageRef, {
      text: newText.trim(),
      edited: true,
      editedAt: serverTimestamp()
    }, { merge: true });
    console.log('[Chat] Message edited:', messageId);
    return true;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const addReaction = async (chatId, messageId, userAddress, emoji) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured');
  }

  try {
    const messageRef = doc(db, CHATS_COLLECTION, chatId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (messageDoc.exists()) {
      const data = messageDoc.data();
      const reactions = data.reactions || {};

      // Toggle reaction - if user already reacted with this emoji, remove it
      if (reactions[emoji] && reactions[emoji].includes(userAddress.toLowerCase())) {
        reactions[emoji] = reactions[emoji].filter(addr => addr !== userAddress.toLowerCase());
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        // Add reaction
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        reactions[emoji].push(userAddress.toLowerCase());
      }

      await setDoc(messageRef, {
        reactions
      }, { merge: true });

      console.log('[Chat] Reaction updated:', messageId);
      return true;
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};