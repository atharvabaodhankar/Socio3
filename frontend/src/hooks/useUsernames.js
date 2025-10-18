import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getMultipleUsernames } from '../services/profileService';

export const useUsernames = (userAddresses = []) => {
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(false);
  const { provider } = useWeb3();

  // Memoize the addresses array to prevent unnecessary re-renders
  const memoizedAddresses = useMemo(() => {
    return userAddresses.filter(Boolean).map(addr => addr.toLowerCase());
  }, [userAddresses]);

  const fetchUsernames = useCallback(async () => {
    if (!provider || memoizedAddresses.length === 0) return;
    
    try {
      setLoading(true);
      const usernameMap = await getMultipleUsernames(provider, memoizedAddresses);
      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error fetching usernames:', error);
      setUsernames({});
    } finally {
      setLoading(false);
    }
  }, [provider, memoizedAddresses]);

  useEffect(() => {
    fetchUsernames();
  }, [fetchUsernames]);

  const getDisplayName = (address) => {
    const username = usernames[address?.toLowerCase()];
    if (username) return username;
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  return {
    usernames,
    loading,
    getDisplayName,
    refetch: fetchUsernames
  };
};