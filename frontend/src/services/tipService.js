import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

const TIPS_COLLECTION = 'tips';

// Save tip message to Firebase
export const saveTipMessage = async (tipData) => {
  try {
    console.log('Saving tip message with data:', tipData);
    const tipRef = collection(db, TIPS_COLLECTION);
    
    const tipDocument = {
      fromAddress: tipData.fromAddress.toLowerCase(),
      toAddress: tipData.toAddress.toLowerCase(),
      amount: tipData.amount,
      message: tipData.message || '',
      transactionHash: tipData.transactionHash,
      timestamp: serverTimestamp(),
      read: false,
      fromName: tipData.fromName || '',
      toName: tipData.toName || ''
    };

    console.log('Tip document to save:', tipDocument);
    const docRef = await addDoc(tipRef, tipDocument);
    console.log('Tip message saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving tip message:', error);
    throw error;
  }
};

// Get tip messages received by a user
export const getTipMessagesForUser = async (userAddress, limitCount = 20) => {
  try {
    console.log('Querying tips for address:', userAddress.toLowerCase());
    const tipsRef = collection(db, TIPS_COLLECTION);
    const q = query(
      tipsRef,
      where('toAddress', '==', userAddress.toLowerCase()),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const tips = [];
    
    querySnapshot.forEach((doc) => {
      console.log('Found tip document:', doc.id, doc.data());
      tips.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Total tips found:', tips.length);
    return tips;
  } catch (error) {
    console.error('Error getting tip messages:', error);
    throw error;
  }
};

// Get tip messages sent by a user
export const getTipMessagesSentByUser = async (userAddress, limitCount = 20) => {
  try {
    const tipsRef = collection(db, TIPS_COLLECTION);
    const q = query(
      tipsRef,
      where('fromAddress', '==', userAddress.toLowerCase()),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const tips = [];
    
    querySnapshot.forEach((doc) => {
      tips.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return tips;
  } catch (error) {
    console.error('Error getting sent tip messages:', error);
    throw error;
  }
};

// Mark tip message as read
export const markTipAsRead = async (tipId) => {
  try {
    const tipRef = doc(db, TIPS_COLLECTION, tipId);
    await updateDoc(tipRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking tip as read:', error);
    throw error;
  }
};

// Get unread tip count for a user
export const getUnreadTipCount = async (userAddress) => {
  try {
    console.log('Querying unread tips for address:', userAddress.toLowerCase());
    const tipsRef = collection(db, TIPS_COLLECTION);
    const q = query(
      tipsRef,
      where('toAddress', '==', userAddress.toLowerCase()),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    console.log('Unread tips query result size:', querySnapshot.size);
    querySnapshot.forEach((doc) => {
      console.log('Unread tip:', doc.id, doc.data());
    });
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread tip count:', error);
    return 0;
  }
};

// Get tip statistics for a user
export const getTipStats = async (userAddress) => {
  try {
    const [received, sent] = await Promise.all([
      getTipMessagesForUser(userAddress, 1000), // Get all tips for stats
      getTipMessagesSentByUser(userAddress, 1000)
    ]);

    const totalReceived = received.reduce((sum, tip) => sum + parseFloat(tip.amount || 0), 0);
    const totalSent = sent.reduce((sum, tip) => sum + parseFloat(tip.amount || 0), 0);

    return {
      totalReceived: totalReceived.toFixed(4),
      totalSent: totalSent.toFixed(4),
      tipCount: received.length,
      sentCount: sent.length
    };
  } catch (error) {
    console.error('Error getting tip stats:', error);
    return {
      totalReceived: '0',
      totalSent: '0',
      tipCount: 0,
      sentCount: 0
    };
  }
};