import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getUnreadTipCount, getTipMessagesForUser } from '../services/tipService';

export const useTipNotifications = () => {
  const { account, isConnected } = useWeb3();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadUnreadCount();
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isConnected, account]);

  const loadUnreadCount = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      const count = await getUnreadTipCount(account);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread tip count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshCount = () => {
    if (account) {
      loadUnreadCount();
    }
  };

  return {
    unreadCount,
    loading,
    refreshCount
  };
};