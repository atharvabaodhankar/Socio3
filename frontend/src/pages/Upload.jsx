import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { uploadToPinata } from '../config/pinata';

const Upload = () => {
  const { isConnected, account } = useWeb3();
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      alert('Please select a file and add a caption');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload to IPFS via Pinata
      const result = await uploadToPinata(selectedFile);
      
      if (result.success) {
        console.log('File uploaded to IPFS:', result.ipfsHash);
        
        // Here you would interact with the smart contract
        // to create the post on-chain
        
        alert('Post uploaded successfully!');
        
        // Reset form
        setSelectedFile(null);
        setCaption('');
        setPreviewUrl(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload post. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-gray-400">Share your content with the Socio3 community</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload Image or Video</label>
          {!previewUrl ? (
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-violet-500 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF, MP4 up to 10MB</p>
              </label>
            </div>
          ) : (
            <div className="relative">
              {selectedFile?.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-96 rounded-lg"
                />
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your post..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none"
            rows={4}
          />
          <div className="text-right text-sm text-gray-400 mt-1">
            {caption.length}/500
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || !caption.trim() || isUploading}
          className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-all duration-200"
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading to IPFS...</span>
            </div>
          ) : (
            'Share Post'
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;