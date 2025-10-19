import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from '../hooks/useContracts';
import { useSocialInteractions } from '../hooks/useSocialInteractions';
import { useUsernames } from '../hooks/useUsernames';
import { saveTipMessage } from '../services/tipService';
import { getUserProfile, getDisplayName } from '../services/profileService';
import LoadingModal from './LoadingModal';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';

const PostModal = ({ post, isOpen, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const navigate = useNavigate();
  const { account, formatAddress, isConnected, provider } = useWeb3();
  const { tipPost } = useContracts();
  const { 
    isLiked, 
    likes, 
    comments, 
    commentsCount, 
    loading: socialLoading, 
    toggleLike, 
    postComment 
  } = useSocialInteractions(post?.id);
  
  // Get usernames for all users in comments + post author
  const userAddresses = useMemo(() => {
    if (!post) return [];
    return [
      post.author,
      ...comments.map(comment => comment.userAddress)
    ].filter(Boolean);
  }, [post?.author, comments]);
  
  const { getDisplayName } = useUsernames(userAddresses);
  
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [showTipInput, setShowTipInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLike = async () => {
    if (!isConnected || !post || socialLoading) return;
    
    try {
      await toggleLike();
    } catch (error) {
      console.error('Error toggling like:', error);
      setErrorMessage('Failed to update like. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !isConnected || !post) return;
    
    try {
      await postComment(comment);
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setErrorMessage('Failed to post comment. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleTip = async () => {
    if (!isConnected || !post || !tipAmount) return;
    
    setIsLoading(true);
    setShowLoadingModal(true);
    try {
      // Send tip via smart contract
      const tx = await tipPost(post.id, post.author, tipAmount);
      
      // Save tip notification to Firebase
      try {
        // Get sender's profile info
        let senderName = account;
        try {
          const senderProfile = await getUserProfile(provider, account);
          if (senderProfile && senderProfile.exists) {
            senderName = getDisplayName(senderProfile, account);
          }
        } catch (profileError) {
          // Use address as fallback
        }

        // Get recipient's profile info
        let recipientName = getDisplayName(post.author);
        try {
          const recipientProfile = await getUserProfile(provider, post.author);
          if (recipientProfile && recipientProfile.exists) {
            recipientName = getDisplayName(recipientProfile, post.author);
          }
        } catch (profileError) {
          // Use address as fallback
        }

        const tipData = {
          fromAddress: account,
          toAddress: post.author,
          amount: tipAmount,
          message: post.caption ? `${post.caption.slice(0, 100)}${post.caption.length > 100 ? '...' : ''}` : 'Loved your post! 💖',
          transactionHash: tx.hash || tx.transactionHash || 'unknown',
          fromName: senderName,
          toName: recipientName,
          postId: post.id
        };
        
        await saveTipMessage(tipData);
      } catch (firebaseError) {
        console.error('Error saving post tip notification:', firebaseError);
        // Don't fail the tip if Firebase fails
      }
      
      setShowLoadingModal(false);
      setModalMessage(`Successfully tipped ${tipAmount} ETH to ${getDisplayName(post.author)}!`);
      setShowSuccessModal(true);
      setTipAmount('');
      setShowTipInput(false);
    } catch (error) {
      console.error('Error sending tip:', error);
      setShowLoadingModal(false);
      setErrorMessage('Failed to send tip. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setModalMessage('');
    setErrorMessage('');
  };

  const handleProfileClick = (userAddress, e) => {
    e?.stopPropagation();
    if (userAddress) {
      onClose(); // Close the modal first
      navigate(`/profile/${userAddress}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && hasPrev) {
      onPrev();
    } else if (e.key === 'ArrowRight' && hasNext) {
      onNext();
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasNext) {
      onNext();
    }
    if (isRightSwipe && hasPrev) {
      onPrev();
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
  }, [isOpen, hasNext, hasPrev]);

  if (!isOpen || !post) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center lg:bg-black/90 lg:backdrop-blur-sm lg:p-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile progress indicator */}
      <div className="absolute top-4 left-4 right-16 z-20 lg:hidden">
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, (hasNext || hasPrev) ? 3 : 1) }).map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ 
                  width: index === 0 ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows - Better positioned for mobile */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Modal content */}
      <div className="w-full h-full flex flex-col lg:flex-row lg:max-w-6xl lg:max-h-[90vh] lg:bg-black lg:rounded-2xl overflow-hidden">
        {/* Mobile: Full screen image with overlay */}
        <div className="relative flex-1 flex items-center justify-center bg-black lg:bg-transparent">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-full object-contain lg:max-w-full lg:max-h-full"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-full h-full items-center justify-center">
            <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Mobile overlay with post info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 lg:hidden">
            {/* Author info */}
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => handleProfileClick(post.author, e)}
              >
                <span className="text-white font-semibold text-sm">
                  {getDisplayName(post.author)?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p 
                  className="font-semibold text-white cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={(e) => handleProfileClick(post.author, e)}
                >
                  {getDisplayName(post.author)}
                </p>
                <p className="text-xs text-gray-300">
                  {post.timestamp instanceof Date 
                    ? post.timestamp.toLocaleDateString() 
                    : post.timestamp
                  }
                </p>
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <p className="text-white mb-4">
                <span 
                  className="font-semibold mr-2 cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={(e) => handleProfileClick(post.author, e)}
                >
                  {getDisplayName(post.author)}
                </span>
                {post.caption}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLike}
                  disabled={!isConnected || socialLoading}
                  className="flex items-center space-x-2 disabled:opacity-50"
                >
                  <svg className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-white font-medium">{likes}</span>
                </button>
                
                <button className="text-white">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                
                <button className="text-white">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
              
              <button 
                onClick={() => setShowTipInput(!showTipInput)}
                disabled={!isConnected}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full text-white font-medium disabled:opacity-50 transition-colors"
              >
                💰 {post.tips?.toFixed(3) || '0.000'} ETH
              </button>
            </div>

            {/* Tip input for mobile */}
            {showTipInput && (
              <div className="mt-4 p-3 bg-black/60 backdrop-blur-sm rounded-xl">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.001"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="flex-1 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-300 text-sm">ETH</span>
                  <button
                    onClick={handleTip}
                    disabled={!tipAmount || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-96 bg-gray-900 flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={(e) => handleProfileClick(post.author, e)}
            >
              <span className="text-white font-semibold text-sm">
                {post.author?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p 
                className="font-semibold text-white cursor-pointer hover:text-purple-300 transition-colors"
                onClick={(e) => handleProfileClick(post.author, e)}
              >
                {getDisplayName(post.author)}
              </p>
              <p className="text-xs text-gray-400">
                {post.timestamp instanceof Date 
                  ? post.timestamp.toLocaleDateString() 
                  : post.timestamp
                }
              </p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* Comments section */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Original post caption */}
            {post.caption && (
              <div className="mb-4">
                <p className="text-white">
                  <span 
                    className="font-semibold mr-2 cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={(e) => handleProfileClick(post.author, e)}
                  >
                    {getDisplayName(post.author)}
                  </span>
                  {post.caption}
                </p>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div 
                      className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      onClick={(e) => handleProfileClick(comment.userAddress, e)}
                    >
                      <span className="text-white font-semibold text-xs">
                        {comment.userAddress?.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span 
                          className="font-semibold mr-2 cursor-pointer hover:text-purple-300 transition-colors"
                          onClick={(e) => handleProfileClick(comment.userAddress, e)}
                        >
                          {getDisplayName(comment.userAddress)}
                        </span>
                        {comment.text}
                      </p>
                      {comment.timestamp && (
                        <p className="text-gray-400 text-xs mt-1">
                          {comment.timestamp.toDate ? comment.timestamp.toDate().toLocaleDateString() : 'Just now'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-700">
            {/* Action buttons */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  disabled={!isConnected || isLoading}
                  className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <svg className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
              <button 
                onClick={() => setShowTipInput(!showTipInput)}
                disabled={!isConnected}
                className="btn-primary px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                💰 Tip
              </button>
            </div>

            {/* Like count and tips */}
            <div className="mb-3">
              <p className="font-semibold text-white text-sm">
                {likes} likes • {commentsCount} comments • {post.tips?.toFixed(3) || '0.000'} ETH in tips
              </p>
            </div>

            {/* Tip input */}
            {showTipInput && (
              <div className="mb-3 p-3 bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.001"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-400 text-sm">ETH</span>
                  <button
                    onClick={handleTip}
                    disabled={!tipAmount || isLoading}
                    className="btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {isLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}

            {/* Add comment */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                disabled={!isConnected}
              />
              {comment.trim() && (
                <button 
                  onClick={handleComment}
                  disabled={!isConnected}
                  className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={showLoadingModal}
        title="Sending Tip"
        message="Your tip is being processed on the blockchain..."
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Tip Sent!"
        message={modalMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title="Action Failed"
        message={errorMessage}
        onRetry={() => {
          handleModalClose();
          // Could add retry logic here if needed
        }}
      />
    </div>
  );
};

export default PostModal;