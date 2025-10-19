import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getUserProfile } from '../services/profileService';

export const useSearch = () => {
  const { provider } = useWeb3();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchUsers = async (query) => {
    if (!query.trim() || !provider) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = [];

      // Check if query is a valid Ethereum address
      if (query.match(/^0x[a-fA-F0-9]{40}$/)) {
        try {
          const profile = await getUserProfile(provider, query);
          if (profile && profile.exists) {
            results.push({
              address: query.toLowerCase(),
              profile,
              matchType: 'address'
            });
          }
        } catch (error) {
          console.log('Profile not found for address:', query);
        }
      } else {
        // For non-address queries, we would need to implement a proper indexing solution
        // This could be done with:
        // 1. A subgraph that indexes all profile creation events
        // 2. A backend service that maintains a searchable database
        // 3. IPFS-based indexing solution
        
        // For now, we'll show a message that only address search is supported
        if (results.length === 0) {
          setError('Currently only wallet address search is supported. Please enter a valid Ethereum address (0x...)');
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  return {
    searchResults,
    loading,
    error,
    searchUsers,
    clearSearch
  };
};