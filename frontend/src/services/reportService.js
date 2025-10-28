import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Save a report notification
export const saveReportNotification = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      timestamp: new Date(),
      status: 'pending' // pending, reviewed, resolved
    });
    
    console.log('Report notification saved with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving report notification: ', error);
    throw error;
  }
};

// Save a post removal notification
export const saveRemovalNotification = async (removalData) => {
  try {
    const docRef = await addDoc(collection(db, 'removals'), {
      ...removalData,
      timestamp: new Date(),
      notified: false
    });
    
    console.log('Removal notification saved with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving removal notification: ', error);
    throw error;
  }
};

// Get removal notifications for a user
export const getUserRemovalNotifications = async (userAddress) => {
  try {
    const q = query(
      collection(db, 'removals'),
      where('authorAddress', '==', userAddress),
      orderBy('timestamp', 'desc'),
      limit(10)
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
    console.error('Error getting removal notifications: ', error);
    return [];
  }
};

// Get report statistics for a post
export const getPostReportStats = async (postId) => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('postId', '==', postId)
    );
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    const reportTypes = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data
      });
      
      // Count report types
      const type = data.reportType || 'other';
      reportTypes[type] = (reportTypes[type] || 0) + 1;
    });
    
    return {
      totalReports: reports.length,
      reports,
      reportTypes
    };
  } catch (error) {
    console.error('Error getting post report stats: ', error);
    return {
      totalReports: 0,
      reports: [],
      reportTypes: {}
    };
  }
};

// Report type mappings
export const REPORT_TYPES = {
  1: 'Spam',
  2: 'Inappropriate Content',
  3: 'Harassment',
  4: 'Copyright Violation',
  5: 'Other'
};

export const getReportTypeName = (typeId) => {
  return REPORT_TYPES[typeId] || 'Unknown';
};