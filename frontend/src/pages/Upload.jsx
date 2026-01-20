import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from '../hooks/useContracts';
import { uploadToPinata, unpinFile, getIPFSUrl } from '../config/pinata';
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

  const [validationStatus, setValidationStatus] = useState('idle'); // idle, validating, safe, unsafe, error
  const [pinataResult, setPinataResult] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValidationStatus('validating');
      setPinataResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Start background scanning
      try {
        console.log('Background: Uploading to IPFS...');
        const result = await uploadToPinata(file, ''); // Temporary caption
        
        if (result.success) {
          setPinataResult(result);
          console.log('Background: Validating content safety...');
          const imageUrl = getIPFSUrl(result.imageHash);
          
          const jigsawResponse = await fetch('https://api.jigsawstack.com/v1/validate/nsfw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': "sk_d58e9a57ce1b9fb2402c2c43abb638508ac808a1880d1111902476a6d00de65dde60fa3d112b27aa07b643df508f134b2f7f206d0ef0e08058f7e8f6e7e5c81f024wxvGiz4lUsH5wE9uuG"
            },
            body: JSON.stringify({ url: imageUrl })
          });

          const validation = await jigsawResponse.json();
          console.log('Background: NSFW Result:', validation);

          if (validation.nsfw) {
            setValidationStatus('unsafe');
            // Cleanup immediately
            await unpinFile(result.imageHash);
            await unpinFile(result.ipfsHash);
          } else {
            setValidationStatus('safe');
          }
        } else {
          setValidationStatus('error');
        }
      } catch (err) {
        console.error('Background validation error:', err);
        setValidationStatus('error');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !caption.trim()) {
      setErrorMessage('Please select a file and add a caption before posting.');
      setShowErrorModal(true);
      return;
    }

    // Check if we are still validating
    if (validationStatus === 'validating') {
      setShowLoadingModal(true);
      // Wait for validation to finish (simple poll or we could use a promise ref)
      while (validationStatus === 'validating') {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (validationStatus === 'unsafe') {
      setErrorMessage('NSFW content detected. This content violates our community guidelines and cannot be posted.');
      setShowErrorModal(true);
      return;
    }

    if (validationStatus === 'error') {
      setErrorMessage('Content safety check failed. Please re-select the file and try again.');
      setShowErrorModal(true);
      return;
    }

    setIsUploading(true);
    setShowLoadingModal(true);
    
    try {
      let finalPinataResult = pinataResult;
      
      // If for some reason we don't have a result yet (e.g. background task failed but we want to retry here)
      if (!finalPinataResult) {
        console.log('Uploading to IPFS...');
        const result = await uploadToPinata(selectedFile, caption);
        if (!result.success) throw new Error(result.error);
        finalPinataResult = result;
      }

      // Create post on blockchain
      console.log('Creating post on blockchain...');
      const postResult = await createPost(finalPinataResult.ipfsHash);
      
      // Save post settings to Firebase
      try {
        const postId = postResult.postId;
        
        if (postId) {
          await savePostSettings(postId, account, {
            allowComments,
            showLikeCount
          });
        }
      } catch (settingsError) {
        console.error('Failed to save post settings:', settingsError);
      }
      
      setShowLoadingModal(false);
      setShowSuccessModal(true);
      
      // Reset form
      setSelectedFile(null);
      setCaption('');
      setPreviewUrl(null);
      setAllowComments(true);
      setShowLikeCount(true);
      setValidationStatus('idle');
      setPinataResult(null);

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
        <h1 className="text-4xl font-bold text-white mb-2">Create New Post</h1>
        <p className="text-white/60 text-lg">Share your content with the Socio3 community</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        {/* File Upload Area */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-4 text-white">Upload Media</label>
          {!previewUrl ? (
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-white/40 transition-all duration-300 hover:bg-white/5">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xl text-white mb-2">Drop your files here</p>
                <p className="text-white/60 mb-4">or click to browse</p>
                <p className="text-sm text-white/40">Supports PNG, JPG, GIF, MP4 up to 10MB</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
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
                    setValidationStatus('idle');
                    setPinataResult(null);
                  }}
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Validation Status Indicator */}
              <div className={`p-4 rounded-xl border flex items-center space-x-3 transition-all duration-300 ${
                validationStatus === 'validating' ? 'bg-white/5 border-white/20 text-white/60' :
                validationStatus === 'safe' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                validationStatus === 'unsafe' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                validationStatus === 'error' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                'hidden'
              }`}>
                {validationStatus === 'validating' && (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                )}
                {validationStatus === 'safe' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {(validationStatus === 'unsafe' || validationStatus === 'error') && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <span className="text-sm font-medium">
                  {validationStatus === 'validating' && "Scanning for inappropriate content..."}
                  {validationStatus === 'safe' && "Content safety verified"}
                  {validationStatus === 'unsafe' && "NSFW content detected. This file cannot be posted."}
                  {validationStatus === 'error' && "Safety check failed. Please re-select the file."}
                </span>
              </div>
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 resize-none transition-all duration-200"
              rows={4}
              maxLength={500}
            />
            <div className="absolute bottom-4 right-6 text-sm text-white/60">
              {caption.length}/500
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mb-8">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-white font-medium mb-4 hover:text-white/80 transition-colors">
              <span>Advanced Options</span>
              <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="space-y-6 pl-4 border-l-2 border-white/20">
              {/* Allow Comments Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium">Allow comments</span>
                  <span className="text-sm text-white/60">Let people comment on your post</span>
                </div>
                <button
                  onClick={() => setAllowComments(!allowComments)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                    allowComments 
                      ? 'bg-white hover:bg-white/80' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className={`w-5 h-5 ${allowComments ? 'bg-black' : 'bg-white'} rounded-full absolute top-0.5 transition-all duration-300 ${
                    allowComments ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
              
              {/* Show Like Count Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium">Show like count</span>
                  <span className="text-sm text-white/60">Display the number of likes publicly</span>
                </div>
                <button
                  onClick={() => setShowLikeCount(!showLikeCount)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                    showLikeCount 
                      ? 'bg-white hover:bg-white/80' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className={`w-5 h-5 ${showLikeCount ? 'bg-black' : 'bg-white'} rounded-full absolute top-0.5 transition-all duration-300 ${
                    showLikeCount ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
              
              {/* Settings Preview */}
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-medium text-white/80 mb-2">Post Settings Preview:</h4>
                <div className="space-y-1 text-xs text-white/60">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${allowComments ? 'bg-white' : 'bg-white/40'}`}></div>
                    <span>Comments: {allowComments ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${showLikeCount ? 'bg-white' : 'bg-white/40'}`}></div>
                    <span>Like count: {showLikeCount ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>



        {/* Post Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || !caption.trim() || isUploading}
          className="w-full bg-white hover:bg-white/80 text-black py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-colors"
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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