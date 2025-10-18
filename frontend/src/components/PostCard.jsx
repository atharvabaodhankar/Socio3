import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSocialInteractions } from '../hooks/useSocialInteractions';
import { useUsernames } from '../hooks/useUsernames';
import { useContracts } from '../hooks/useContracts';

const PostCard = ({ post, onLike, onTip, onComment, onClick }) => {
  const { account, formatAddress, isConnected } = useWeb3();
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
  
  // Get usernames for post author and commenters
  const userAddresses = [post?.author, ...comments.map(c => c.userAddress)].filter(Boolean);
  const { getDisplayName } = useUsernames(userAddresses);
  
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!isConnected || socialLoading) return;
    
    try {
      // Show animation only when liking (not unliking)
      if (!isLiked) {
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
      }
      
      await toggleLike();
      onLike && onLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !isConnected) return;
    
    try {
      await postComment(comment);
      setComment('');
      onComment && onComment(post.id, comment);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleTip = async () => {
    if (!isConnected || !post || !tipAmount) return;
    
    setIsLoading(true);
    try {
      await tipPost(post.id, post.author, tipAmount);
      alert(`Successfully tipped ${tipAmount} ETH to ${getDisplayName(post.author)}!`);
      setTipAmount('');
      setShowTipModal(false);
      onTip && onTip(post.id, tipAmount);
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover mb-8">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {post.author?.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white">{getDisplayName(post.author)}</p>
            <p className="text-xs text-gray-400">
              {post.timestamp instanceof Date 
                ? post.timestamp.toLocaleDateString() 
                : post.timestamp
              }
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Post Image */}
      <div 
        className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer"
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isLiked) handleLike();
        }}
        onClick={onClick}
      >
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Instagram-like heart animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`transition-all duration-500 ease-out ${
            showLikeAnimation 
              ? 'scale-125 opacity-100' 
              : 'scale-0 opacity-0'
          }`}>
            <svg className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <svg className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
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
            onClick={() => setShowTipModal(true)}
            disabled={!isConnected}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            💰 Tip
          </button>
        </div>

        {/* Like count and tips */}
        <div className="mb-3">
          <p className="font-semibold text-white text-sm">
            {likes} likes • {post.tips || '0'} ETH in tips
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-3">
            <p className="text-white">
              <span className="font-semibold mr-2">{getDisplayName(post.author)}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* View comments */}
        {commentsCount > 0 && (
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-gray-400 text-sm mb-3 hover:text-white transition-colors"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="space-y-2 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-white">
                  <span className="font-semibold mr-2">{getDisplayName(comment.userAddress)}</span>
                  {comment.text}
                </p>
              </div>
            ))}
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
          />
          {comment.trim() && (
            <button 
              onClick={handleComment}
              className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors"
            >
              Post
            </button>
          )}
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tip Creator</h3>
              <button 
                onClick={() => setShowTipModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {post.author?.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{getDisplayName(post.author)}</p>
                <p className="text-sm text-gray-400">Send a tip to support this creator</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tip Amount (ETH)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.001"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="flex-1 bg-gray-800 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400 font-medium">ETH</span>
              </div>
              <div className="flex space-x-2 mt-2">
                {['0.001', '0.01', '0.1'].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={!tipAmount || isLoading}
                className="flex-1 btn-primary px-4 py-3 rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : `Send ${tipAmount || '0'} ETH`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;