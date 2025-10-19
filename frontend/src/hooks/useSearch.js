import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getUserProfile } from '../services/profileService';
import { searchUsers as searchUsersFirebase } from '../services/userMappingService';

export const useSearch = () => {
  const { provider } = useWeb3();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = [];

      // First try Firebase search for username/display name
      try {
        const firebaseResults = await searchUsersFirebase(query, 10);
        
        for (const user of firebaseResults) {
          // Get the full profile from blockchain for each Firebase result
          try {
            const profile = await getUserProfile(provider, user.address);
            results.push({
              address: user.address,
              profile: profile || {
                username: user.username,
                displayName: user.displayName,
                bio: user.bio,
                website: user.website,
                twitter: user.twitter,
                profileImage: user.profileImage,
                exists: true,
                userAddress: user.address
              },
              matchType: user.matchType
            });
          } catch (error) {
            // If blockchain profile fails, use Firebase data
            results.push({
              address: user.address,
              profile: {
                username: user.username,
                displayName: user.displayName,
                bio: user.bio,
                website: user.website,
                twitter: user.twitter,
                profileImage: user.profileImage,
                exists: true,
                userAddress: user.address
              },
              matchType: user.matchType
            });
          }
        }
      } catch (firebaseError) {
        console.log('Firebase search failed:', firebaseError);
      }

      // If it's a valid Ethereum address, also try direct blockchain search
      if (query.match(/^0x[a-fA-F0-9]{40}$/)) {
        try {
          const profile = await getUserProfile(provider, query);
          if (profile && profile.exists) {
            // Check if we already have this address from Firebase
            const existingResult = results.find(r => r.address.toLowerCase() === query.toLowerCase());
            if (!existingResult) {
              results.push({
                address: query.toLowerCase(),
                profile,
                matchType: 'address'
              });
            }
          }
        } catch (error) {
          console.log('Profile not found for address:', query);
        }
      }

      if (results.length === 0) {
        setError('No users found. Try searching by username, display name, or wallet address.');
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