import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';

// Save a removal notification for the post author
export const saveRemovalNotification = async (removalData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      type: 'post_removed',
      recipientAddress: removalData.authorAddress,
      title: 'Post Removed',
      message: `Your post has been removed: ${removalData.reason}`,
      postId: removalData.postId,
      reason: removalData.reason,
      timestamp: new Date(),
      read: false,
      data: {
        postCaption: removalData.postCaption || '',
        reportCount: removalData.reportCount || 0,
        removalType: removalData.removalType || 'automatic'
      }
    });
    
    console.log('Removal notification saved with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving removal notification: ', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userAddress, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientAddress', '==', userAddress),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications: ', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date()
    });
    
    console.log('Notification marked as read: ', notificationId);
  } catch (error) {
    console.error('Error marking notification as read: ', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userAddress) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientAddress', '==', userAddress),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count: ', error);
    return 0;
  }
};

// Auto-deletion scenarios explained
export const AUTO_DELETION_SCENARIOS = {
  HIGH_REPORTS: {
    condition: 'reports >= 5',
    description: 'Post automatically removed when it receives 5 or more reports',
    example: '5 reports + any likes = REMOVED'
  },
  LOW_ENGAGEMENT_HIGH_REPORTS: {
    condition: 'reports >= 3 && likes == 0',
    description: 'Post with no likes but multiple reports gets removed faster',
    example: '0 likes + 3 reports = REMOVED'
  },
  REPORT_TO_LIKE_RATIO: {
    condition: 'reports >= (likes * 2)',
    description: 'Post removed when reports are double the likes',
    example: '1 like + 2 reports = REMOVED, 2 likes + 4 reports = REMOVED'
  }
};

// Check if post should be auto-removed (frontend logic)
export const shouldAutoRemovePost = (reportCount, likeCount) => {
  // Scenario 1: High report threshold
  if (reportCount >= 5) {
    return {
      shouldRemove: true,
      reason: 'Exceeded report threshold (5+ reports)',
      scenario: 'HIGH_REPORTS'
    };
  }
  
  // Scenario 2: Low engagement with reports
  if (likeCount === 0 && reportCount >= 3) {
    return {
      shouldRemove: true,
      reason: 'Multiple reports on content with no engagement',
      scenario: 'LOW_ENGAGEMENT_HIGH_REPORTS'
    };
  }
  
  // Scenario 3: Report-to-like ratio
  if (likeCount > 0 && reportCount >= (likeCount * 2)) {
    return {
      shouldRemove: true,
      reason: 'High report-to-like ratio',
      scenario: 'REPORT_TO_LIKE_RATIO'
    };
  }
  
  return {
    shouldRemove: false,
    reason: 'Post within acceptable limits',
    scenario: 'SAFE'
  };
};