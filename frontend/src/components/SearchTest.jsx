import React, { useState } from 'react';
import { searchUsers } from '../services/userMappingService';
import { createUserMapping } from '../services/userMappingService';

// Test component to verify Firebase search functionality
const SearchTest = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchUsers(query);
      setResults(searchResults);
      console.log('Search results:', searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestUser = async () => {
    try {
      const testProfile = {
        username: 'testuser',
        displayName: 'Test User',
        bio: 'This is a test user for Firebase search',
        website: 'https://test.com',
        twitter: 'testuser',
        profileImage: '',
        coverImage: ''
      };
      
      await createUserMapping('0x1234567890123456789012345678901234567890', testProfile);
      console.log('Test user added to Firebase');
    } catch (error) {
      console.error('Error adding test user:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl">
      <h3 className="text-white text-lg font-semibold mb-4">Firebase Search Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={addTestUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Test User to Firebase
        </button>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="space-y-2">
          {results.map((user, index) => (
            <div key={index} className="p-3 bg-gray-700 rounded-lg">
              <div className="text-white font-medium">{user.displayName || user.username}</div>
              <div className="text-gray-400 text-sm">{user.address}</div>
              <div className="text-gray-500 text-xs">Match: {user.matchType}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchTest;