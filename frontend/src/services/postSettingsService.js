import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

const POST_SETTINGS_COLLECTION = 'postSettings';

// Save post settings
export const savePostSettings = async (postId, authorAddress, settings) => {
  try {
    const docId = `${postId}_${authorAddress.toLowerCase()}`;
    const postSettingsRef = doc(db, POST_SETTINGS_COLLECTION, docId);
    
    console.log(`Saving to document ID: ${docId}`);
    console.log('Settings to save:', settings);
    
    const postSettingsDocument = {
      postId: postId,
      authorAddress: authorAddress.toLowerCase(),
      allowComments: settings.allowComments !== undefined ? settings.allowComments : true,
      showLikeCount: settings.showLikeCount !== undefined ? settings.showLikeCount : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Final document to save:', postSettingsDocument);
    
    // Use setDoc without merge to completely overwrite
    await setDoc(postSettingsRef, postSettingsDocument);
    
    console.log('Document saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving post settings:', error);
    throw error;
  }
};

// Get post settings
export const getPostSettings = async (postId, authorAddress) => {
  try {
    const postSettingsRef = doc(db, POST_SETTINGS_COLLECTION, `${postId}_${authorAddress.toLowerCase()}`);
    const docSnap = await getDoc(postSettingsRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default settings if not found
      return {
        allowComments: true,
        showLikeCount: true
      };
    }
  } catch (error) {
    console.error('Error getting post settings:', error);
    // Return default settings on error
    return {
      allowComments: true,
      showLikeCount: true
    };
  }
};

// Get settings for multiple posts
export const getMultiplePostSettings = async (posts) => {
  try {
    console.log('Getting settings for posts:', posts.map(p => ({ id: p.id, author: p.author })));
    
    const settingsPromises = posts.map(post => 
      getPostSettings(post.id, post.author)
    );
    
    const settingsArray = await Promise.all(settingsPromises);
    
    // Create a map of postId -> settings
    const settingsMap = {};
    posts.forEach((post, index) => {
      settingsMap[post.id] = settingsArray[index];
      console.log(`Settings for post ${post.id}:`, settingsArray[index]);
    });
    
    return settingsMap;
  } catch (error) {
    console.error('Error getting multiple post settings:', error);
    return {};
  }
};

// Update post settings
export const updatePostSettings = async (postId, authorAddress, settings) => {
  try {
    const postSettingsRef = doc(db, POST_SETTINGS_COLLECTION, `${postId}_${authorAddress.toLowerCase()}`);
    
    const updateData = {
      ...settings,
      updatedAt: serverTimestamp()
    };

    await setDoc(postSettingsRef, updateData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating post settings:', error);
    throw error;
  }
};