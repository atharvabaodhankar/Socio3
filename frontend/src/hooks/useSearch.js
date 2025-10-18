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
          if (profile) {
            results.push({
              address: query.toLowerCase(),
              profile,
              matchType: 'address'
            });
          }
        } catch (error) {
          console.log('Profile not found for address:', query);
        }
      }

      // Mock users with sample profiles for testing
      // In a real app, you'd have an indexing service or subgraph
      const mockUsers = [
        {
          address: '0x1234567890123456789012345678901234567890',
          profile: {
            username: 'alice.eth',
            displayName: 'Alice Cooper',
            bio: 'Digital artist and NFT creator 🎨',
            exists: true,
            userAddress: '0x1234567890123456789012345678901234567890'
          }
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          profile: {
            username: 'bob_crypto',
            displayName: 'Bob Smith',
            bio: 'Blockchain developer and DeFi enthusiast',
            exists: true,
            userAddress: '0x2345678901234567890123456789012345678901'
          }
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          profile: {
            username: 'charlie.dev',
            displayName: 'Charlie Brown',
            bio: 'Web3 builder | Smart contract auditor',
            exists: true,
            userAddress: '0x3456789012345678901234567890123456789012'
          }
        },
        {
          address: '0x4567890123456789012345678901234567890123',
          profile: {
            username: 'diana_nft',
            displayName: 'Diana Prince',
            bio: 'NFT collector and community builder 🚀',
            exists: true,
            userAddress: '0x4567890123456789012345678901234567890123'
          }
        },
        {
          address: '0x5678901234567890123456789012345678901234',
          profile: {
            username: 'eve.creator',
            displayName: 'Eve Johnson',
            bio: 'Content creator in the metaverse',
            exists: true,
            userAddress: '0x5678901234567890123456789012345678901234'
          }
        },
        {
          address: '0x6789012345678901234567890123456789012345',
          profile: {
            username: 'atharva',
            displayName: 'Atharva',
            bio: 'Blockchain Developer',
            exists: true,
            userAddress: '0x6789012345678901234567890123456789012345'
          }
        }
      ];

      // Always search through mock users (not just for non-address queries)
      for (const user of mockUsers) {
        const { address, profile } = user;
        
        // Check if username or display name matches query
        const username = profile?.username?.toLowerCase() || '';
        const displayName = profile?.displayName?.toLowerCase() || '';
        const bio = profile?.bio?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        
        if (username.includes(queryLower) || displayName.includes(queryLower) || 
            bio.includes(queryLower) || address.toLowerCase().includes(queryLower)) {
          
          // Avoid duplicates if we already found this address
          const alreadyExists = results.some(r => r.address === address.toLowerCase());
          if (!alreadyExists) {
            results.push({
              address: address.toLowerCase(),
              profile: {
                ...profile,
                userAddress: address.toLowerCase()
              },
              matchType: username.includes(queryLower) ? 'username' : 
                        displayName.includes(queryLower) ? 'displayName' : 
                        bio.includes(queryLower) ? 'bio' : 'address'
            });
          }
        }
      }

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search users');
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