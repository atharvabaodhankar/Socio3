import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// Create or update user mapping
export const createUserMapping = async (address, profile) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, address.toLowerCase());
    
    const userData = {
      address: address.toLowerCase(),
      username: profile.username || '',
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      website: profile.website || '',
      twitter: profile.twitter || '',
      profileImage: profile.profileImage || '',
      coverImage: profile.coverImage || '',
      updatedAt: serverTimestamp(),
      // Create searchable fields for better querying
      searchTerms: [
        profile.username?.toLowerCase(),
        profile.displayName?.toLowerCase(),
        address.toLowerCase(),
        ...profile.bio?.toLowerCase().split(' ').filter(word => word.length > 2) || []
      ].filter(Boolean)
    };

    await setDoc(userRef, userData, { merge: true });
    console.log('User mapping created/updated:', address);
    return userData;
  } catch (error) {
    console.error('Error creating user mapping:', error);
    throw error;
  }
};

// Get user by address
export const getUserByAddress = async (address) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, address.toLowerCase());
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user by address:', error);
    throw error;
  }
};

// Search users by various criteria
export const searchUsers = async (searchQuery, maxResults = 10) => {
  try {
    const searchTerm = searchQuery.toLowerCase().trim();
    
    if (!searchTerm) return [];

    // If it's an address, search directly
    if (searchTerm.match(/^0x[a-fA-F0-9]{40}$/)) {
      const user = await getUserByAddress(searchTerm);
      return user ? [user] : [];
    }

    const usersRef = collection(db, USERS_COLLECTION);
    const results = [];

    // Search by username (exact match first)
    const usernameQuery = query(
      usersRef,
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff'),
      orderBy('username'),
      limit(maxResults)
    );

    const usernameSnap = await getDocs(usernameQuery);
    usernameSnap.forEach(doc => {
      const data = doc.data();
      results.push({ ...data, matchType: 'username' });
    });

    // Search by display name if we need more results
    if (results.length < maxResults) {
      const displayNameQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        orderBy('displayName'),
        limit(maxResults - results.length)
      );

      const displayNameSnap = await getDocs(displayNameQuery);
      displayNameSnap.forEach(doc => {
        const data = doc.data();
        // Avoid duplicates
        if (!results.find(r => r.address === data.address)) {
          results.push({ ...data, matchType: 'displayName' });
        }
      });
    }

    // Search in search terms array for partial matches
    if (results.length < maxResults) {
      const searchTermsQuery = query(
        usersRef,
        where('searchTerms', 'array-contains', searchTerm),
        limit(maxResults - results.length)
      );

      const searchTermsSnap = await getDocs(searchTermsQuery);
      searchTermsSnap.forEach(doc => {
        const data = doc.data();
        // Avoid duplicates
        if (!results.find(r => r.address === data.address)) {
          results.push({ ...data, matchType: 'bio' });
        }
      });
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Get all users (for admin purposes, with pagination)
export const getAllUsers = async (lastDoc = null, pageSize = 20) => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    let q = query(
      usersRef,
      orderBy('updatedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        usersRef,
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const users = [];
    
    snapshot.forEach(doc => {
      users.push(doc.data());
    });

    return {
      users,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Update user stats (follower count, post count, etc.)
export const updateUserStats = async (address, stats) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, address.toLowerCase());
    await updateDoc(userRef, {
      ...stats,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// Delete user mapping
export const deleteUserMapping = async (address) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, address.toLowerCase());
    await deleteDoc(userRef);
    console.log('User mapping deleted:', address);
  } catch (error) {
    console.error('Error deleting user mapping:', error);
    throw error;
  }
};