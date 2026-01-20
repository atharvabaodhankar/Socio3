import { ethers } from "ethers";
import { uploadToPinata, getIPFSUrl, fetchFromIPFS } from "../config/pinata";
import { CONTRACT_ADDRESSES, PROFILE_CONTRACT_ABI } from "../config/contracts";

// Save user profile to blockchain + IPFS
export const saveUserProfile = async (signer, profileData) => {
  try {
    console.log("=== SAVE USER PROFILE CALLED ===");
    console.log("Saving profile to blockchain...", profileData);
    console.log("Stack trace:", new Error().stack);

    // Upload profile data to IPFS
    const profileBlob = new Blob([JSON.stringify(profileData)], {
      type: "application/json",
    });
    const profileFile = new File([profileBlob], "profile.json", {
      type: "application/json",
    });

    console.log("Uploading profile data to IPFS...");
    
    // Upload profile JSON directly to IPFS (NOT using the post upload function)
    const formData = new FormData();
    formData.append('file', profileFile);

    const metadata = JSON.stringify({
      name: `socio3-profile-${Date.now()}`,
      keyvalues: {
        app: 'socio3',
        type: 'profile',
        address: profileData.userAddress || '',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const { PINATA_CONFIG } = await import("../config/pinata");
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_CONFIG.apiKey,
        'pinata_secret_api_key': PINATA_CONFIG.apiSecret
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.status}`);
    }

    const uploadResult = await response.json();
    console.log("Profile data uploaded to IPFS:", uploadResult.IpfsHash);

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
    let receipt;
    const ipfsHash = uploadResult.IpfsHash;
    
    if (hasProfile) {
      // Update existing profile
      console.log("Updating existing profile with IPFS hash:", ipfsHash);
      tx = await contract.updateProfile(ipfsHash);
      console.log("Profile update transaction sent:", tx.hash);
      receipt = await tx.wait();
      console.log("Profile update transaction confirmed:", receipt);
      console.log("Transaction status:", receipt.status); // 1 = success, 0 = failed
      
      if (receipt.status === 0) {
        throw new Error("Transaction failed - profile was not updated");
      }
      
      // Verify the update by reading back from blockchain
      const [newIpfsHash] = await contract.getProfile(userAddress);
      console.log("Verified IPFS hash on blockchain:", newIpfsHash);
      
      if (newIpfsHash !== ipfsHash) {
        console.error("MISMATCH! Expected:", ipfsHash, "Got:", newIpfsHash);
        throw new Error("Profile update verification failed - IPFS hash mismatch");
      }
      
      // Check if username needs to be updated
      if (profileData.username) {
        try {
          const currentUsername = await contract.getUsername(userAddress);
          console.log("Current username:", currentUsername);
          console.log("New username:", profileData.username);
          
          if (currentUsername !== profileData.username) {
            console.log("Updating username...");
            const usernameTx = await contract.updateUsername(profileData.username);
            console.log("Username update transaction:", usernameTx.hash);
            const usernameReceipt = await usernameTx.wait();
            console.log("Username updated successfully, status:", usernameReceipt.status);
          } else {
            console.log("Username unchanged, skipping update");
          }
        } catch (usernameError) {
          console.error("Error updating username:", usernameError);
          // Don't fail the whole operation if username update fails
        }
      }
    } else {
      // Create new profile
      console.log("Creating new profile with IPFS hash:", ipfsHash);
      const username = profileData.username || "";
      tx = await contract.createProfile(ipfsHash, username);
      console.log("Profile creation transaction sent:", tx.hash);
      receipt = await tx.wait();
      console.log("Profile creation transaction confirmed:", receipt);
      console.log("Transaction status:", receipt.status);
      
      if (receipt.status === 0) {
        throw new Error("Transaction failed - profile was not created");
      }
    }

    console.log("✅ Profile save completed successfully!");

    return {
      ...profileData,
      ipfsHash: ipfsHash,
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
    console.log('[getUserProfile] Fetching profile for:', userAddress);
    
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

    console.log('[getUserProfile] Blockchain data:', { ipfsHash, timestamp: Number(timestamp), exists });

    if (!exists || !ipfsHash) {
      console.log('[getUserProfile] Profile does not exist, returning default');
      return getDefaultProfile(userAddress);
    }

    // Fetch profile data from IPFS with timeout and fallback
    const ipfsUrl = getIPFSUrl(ipfsHash);
    const cacheBustedUrl = `${ipfsUrl}?t=${Date.now()}`;
    console.log('[getUserProfile] Fetching from IPFS:', cacheBustedUrl);
    
    try {
      // Add timeout to IPFS fetch with authentication
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetchFromIPFS(ipfsHash);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[getUserProfile] IPFS fetch failed:', response.status, response.statusText);
        throw new Error(`IPFS fetch failed: ${response.status}`);
      }

      const profileData = await response.json();
      console.log('[getUserProfile] Profile data from IPFS:', profileData);

      const finalProfile = {
        ...profileData,
        userAddress: userAddress.toLowerCase(),
        ipfsHash,
        timestamp: Number(timestamp),
        exists,
      };
      
      console.log('[getUserProfile] Final profile:', finalProfile);
      return finalProfile;
    } catch (fetchError) {
      console.error('[getUserProfile] IPFS fetch error:', fetchError.message);
      
      // If IPFS fails, return profile with blockchain data only
      console.log('[getUserProfile] Falling back to blockchain data only');
      return {
        userAddress: userAddress.toLowerCase(),
        username: '', // Will be fetched separately
        displayName: '',
        bio: '',
        website: '',
        twitter: '',
        instagram: '',
        profileImage: '',
        coverImage: '',
        ipfsHash,
        timestamp: Number(timestamp),
        exists,
      };
    }
  } catch (error) {
    console.error("[getUserProfile] Error getting profile:", error);
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
