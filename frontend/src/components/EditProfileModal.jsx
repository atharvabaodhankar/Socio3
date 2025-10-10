import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { uploadToPinata, getIPFSUrl } from '../config/pinata';
import { 
  saveUserProfile, 
  getUserProfile,
  isUsernameAvailable 
} from '../services/profileService';

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
    coverImage: ''
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  // Load existing profile data when modal opens
  useEffect(() => {
    if (isOpen && account) {
      loadProfile();
    }
  }, [isOpen, account]);

  const loadProfile = async () => {
    if (!provider || !account) return;
    
    try {
      setLoading(true);
      const profile = await getUserProfile(provider, account);
      if (profile && profile.exists) {
        setProfileData(profile);
        if (profile.profileImage) {
          setProfileImagePreview(getIPFSUrl(profile.profileImage));
        }
        if (profile.coverImage) {
          setCoverImagePreview(getIPFSUrl(profile.coverImage));
        }
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
      const result = await uploadToPinata(file);
      if (result.success) {
        return result.ipfsHash;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!account || !signer) return;

    // Validate username
    if (profileData.username && (profileData.username.length < 3 || profileData.username.length > 20)) {
      alert('Username must be between 3 and 20 characters');
      return;
    }

    if (profileData.username && usernameAvailable === false) {
      alert('Username is not available');
      return;
    }

    try {
      setUploading(true);
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
      const savedProfile = await saveUserProfile(signer, updatedProfile);

      // Notify parent component
      onProfileUpdate && onProfileUpdate(savedProfile);
      
      const message = profileData.exists 
        ? 'Profile updated successfully on blockchain!' 
        : 'Profile created successfully on blockchain! Welcome to Web3!';
      alert(message);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setUploading(false);
    }
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
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {profileData.exists ? 'Edit Profile' : 'Setup Your Profile'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-lg font-medium mb-4 text-white">Cover Image</label>
              <div className="relative h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl overflow-hidden">
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
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
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
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                </div>
                <div>
                  <p className="text-white font-medium">{formatAddress(account)}</p>
                  <p className="text-gray-400 text-sm">Click the + button to change your profile picture</p>
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
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all"
                  maxLength={20}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {profileData.username.length >= 3 && (
                <div className="mt-1 text-sm">
                  {checkingUsername ? (
                    <span className="text-gray-400">Checking availability...</span>
                  ) : usernameAvailable === true ? (
                    <span className="text-green-400">✓ Username available</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-red-400">✗ Username not available</span>
                  ) : null}
                </div>
              )}
              <p className="text-gray-400 text-sm mt-1">3-20 characters, letters, numbers, and underscores only</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Display Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all"
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
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 resize-none transition-all"
                rows={4}
                maxLength={200}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {profileData.bio.length}/200
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
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white">Twitter</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  value={profileData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="username"
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      </div>
    </div>
  );
};

export default EditProfileModal;