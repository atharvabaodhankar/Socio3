import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { 
  getTipMessagesForUser, 
  markTipAsRead, 
  getUnreadTipCount 
} from '../services/tipService';
import { getUserByAddress } from '../services/userMappingService';
import { getUserProfile, getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';
import { navigateToPost } from '../utils/postNavigation';

const TipNotifications = ({ isOpen, onClose }) => {
  const { account, formatAddress, provider } = useWeb3();
  const navigate = useNavigate();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [senderProfiles, setSenderProfiles] = useState({});

  useEffect(() => {
    if (isOpen && account) {
      loadTips();
      loadUnreadCount();
    }
  }, [isOpen, account]);

  const loadTips = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const tipMessages = await getTipMessagesForUser(account);
      setTips(tipMessages);
      
      // Load sender profiles
      await loadSenderProfiles(tipMessages);
    } catch (error) {
      console.error('Error loading tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSenderProfiles = async (tipMessages) => {
    const profiles = {};
    
    for (const tip of tipMessages) {
      if (!profiles[tip.fromAddress]) {
        try {
          // First try Firebase
          let profile = await getUserByAddress(tip.fromAddress);
          
          // If not in Firebase, try blockchain
          if (!profile && provider) {
            const blockchainProfile = await getUserProfile(provider, tip.fromAddress);
            if (blockchainProfile && blockchainProfile.exists) {
              profile = blockchainProfile;
            }
          }
          
          profiles[tip.fromAddress] = profile;
        } catch (error) {
          console.error('Error loading profile for', tip.fromAddress, error);
          profiles[tip.fromAddress] = null;
        }
      }
    }
    
    setSenderProfiles(profiles);
  };

  const loadUnreadCount = async () => {
    if (!account) return;
    
    try {
      console.log('Loading unread count for account:', account);
      const count = await getUnreadTipCount(account);
      console.log('Unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (tipId) => {
    try {
      await markTipAsRead(tipId);
      setTips(tips.map(tip => 
        tip.id === tipId ? { ...tip, read: true } : tip
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking tip as read:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-[999]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div 
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">Tip Messages</h2>
              {unreadCount > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading tip messages...</p>
              </div>
            ) : tips.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Tips Yet</h3>
                <p className="text-gray-400">Tip messages from your supporters will appear here.</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {tips.map((tip) => {
                  const senderProfile = senderProfiles[tip.fromAddress];
                  const displayName = senderProfile 
                    ? getDisplayName(senderProfile, tip.fromAddress)
                    : formatAddress(tip.fromAddress);
                  
                  return (
                    <div 
                      key={tip.id}
                      className={`p-4 rounded-xl border transition-all ${
                        tip.read 
                          ? 'bg-gray-800/50 border-gray-700' 
                          : 'bg-purple-500/10 border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {/* Profile Picture */}
                          <div 
                            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all"
                            onClick={() => {
                              onClose();
                              navigate(`/profile/${tip.fromAddress}`);
                            }}
                          >
                            {senderProfile?.profileImage ? (
                              <img
                                src={getIPFSUrl(senderProfile.profileImage)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {displayName.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            {/* Clickable Username/Display Name */}
                            <button
                              onClick={() => {
                                onClose();
                                navigate(`/profile/${tip.fromAddress}`);
                              }}
                              className="text-white font-medium hover:text-purple-300 transition-colors text-left"
                            >
                              {displayName}
                            </button>
                            
                            {/* Show username if display name is different */}
                            {senderProfile?.username && senderProfile.username !== displayName && (
                              <p className="text-gray-500 text-xs">
                                @{senderProfile.username}
                              </p>
                            )}
                            
                            <p className="text-gray-400 text-sm">
                              {formatTimestamp(tip.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">
                            +{tip.amount} ETH
                          </p>
                          {tip.tipType === 'post' && (
                            <p className="text-xs text-purple-400">
                              Post tip
                            </p>
                          )}
                          {!tip.read && (
                            <button
                              onClick={() => handleMarkAsRead(tip.id)}
                              className="text-xs text-purple-400 hover:text-purple-300 mt-1"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {tip.message && (
                        <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                          <p className="text-gray-300 text-sm italic">
                            "{tip.message}"
                          </p>
                          {tip.tipType === 'post' && tip.postId && (
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-xs text-purple-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Post tip</span>
                              </div>
                              <button
                                onClick={() => {
                                  onClose();
                                  navigateToPost(navigate, tip.postId, tip.toAddress);
                                }}
                                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 text-xs rounded-lg transition-colors"
                              >
                                View Post
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/profile/${tip.fromAddress}`);
                          }}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Profile
                        </button>
                        {tip.transactionHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tip.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TipNotifications;