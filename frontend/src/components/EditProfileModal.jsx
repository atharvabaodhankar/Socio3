import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getIPFSUrl } from '../config/pinata';
import { 
  saveUserProfile, 
  getUserProfile,
  isUsernameAvailable 
} from '../services/profileService';
import { createUserMapping } from '../services/userMappingService';
import { requestTestETHAdmin } from '../services/faucetService';
import { markUserAsWelcomed } from '../services/firebaseService';
import { checkUserNeedsETH } from '../services/faucetService';
import LoadingModal from './LoadingModal';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';

const EditProfileModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const { account, formatAddress, provider, signer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    displayName: '',
    bio: '',
    website: '',
    twitter: '',
    profileImage: '',
    coverImage: '',
    userAddress: ''
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [needsETH, setNeedsETH] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [gettingETH, setGettingETH] = useState(false);

  // Load existing profile data when modal opens
  useEffect(() => {
    if (isOpen && account) {
      loadProfile();
      checkETHBalance();
    }
  }, [isOpen, account]);

  const checkETHBalance = async () => {
    if (!provider || !account) return;
    
    try {
      setCheckingBalance(true);
      const needsETH = await checkUserNeedsETH(provider, account);
      setNeedsETH(needsETH);
    } catch (error) {
      console.error('Error checking ETH balance:', error);
      setNeedsETH(false);
    } finally {
      setCheckingBalance(false);
    }
  };

  const loadProfile = async () => {
    if (!provider || !account) return;
    
    try {
      setLoading(true);
      
      // Load profile data from IPFS
      const profile = await getUserProfile(provider, account);
      
      // IMPORTANT: Also load username directly from blockchain
      // because the IPFS data might be corrupted or contain post data
      const { getUsername } = await import('../services/profileService');
      const blockchainUsername = await getUsername(provider, account);
      
      console.log('[EditProfileModal] Profile from IPFS:', profile);
      console.log('[EditProfileModal] Username from blockchain:', blockchainUsername);
      
      if (profile && profile.exists) {
        // Merge with default values, prioritizing blockchain username
        setProfileData({
          username: blockchainUsername || profile.username || '',
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          website: profile.website || '',
          twitter: profile.twitter || '',
          profileImage: profile.profileImage || '',
          coverImage: profile.coverImage || '',
          userAddress: profile.userAddress || account,
          exists: profile.exists
        });
        if (profile.profileImage) {
          setProfileImagePreview(getIPFSUrl(profile.profileImage));
        }
        if (profile.coverImage) {
          setCoverImagePreview(getIPFSUrl(profile.coverImage));
        }
      } else {
        // Profile doesn't exist yet, but check for username
        setProfileData({
          username: blockchainUsername || '',
          displayName: '',
          bio: '',
          website: '',
          twitter: '',
          profileImage: '',
          coverImage: '',
          userAddress: account,
          exists: false
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check username availability
    if (field === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    } else if (field === 'username') {
      setUsernameAvailable(null);
    }
  };

  const handleGetETH = async () => {
    if (!account) return;
    
    try {
      setGettingETH(true);
      console.log('[GetETH] Requesting ETH for new user...');
      
      const result = await requestTestETHAdmin(account);
      
      if (result.success) {
        console.log('[GetETH] ETH sent successfully:', result);
        await markUserAsWelcomed(account, result);
        setNeedsETH(false);
        setSuccessMessage(`🎉 Great! We've sent you ${result.amount} ETH. You can now create your profile!`);
        setShowSuccessModal(true);
      } else {
        console.error('[GetETH] Failed to send ETH:', result.error);
        setErrorMessage(`Failed to send ETH: ${result.error}`);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('[GetETH] Error:', error);
      setErrorMessage(`Error getting ETH: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setGettingETH(false);
    }
  };
  const checkUsernameAvailability = async (username) => {
    if (!provider || username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      const available = await isUsernameAvailable(provider, username);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleImageSelect = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      if (type === 'profile') {
        setSelectedProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
      } else {
        setSelectedCoverImage(file);
        setCoverImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadImage = async (file) => {
    try {
      // Upload image directly to IPFS (not using post upload function)
      const formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: `socio3-profile-image-${Date.now()}`,
        keyvalues: {
          app: 'socio3',
          type: 'profile-image',
          timestamp: Date.now().toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const { PINATA_CONFIG } = await import('../config/pinata');
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_CONFIG.apiKey,
          'pinata_secret_api_key': PINATA_CONFIG.apiSecret
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!account || !signer) return;

    // Validate username
    if (profileData.username && (profileData.username.length < 3 || profileData.username.length > 20)) {
      setErrorMessage('Username must be between 3 and 20 characters');
      setShowErrorModal(true);
      return;
    }

    if (profileData.username && usernameAvailable === false) {
      setErrorMessage('Username is not available. Please choose a different one.');
      setShowErrorModal(true);
      return;
    }

    const isNewProfile = !profileData.exists;

    try {
      setUploading(true);
      setShowLoadingModal(true);
      let updatedProfile = { ...profileData };

      // Upload profile image if selected
      if (selectedProfileImage) {
        const profileImageHash = await uploadImage(selectedProfileImage);
        updatedProfile.profileImage = profileImageHash;
      }

      // Upload cover image if selected
      if (selectedCoverImage) {
        const coverImageHash = await uploadImage(selectedCoverImage);
        updatedProfile.coverImage = coverImageHash;
      }

      // Save profile to blockchain + IPFS
      const result = await saveUserProfile(signer, updatedProfile);
      
      // Extract transaction hash if available
      const txHash = result.transactionHash || result.hash || '';
      setTransactionHash(txHash);

      // Create/update Firebase mapping for search
      try {
        await createUserMapping(account, result.profile || result);
        console.log('Firebase user mapping created/updated');
      } catch (firebaseError) {
        console.error('Error creating Firebase mapping:', firebaseError);
        // Don't fail the whole operation if Firebase fails
      }

      // Notify parent component
      onProfileUpdate && onProfileUpdate(result.profile || result);
      
      // Create success message
      const message = profileData.exists 
        ? 'Your profile has been updated successfully on the blockchain!' 
        : '🎉 Welcome to Socio3! Your profile has been created successfully on the blockchain!';
      
      setSuccessMessage(message);
      setShowLoadingModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setShowLoadingModal(false);
      setErrorMessage(error.message || 'Failed to save profile. Please check your connection and try again.');
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setTransactionHash('');
    setSuccessMessage('');
    
    // If this was an ETH gift, refresh balance check
    if (needsETH) {
      checkETHBalance();
    } else {
      // If this was profile creation, close the modal
      onClose();
    }
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    handleSave();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {profileData.exists ? 'Edit Profile' : 'Setup Your Profile'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading || checkingBalance ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : needsETH && !profileData.exists ? (
          /* ETH Required Step - Matching Website Theme */
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                ETH Required for Profile Creation
              </h3>
              
              <p className="text-white/60 text-sm max-w-md mx-auto">
                You need ETH to pay for blockchain transactions. We'll send you free test ETH to get started.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60 text-sm">Gift Amount</span>
                  <span className="text-white font-medium">0.005 ETH</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60 text-sm">Network</span>
                  <span className="text-white font-medium">Sepolia Testnet</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60 text-sm">Your Address</span>
                  <span className="text-white font-mono text-sm">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleGetETH}
                disabled={gettingETH}
                className="w-full px-4 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {gettingETH ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                    Sending ETH...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Get Free ETH
                  </>
                )}
              </button>
              
              <p className="text-white/40 text-xs text-center">
                Free test ETH for Sepolia testnet only
              </p>
            </div>
          </div>
        ) : (
          /* Profile Form */
          <div className="p-6 space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-lg font-medium mb-4 text-white">Cover Image</label>
              <div className="relative h-32 bg-white/10 rounded-xl overflow-hidden">
                {coverImagePreview && (
                  <img
                    src={coverImagePreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect('cover', e)}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  >
                    Change Cover
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-lg font-medium mb-4 text-white">Profile Picture</label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-black font-bold text-2xl">
                        {account?.slice(2, 4).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect('profile', e)}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white hover:bg-white/80 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                </div>
                <div>
                  <p className="text-white font-medium">{formatAddress(account)}</p>
                  <p className="text-white/60 text-sm">Click the + button to change your profile picture</p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Enter your username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                  maxLength={20}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {profileData.username && profileData.username.length >= 3 && (
                <div className="mt-1 text-sm">
                  {checkingUsername ? (
                    <span className="text-white/60">Checking availability...</span>
                  ) : usernameAvailable === true ? (
                    <span className="text-white/80">✓ Username available</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-white/60">✗ Username not available</span>
                  ) : null}
                </div>
              )}
              <p className="text-white/60 text-sm mt-1">3-20 characters, letters, numbers, and underscores only</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Display Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                maxLength={50}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 resize-none transition-all"
                rows={4}
                maxLength={200}
              />
              <div className="text-right text-sm text-white/60 mt-1">
                {(profileData.bio || '').length}/200
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Twitter</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">@</span>
                <input
                  type="text"
                  value={profileData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!needsETH || profileData.exists ? (
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-6 py-3 bg-white hover:bg-white/80 text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{profileData.exists ? 'Updating...' : 'Creating Profile...'}</span>
                </div>
              ) : (
                profileData.exists ? 'Save Changes' : 'Create Profile'
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={showLoadingModal}
        title={profileData.exists ? "Updating Your Profile" : "Creating Your Web3 Profile"}
        message={
          profileData.exists 
            ? "Your profile is being updated on the blockchain. This may take a few moments..."
            : "Your profile is being created on the blockchain. This may take a few moments..."
        }
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Profile Saved!"
        message={successMessage}
        txHash={transactionHash}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Transaction Failed"
        message={errorMessage}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default EditProfileModal;