import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from '../hooks/useContracts';
import { uploadToPinata } from '../config/pinata';
import { savePostSettings } from '../services/postSettingsService';
import LoadingModal from '../components/LoadingModal';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

const Upload = () => {
  const { isConnected, account } = useWeb3();
  const { createPost } = useContracts();
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Advanced Options State
  const [allowComments, setAllowComments] = useState(true);
  const [showLikeCount, setShowLikeCount] = useState(true);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !caption.trim()) {
      setErrorMessage('Please select a file and add a caption before posting.');
      setShowErrorModal(true);
      return;
    }

    setIsUploading(true);
    setShowLoadingModal(true);
    
    try {
      // Upload to IPFS via Pinata
      console.log('Uploading to IPFS...');
      const result = await uploadToPinata(selectedFile);
      
      if (result.success) {
        console.log('File uploaded to IPFS:', result.ipfsHash);
        
        // Create post on blockchain
        console.log('Creating post on blockchain...');
        const postResult = await createPost(result.ipfsHash);
        
        // Save post settings to Firebase
        try {
          const postId = postResult.postId;
          
          if (postId) {
            await savePostSettings(postId, account, {
              allowComments,
              showLikeCount
            });
            
            console.log(`Post settings saved successfully for post ID: ${postId}`);
          } else {
            console.warn('Could not extract post ID from transaction');
          }
        } catch (settingsError) {
          console.error('Failed to save post settings:', settingsError);
          // Don't fail the entire upload if settings save fails
        }
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        
        // Reset form
        setSelectedFile(null);
        setCaption('');
        setPreviewUrl(null);
        setAllowComments(true);
        setShowLikeCount(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setShowLoadingModal(false);
      setErrorMessage(`Failed to create post: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirect to profile to see the new post
    window.location.href = '/profile';
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    handleUpload();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to Upload</h2>
        <p className="text-gray-400">Connect your wallet to start sharing your content with the world.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">Create New Post</h1>
        <p className="text-gray-400 text-lg">Share your content with the Socio3 community</p>
      </div>

      <div className="glass rounded-2xl p-8">
        {/* File Upload Area */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-4 text-white">Upload Media</label>
          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center hover:border-purple-500 transition-all duration-300 hover:bg-white/5">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xl text-white mb-2">Drop your files here</p>
                <p className="text-gray-400 mb-4">or click to browse</p>
                <p className="text-sm text-gray-500">Supports PNG, JPG, GIF, MP4 up to 10MB</p>
              </label>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              {selectedFile?.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-96"
                />
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-4 text-white">Caption</label>
          <div className="relative">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your post... #hashtags #web3"
              className="w-full bg-white/5 border border-gray-600 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 resize-none transition-all duration-200"
              rows={4}
              maxLength={500}
            />
            <div className="absolute bottom-4 right-6 text-sm text-gray-400">
              {caption.length}/500
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mb-8">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-white font-medium mb-4 hover:text-purple-300 transition-colors">
              <span>Advanced Options</span>
              <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="space-y-6 pl-4 border-l-2 border-gray-700">
              {/* Allow Comments Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-300 font-medium">Allow comments</span>
                  <span className="text-sm text-gray-500">Let people comment on your post</span>
                </div>
                <button
                  onClick={() => setAllowComments(!allowComments)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                    allowComments 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
                    allowComments ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
              
              {/* Show Like Count Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-300 font-medium">Show like count</span>
                  <span className="text-sm text-gray-500">Display the number of likes publicly</span>
                </div>
                <button
                  onClick={() => setShowLikeCount(!showLikeCount)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                    showLikeCount 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
                    showLikeCount ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
              
              {/* Settings Preview */}
              <div className="mt-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Post Settings Preview:</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${allowComments ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Comments: {allowComments ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${showLikeCount ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Like count: {showLikeCount ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Test Settings Button (Development Only) */}
        <button
          onClick={async () => {
            try {
              const testPostId = 1; // Test with existing post
              const testSettings = {
                allowComments,
                showLikeCount
              };
              console.log('Saving test settings:', testSettings);
              await savePostSettings(testPostId, account, testSettings);
              console.log('Test settings saved for post 1:', testSettings);
              
              // Immediately try to retrieve the settings to verify
              const { getPostSettings } = await import('../services/postSettingsService');
              const retrievedSettings = await getPostSettings(testPostId, account);
              console.log('Retrieved settings immediately after save:', retrievedSettings);
              
              alert(`Test settings saved! allowComments: ${allowComments}, showLikeCount: ${showLikeCount}. Retrieved: ${JSON.stringify(retrievedSettings)}`);
            } catch (error) {
              console.error('Test failed:', error);
              alert('Test failed: ' + error.message);
            }
          }}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-xl font-medium mb-4 transition-colors"
        >
          🧪 Test Save Settings for Post 1 (Comments: {allowComments ? 'ON' : 'OFF'}, Likes: {showLikeCount ? 'ON' : 'OFF'})
        </button>

        {/* Post Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || !caption.trim() || isUploading}
          className="w-full btn-primary py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Publishing to Blockchain...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Share Post</span>
            </div>
          )}
        </button>
      </div>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={showLoadingModal}
        title="Publishing Your Post"
        message="Your content is being uploaded to IPFS and saved to the blockchain..."
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Post Published!"
        message="Your post has been successfully published to the blockchain! You'll be redirected to your profile to see it."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Upload Failed"
        message={errorMessage}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default Upload;