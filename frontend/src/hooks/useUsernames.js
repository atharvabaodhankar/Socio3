import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getMultipleUsernames } from '../services/profileService';

export const useUsernames = (userAddresses = []) => {
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(false);
  const { provider } = useWeb3();

  useEffect(() => {
    if (userAddresses.length > 0 && provider) {
      fetchUsernames();
    }
  }, [userAddresses, provider]);

  const fetchUsernames = async () => {
    try {
      setLoading(true);
      const usernameMap = await getMultipleUsernames(provider, userAddresses);
      setUsernames(usernameMap);
    } catch (error) {
      console.error('Error fetching usernames:', error);
    } finally {
      setLoading(false);
    }
  };

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