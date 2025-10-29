import { ethers } from "ethers";
import { uploadToPinata, getIPFSUrl } from "../config/pinata";
import { CONTRACT_ADDRESSES, PROFILE_CONTRACT_ABI } from "../config/contracts";

// Save user profile to blockchain + IPFS
export const saveUserProfile = async (signer, profileData) => {
  try {
    console.log("Saving profile to blockchain...", profileData);

    // Upload profile data to IPFS
    const profileBlob = new Blob([JSON.stringify(profileData)], {
      type: "application/json",
    });
    const profileFile = new File([profileBlob], "profile.json", {
      type: "application/json",
    });

    console.log("Uploading profile data to IPFS...");
    const uploadResult = await uploadToPinata(profileFile);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "Failed to upload to IPFS");
    }

    console.log("Profile data uploaded to IPFS:", uploadResult.ipfsHash);

    // Get contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROFILE_CONTRACT,
      PROFILE_CONTRACT_ABI,
      signer
    );
    const userAddress = await signer.getAddress();

    // Check if profile exists
    let hasProfile = false;
    try {
      hasProfile = await contract.hasProfile(userAddress);
    } catch (error) {
      console.log("Profile does not exist yet, will create new one");
      hasProfile = false;
    }

    console.log("Profile exists:", hasProfile);

    let tx;
    if (hasProfile) {
      // Update existing profile
      console.log("Updating existing profile...");
      tx = await contract.updateProfile(uploadResult.ipfsHash);
    } else {
      // Create new profile
      console.log("Creating new profile...");
      const username = profileData.username || "";
      tx = await contract.createProfile(uploadResult.ipfsHash, username);
    }

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);

    return {
      ...profileData,
      ipfsHash: uploadResult.ipfsHash,
      exists: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error saving profile:", error);

    // Provide more specific error messages
    if (error.message.includes("user rejected")) {
      throw new Error("Transaction was rejected by user");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient funds for transaction");
    } else if (error.message.includes("Username already taken")) {
      throw new Error("Username is already taken");
    } else {
      throw new Error(`Failed to save profile: ${error.message}`);
    }
  }
};

// Get user profile from blockchain + IPFS
export const getUserProfile = async (provider, userAddress) => {
  try {
    // Get contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROFILE_CONTRACT,
      PROFILE_CONTRACT_ABI,
      provider
    );

    // Get profile from blockchain
    const [ipfsHash, timestamp, exists] = await contract.getProfile(
      userAddress
    );

    if (!exists || !ipfsHash) {
      return getDefaultProfile(userAddress);
    }

    // Fetch profile data from IPFS
    const ipfsUrl = getIPFSUrl(ipfsHash);
    const response = await fetch(ipfsUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch profile from IPFS");
    }

    const profileData = await response.json();

    return {
      ...profileData,
      userAddress: userAddress.toLowerCase(),
      ipfsHash,
      timestamp: Number(timestamp),
      exists,
    };
  } catch (error) {
    console.error("Error getting profile:", error);
    return getDefaultProfile(userAddress);
  }
};

// Get username for a user address
export const getUsername = async (provider, userAddress) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROFILE_CONTRACT,
      PROFILE_CONTRACT_ABI,
      provider
    );
    const username = await contract.getUsername(userAddress);
    return username || null;
  } catch (error) {
    console.error("Error getting username:", error);
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
    console.error("Error getting multiple usernames:", error);
    const usernames = {};
    userAddresses.forEach((address) => {
      usernames[address.toLowerCase()] = null;
    });
    return usernames;
  }
};

// Check if username is available
export const isUsernameAvailable = async (provider, username) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROFILE_CONTRACT,
      PROFILE_CONTRACT_ABI,
      provider
    );
    return await contract.isUsernameAvailable(username);
  } catch (error) {
    console.error("Error checking username availability:", error);
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
    console.error("Error getting multiple profiles:", error);
    const profiles = {};
    userAddresses.forEach((address) => {
      profiles[address.toLowerCase()] = getDefaultProfile(address);
    });
    return profiles;
  }
};

// Default profile structure
const getDefaultProfile = (userAddress) => ({
  userAddress: userAddress?.toLowerCase() || "",
  username: "",
  displayName: "",
  bio: "",
  website: "",
  twitter: "",
  profileImage: "",
  coverImage: "",
  ipfsHash: "",
  timestamp: 0,
  exists: false,
});

// Helper function to format profile for display
export const formatProfileForDisplay = (profile, userAddress) => {
  if (!profile) {
    return getDefaultProfile(userAddress);
  }

  return {
    ...getDefaultProfile(userAddress),
    ...profile,
    displayName:
      profile.displayName ||
      profile.username ||
      `User ${userAddress?.slice(2, 8)}`,
  };
};

// Helper function to get display name (username or formatted address)
export const getDisplayName = (profile, userAddress) => {
  if (profile?.username) return profile.username;
  if (profile?.displayName) return profile.displayName;
  return `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`;
};
