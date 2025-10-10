import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const PostCard = ({ post, onLike, onTip, onComment }) => {
  const { account, formatAddress } = useWeb3();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike && onLike(post.id);
  };

  const handleComment = () => {
    if (comment.trim()) {
      onComment && onComment(post.id, comment);
      setComment('');
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
            <p className="font-semibold text-white">{formatAddress(post.author)}</p>
            <p className="text-xs text-gray-400">{post.timestamp}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Post Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900">
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
        
        {/* Double tap to like overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-6xl transition-all duration-300 ${isLiked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            ❤️
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
            onClick={() => onTip && onTip(post.id)}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-medium"
          >
            💰 Tip
          </button>
        </div>

        {/* Like count and tips */}
        <div className="mb-3">
          <p className="font-semibold text-white text-sm">
            {post.likes || 0} likes • {post.tips || '0'} ETH in tips
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-3">
            <p className="text-white">
              <span className="font-semibold mr-2">{formatAddress(post.author)}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* View comments */}
        {post.commentCount > 0 && (
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-gray-400 text-sm mb-3 hover:text-white transition-colors"
          >
            View all {post.commentCount} comments
          </button>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="space-y-2 mb-4">
            {post.comments?.map((comment, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-white">
                  <span className="font-semibold mr-2">{formatAddress(comment.author)}</span>
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
    </div>
  );
};

export default PostCard;