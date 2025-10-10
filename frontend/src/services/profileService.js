import { ethers } from 'ethers';
import { uploadToPinata, getIPFSUrl } from '../config/pinata';

// Profile contract ABI (will be updated after deployment)
const PROFILE_CONTRACT_ABI = [
  "function createProfile(string memory ipfsHash, string memory username) external",
  "function updateProfile(string memory ipfsHash) external", 
  "function updateUsername(string memory newUsername) external",
  "function getProfile(address user) external view returns (string memory ipfsHash, uint256 timestamp, bool exists)",
  "function getUsername(address user) external view returns (string memory)",
  "function getUserByUsername(string memory username) external view returns (address)",
  "function hasProfile(address user) external view returns (bool)",
  "function isUsernameAvailable(string memory username) external view returns (bool)",
  "event ProfileCreated(address indexed user, string ipfsHash, string username, uint256 timestamp)",
  "event ProfileUpdated(address indexed user, string ipfsHash, uint256 timestamp)"
];

// Contract address
const PROFILE_CONTRACT_ADDRESS = "0x08A915445A77Fe63aD1c57a8A6034F3159A7fcD2";

// Save user profile to blockchain + IPFS
export const saveUserProfile = async (signer, profileData) => {
  try {
    // Upload profile data to IPFS
    const profileBlob = new Blob([JSON.stringify(profileData)], { type: 'application/json' });
    const profileFile = new File([profileBlob], 'profile.json', { type: 'application/json' });
    
    const uploadResult = await uploadToPinata(profileFile);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Get contract instance
    const contract = new ethers.Contract(PROFILE_CONTRACT_ADDRESS, PROFILE_CONTRACT_ABI, signer);
    
    // Check if profile exists
    const hasProfile = await contract.hasProfile(await signer.getAddress());
    
    let tx;
    if (hasProfile) {
      // Update existing profile
      tx = await contract.updateProfile(uploadResult.ipfsHash);
    } else {
      // Create new profile
      const username = profileData.username || '';
      tx = await contract.createProfile(uploadResult.ipfsHash, username);
    }
    
    await tx.wait();
    return { ...profileData, ipfsHash: uploadResult.ipfsHash };
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Get user profile from blockchain + IPFS
export const getUserProfile = async (provider, userAddress) => {
  try {
    // Get contract instance
    const contract = new ethers.Contract(PROFILE_CONTRACT_ADDRESS, PROFILE_CONTRACT_ABI, provider);
    
    // Get profile from blockchain
    const [ipfsHash, timestamp, exists] = await contract.getProfile(userAddress);
    
    if (!exists || !ipfsHash) {
      return getDefaultProfile(userAddress);
    }

    // Fetch profile data from IPFS
    const ipfsUrl = getIPFSUrl(ipfsHash);
    const response = await fetch(ipfsUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile from IPFS');
    }
    
    const profileData = await response.json();
    
    return {
      ...profileData,
      userAddress: userAddress.toLowerCase(),
      ipfsHash,
      timestamp: Number(timestamp),
      exists
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    return getDefaultProfile(userAddress);
  }
};

// Get username for a user address
export const getUsername = async (provider, userAddress) => {
  try {
    const contract = new ethers.Contract(PROFILE_CONTRACT_ADDRESS, PROFILE_CONTRACT_ABI, provider);
    const username = await contract.getUsername(userAddress);
    return username || null;
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

// Get multiple usernames (for displaying in posts/comments)
export const getMultipleUsernames = async (provider, userAddresses) => {
  try {
    const usernames = {};
    
    const promises = userAddresses.map(async (address) => {
      const username = await getUsername(provider, address);
      usernames[address.toLowerCase()] = username;
    });
    
    await Promise.all(promises);
    return usernames;
  } catch (error) {
    console.error('Error getting multiple usernames:', error);
    const usernames = {};
    userAddresses.forEach(address => {
      usernames[address.toLowerCase()] = null;
    });
    return usernames;
  }
};

// Check if username is available
export const isUsernameAvailable = async (provider, username) => {
  try {
    const contract = new ethers.Contract(PROFILE_CONTRACT_ADDRESS, PROFILE_CONTRACT_ABI, provider);
    return await contract.isUsernameAvailable(username);
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

// Get multiple user profiles (for displaying in posts/comments)
export const getMultipleUserProfiles = async (provider, userAddresses) => {
  try {
    const profiles = {};
    
    const promises = userAddresses.map(async (address) => {
      const profile = await getUserProfile(provider, address);
      profiles[address.toLowerCase()] = profile;
    });
    
    await Promise.all(promises);
    return profiles;
  } catch (error) {
    console.error('Error getting multiple profiles:', error);
    const profiles = {};
    userAddresses.forEach(address => {
      profiles[address.toLowerCase()] = getDefaultProfile(address);
    });
    return profiles;
  }
};

// Default profile structure
const getDefaultProfile = (userAddress) => ({
  userAddress: userAddress?.toLowerCase() || '',
  username: '',
  displayName: '',
  bio: '',
  website: '',
  twitter: '',
  profileImage: '',
  coverImage: '',
  ipfsHash: '',
  timestamp: 0,
  exists: false
});

// Helper function to format profile for display
export const formatProfileForDisplay = (profile, userAddress) => {
  if (!profile) {
    return getDefaultProfile(userAddress);
  }

  return {
    ...getDefaultProfile(userAddress),
    ...profile,
    displayName: profile.displayName || profile.username || `User ${userAddress?.slice(2, 8)}`,
  };
};

// Helper function to get display name (username or formatted address)
export const getDisplayName = (profile, userAddress) => {
  if (profile?.username) return profile.username;
  if (profile?.displayName) return profile.displayName;
  return `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`;
};