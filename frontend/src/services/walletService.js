import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get tip statistics for a user
export const getUserTipStats = async (userAddress) => {
  try {
    const tipsRef = collection(db, 'tips');
    
    // Get tips received
    const receivedQuery = query(
      tipsRef,
      where('toAddress', '==', userAddress.toLowerCase()),
      orderBy('timestamp', 'desc')
    );
    const receivedSnapshot = await getDocs(receivedQuery);
    
    let totalReceived = 0;
    let receivedCount = 0;
    const receivedTips = [];
    
    receivedSnapshot.forEach((doc) => {
      const data = doc.data();
      totalReceived += parseFloat(data.amount || 0);
      receivedCount++;
      receivedTips.push({
        id: doc.id,
        ...data,
        type: 'received'
      });
    });
    
    // Get tips sent
    const sentQuery = query(
      tipsRef,
      where('fromAddress', '==', userAddress.toLowerCase()),
      orderBy('timestamp', 'desc')
    );
    const sentSnapshot = await getDocs(sentQuery);
    
    let totalSent = 0;
    let sentCount = 0;
    const sentTips = [];
    
    sentSnapshot.forEach((doc) => {
      const data = doc.data();
      totalSent += parseFloat(data.amount || 0);
      sentCount++;
      sentTips.push({
        id: doc.id,
        ...data,
        type: 'sent'
      });
    });
    
    // Combine and sort by timestamp
    const allTips = [...receivedTips, ...sentTips].sort((a, b) => {
      const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(0);
      const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(0);
      return timeB - timeA;
    });
    
    return {
      totalReceived: totalReceived.toFixed(4),
      totalSent: totalSent.toFixed(4),
      receivedCount,
      sentCount,
      recentTips: allTips.slice(0, 10),
      allTips
    };
  } catch (error) {
    console.error('Error fetching tip stats:', error);
    return {
      totalReceived: '0',
      totalSent: '0',
      receivedCount: 0,
      sentCount: 0,
      recentTips: [],
      allTips: []
    };
  }
};

// Get recent transactions (tips only for now)
export const getRecentTransactions = async (userAddress, limitCount = 10) => {
  try {
    const stats = await getUserTipStats(userAddress);
    return stats.recentTips.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
};

// Format timestamp to relative time
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Get Etherscan link for address
export const getEtherscanLink = (address, type = 'address') => {
  const network = 'sepolia'; // Change based on your network
  return `https://${network}.etherscan.io/${type}/${address}`;
};

// Copy to clipboard helper
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Get welcome gift status
export const getWelcomeGiftStatus = async (userAddress) => {
  try {
    const giftsRef = collection(db, 'welcomeGifts');
    const giftQuery = query(
      giftsRef,
      where('userAddress', '==', userAddress.toLowerCase()),
      limit(1)
    );
    const giftSnapshot = await getDocs(giftQuery);
    
    if (!giftSnapshot.empty) {
      const data = giftSnapshot.docs[0].data();
      return {
        received: true,
        amount: '0.005',
        timestamp: data.timestamp,
        txHash: data.txHash
      };
    }
    
    return { received: false };
  } catch (error) {
    console.error('Error checking welcome gift:', error);
    return { received: false };
  }
};
