import { saveTipMessage, getTipMessagesForUser, getUnreadTipCount } from '../services/tipService';

// Test function to add a sample tip
export const addTestTip = async (toAddress) => {
  try {
    const testTip = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: toAddress,
      amount: '0.01',
      message: 'Test tip message! Love your content!',
      transactionHash: '0xtest123456789',
      fromName: 'Test User',
      toName: 'Recipient'
    };

    console.log('Adding test tip:', testTip);
    const tipId = await saveTipMessage(testTip);
    console.log('Test tip added with ID:', tipId);
    return tipId;
  } catch (error) {
    console.error('Error adding test tip:', error);
    throw error;
  }
};

// Test function to check tips for a user
export const testGetTips = async (userAddress) => {
  try {
    console.log('Testing get tips for:', userAddress);
    const tips = await getTipMessagesForUser(userAddress);
    console.log('Retrieved tips:', tips);
    
    const unreadCount = await getUnreadTipCount(userAddress);
    console.log('Unread count:', unreadCount);
    
    return { tips, unreadCount };
  } catch (error) {
    console.error('Error testing tips:', error);
    throw error;
  }
};

// Test function to add a post tip
export const addTestPostTip = async (toAddress) => {
  try {
    const testTip = {
      fromAddress: '0x1234567890123456789012345678901234567890',
      toAddress: toAddress,
      amount: '0.05',
      message: 'Tipped your post: "Amazing content!"',
      transactionHash: '0xtest123456789post',
      fromName: 'Test User',
      toName: 'Recipient',
      postId: 'test-post-123'
    };

    console.log('Adding test post tip:', testTip);
    const tipId = await saveTipMessage(testTip);
    console.log('Test post tip added with ID:', tipId);
    return tipId;
  } catch (error) {
    console.error('Error adding test post tip:', error);
    throw error;
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testTips = {
    addTestTip,
    addTestPostTip,
    testGetTips
  };
}