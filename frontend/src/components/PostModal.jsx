import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from '../hooks/useContracts';

const PostModal = ({ post, isOpen, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const { account, formatAddress, isConnected } = useWeb3();
  const { likePost, unlikePost, tipPost, hasUserLiked } = useContracts();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes || 0);
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [showTipInput, setShowTipInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (post && account && isConnected) {
      checkLikeStatus();
    }
  }, [post, account, isConnected]);

  const checkLikeStatus = async () => {
    if (!post || !account) return;
    try {
      const liked = await hasUserLiked(post.id, account);
      setIsLiked(liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!isConnected || !post) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikes(prev => prev - 1);
        setIsLiked(false);
      } else {
        await likePost(post.id);
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTip = async () => {
    if (!isConnected || !post || !tipAmount) return;
    
    setIsLoading(true);
    try {
      await tipPost(post.id, post.author, tipAmount);
      alert(`Successfully tipped ${tipAmount} ETH!`);
      setTipAmount('');
      setShowTipInput(false);
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    } finally {
      setIsLoading(false);
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Modal content */}
      <div className="max-w-6xl w-full max-h-[90vh] bg-black rounded-2xl overflow-hidden flex">
        {/* Image section */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <img
            src={post.imageUrl}
            alt="Post"
            className="max-w-full max-h-full object-contain"
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
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-gray-900 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {post.author?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{formatAddress(post.author)}</p>
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
                  <span className="font-semibold mr-2">{formatAddress(post.author)}</span>
                  {post.caption}
                </p>
              </div>
            )}

            {/* Comments would go here */}
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Comments coming soon...</p>
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
                {likes} likes • {post.tips?.toFixed(3) || '0.000'} ETH in tips
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
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
              {comment.trim() && (
                <button className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors">
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;