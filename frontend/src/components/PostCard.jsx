import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useSocialInteractions } from "../hooks/useSocialInteractions";
import { useUsernames } from "../hooks/useUsernames";
import { useContracts } from "../hooks/useContracts";
import { useSavedPosts } from "../hooks/useSavedPosts";
import { saveTipMessage } from "../services/tipService";
import { getUserProfile, getDisplayName } from "../services/profileService";
import { saveReportNotification, getReportTypeName } from "../services/reportService";

const PostCard = ({ post, onLike, onTip, onComment, onClick }) => {
  const navigate = useNavigate();
  const { account, formatAddress, isConnected, provider } = useWeb3();
  const { tipPost, reportPost } = useContracts();
  const {
    isLiked,
    likes,
    comments,
    commentsCount,
    loading: socialLoading,
    toggleLike,
    postComment,
  } = useSocialInteractions(post?.id);

  const { isSaved, loading: saveLoading, toggleSave } = useSavedPosts(post?.id);

  // Get usernames for post author and commenters - memoize to prevent infinite re-renders
  const userAddresses = useMemo(() => {
    return [post?.author, ...comments.map((c) => c.userAddress)].filter(
      Boolean
    );
  }, [post?.author, comments]);

  const { getDisplayName } = useUsernames(userAddresses);

  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLike = async () => {
    if (!isConnected || socialLoading) return;

    try {
      // Show animation only when liking (not unliking)
      if (!isLiked) {
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
      }

      await toggleLike(post);
      onLike && onLike(post.id);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !isConnected) return;

    try {
      await postComment(comment);
      setComment("");
      onComment && onComment(post.id, comment);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleTip = async () => {
    if (!isConnected || !post || !tipAmount) return;

    setIsLoading(true);
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
          message: post.caption
            ? `${post.caption.slice(0, 100)}${
                post.caption.length > 100 ? "..." : ""
              }`
            : "Loved your post! 💖",
          transactionHash: tx.hash || tx.transactionHash || "unknown",
          fromName: senderName,
          toName: recipientName,
          postId: post.id,
        };

        await saveTipMessage(tipData);
      } catch (firebaseError) {
        console.error("Error saving post tip notification:", firebaseError);
        // Don't fail the tip if Firebase fails
      }

      setSuccessMessage(
        `Successfully sent ${tipAmount} ETH to ${getDisplayName(
          post.author
        )}! 🎉`
      );
      setShowSuccessModal(true);
      setTipAmount("");
      setShowTipModal(false);
      onTip && onTip(post.id, tipAmount);
    } catch (error) {
      console.error("Error sending tip:", error);
      setErrorMessage(
        "Failed to send tip. Please check your wallet and try again."
      );
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent triggering post click
    console.log("Share button clicked!", post);

    const postUrl = `${window.location.origin}/post/${post.id}/${post.author}`;
    const shareText = post.caption
      ? `Check out this post by ${getDisplayName(
          post.author
        )}: "${post.caption.slice(0, 100)}${
          post.caption.length > 100 ? "..." : ""
        }"`
      : `Check out this post by ${getDisplayName(post.author)} on Socio3`;

    console.log("Share URL:", postUrl);
    console.log("Share text:", shareText);

    // Try native Web Share API first (mobile/modern browsers)
    if (navigator.share) {
      try {
        console.log("Using native share API");
        await navigator.share({
          title: "Socio3 Post",
          text: shareText,
          url: postUrl,
        });
        return;
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
        // Fall through to fallback options
      }
    }

    // Fallback: Copy to clipboard
    try {
      console.log("Using clipboard fallback");
      await navigator.clipboard.writeText(`${shareText}\n\n${postUrl}`);

      // Show success feedback
      setSuccessMessage("Post link copied to clipboard! 📋");
      setShowSuccessModal(true);
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError);

      // Final fallback: Show share modal with options
      console.log("Opening share modal");
      setShowShareModal(true);
    }
  };

  const handleReport = async (reportType, reason) => {
    if (!isConnected || !post) return;
    
    try {
      setIsLoading(true);
      
      // Call smart contract reportPost function
      console.log('Reporting post:', post.id, 'Type:', reportType, 'Reason:', reason);
      const tx = await reportPost(post.id, reportType, reason);
      
      // Save report to Firebase for tracking
      try {
        await saveReportNotification({
          postId: post.id,
          postAuthor: post.author,
          reporterAddress: account,
          reportType: reportType,
          reportTypeName: getReportTypeName(reportType),
          reason: reason,
          transactionHash: tx.hash || tx.transactionHash || 'unknown',
          postCaption: post.caption ? post.caption.slice(0, 100) : ''
        });
      } catch (firebaseError) {
        console.error('Error saving report to Firebase:', firebaseError);
        // Don't fail the report if Firebase fails
      }
      
      setSuccessMessage('Post reported successfully. Thank you for helping keep our community safe.');
      setShowReportModal(false);
      setShowOptionsMenu(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error reporting post:', error);
      setErrorMessage('Failed to report post. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation(); // Prevent triggering post click
    if (post?.author) {
      navigate(`/profile/${post.author}`);
    }
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && !event.target.closest('.relative')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden card-hover mb-8">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={handleProfileClick}
          >
            <span className="text-black font-semibold text-sm">
              {post.author?.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <p
              className="font-semibold text-white cursor-pointer hover:text-white/80 transition-colors"
              onClick={handleProfileClick}
            >
              {getDisplayName(post.author)}
            </p>
            <p className="text-xs text-white/60">
              {post.timestamp instanceof Date
                ? post.timestamp.toLocaleDateString()
                : post.timestamp}
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsMenu(!showOptionsMenu);
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-white/60"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Options Menu */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-2 min-w-[150px] z-10">
              {/* Debug info - remove in production */}
              <div className="px-4 py-1 text-xs text-white/40 border-b border-white/10">
                Debug: {post.author?.slice(0, 6)}...{post.author?.slice(-4)} vs {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              
              {post.author && account && post.author.toLowerCase() !== account.toLowerCase() ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReportModal(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-400">Report Post</span>
                </button>
              ) : (
                <div className="px-4 py-2 text-white/40 text-sm">
                  {!post.author || !account ? 'Loading...' : 'Cannot report your own post'}
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-white/60 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Image */}
      <div
        className="relative aspect-square bg-white/10 cursor-pointer"
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
            <svg
              className="w-20 h-20 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Instagram-like heart animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`transition-all duration-500 ease-out ${
              showLikeAnimation ? "scale-125 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <svg
              className="w-20 h-20 text-white drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
              <svg
                className={`w-6 h-6 transition-colors ${
                  isLiked ? "text-red-500 fill-current" : "text-white"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            {post.allowComments !== false && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
            <button
              onClick={() => toggleSave(post)}
              disabled={saveLoading}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  isSaved ? "text-yellow-500 fill-current" : "text-white"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setShowTipModal(true)}
            disabled={!isConnected}
            className="bg-white hover:bg-white/80 text-black px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span>Tip</span>
          </button>
        </div>

        {/* Like count and tips */}
        <div className="mb-3">
          <p className="font-semibold text-white text-sm">
            {post.showLikeCount !== false ? `${likes} likes • ` : ""}
            {post.tips || "0"} ETH in tips
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-3">
            <p className="text-white">
              <span
                className="font-semibold mr-2 cursor-pointer hover:text-purple-300 transition-colors"
                onClick={handleProfileClick}
              >
                {getDisplayName(post.author)}
              </span>
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
                <div
                  className="w-6 h-6 bg-white rounded-full flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${comment.userAddress}`);
                  }}
                ></div>
                <p className="text-sm text-white">
                  <span
                    className="font-semibold mr-2 cursor-pointer hover:text-white/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${comment.userAddress}`);
                    }}
                  >
                    {getDisplayName(comment.userAddress)}
                  </span>
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment - only show if comments are allowed */}
        {post.allowComments !== false && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex-shrink-0"></div>
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
              className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
            />
            {comment.trim() && (
              <button
                onClick={handleComment}
                className="text-white font-semibold text-sm hover:text-white/80 transition-colors"
              >
                Post
              </button>
            )}
          </div>
        )}

        {/* Comments disabled message */}
        {post.allowComments === false && (
          <div className="text-center py-2">
            <p className="text-white/40 text-sm">
              Comments are disabled for this post
            </p>
          </div>
        )}
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tip Creator</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={handleProfileClick}
              >
                <span className="text-black font-semibold">
                  {post.author?.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div>
                <p
                  className="font-semibold text-white cursor-pointer hover:text-white/80 transition-colors"
                  onClick={handleProfileClick}
                >
                  {getDisplayName(post.author)}
                </p>
                <p className="text-sm text-white/60">
                  Send a tip to support this creator
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tip Amount (ETH)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.001"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/40 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <span className="text-white/60 font-medium">ETH</span>
              </div>
              <div className="flex space-x-2 mt-2">
                {["0.001", "0.01", "0.1"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={!tipAmount || isLoading}
                className="flex-1 bg-white hover:bg-white/80 text-black px-4 py-3 rounded-xl disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Sending..." : `Send ${tipAmount || "0"} ETH`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tip Sent Successfully!
            </h3>
            <p className="text-gray-300 mb-6">{successMessage}</p>
            <div className="text-sm text-gray-400 mb-6">
              <p>💰 The tip has been sent directly to the creator's wallet</p>
              <p>🔗 Transaction confirmed on the blockchain</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn-primary px-6 py-3 rounded-xl w-full"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tip Failed
            </h3>
            <p className="text-gray-300 mb-6">{errorMessage}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setShowTipModal(true);
                }}
                className="flex-1 btn-primary px-4 py-3 rounded-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Share Post</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Copy Link */}
              <button
                onClick={async () => {
                  const postUrl = `${window.location.origin}/post/${post.id}/${post.author}`;
                  try {
                    await navigator.clipboard.writeText(postUrl);
                    setSuccessMessage("Link copied to clipboard! 📋");
                    setShowShareModal(false);
                    setShowSuccessModal(true);
                  } catch (error) {
                    console.error("Clipboard error:", error);
                  }
                }}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-white">Copy Link</span>
              </button>

              {/* Share on Twitter */}
              <button
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}/${post.author}`;
                  const shareText = post.caption
                    ? `Check out this post: "${post.caption.slice(0, 100)}${
                        post.caption.length > 100 ? "..." : ""
                      }"`
                    : `Check out this post on Socio3`;
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(postUrl)}`;
                  window.open(twitterUrl, "_blank");
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                <span className="text-white">Share on Twitter</span>
              </button>

              {/* Share on Telegram */}
              <button
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}/${post.author}`;
                  const shareText = post.caption
                    ? `Check out this post: "${post.caption.slice(0, 100)}${
                        post.caption.length > 100 ? "..." : ""
                      }"`
                    : `Check out this post on Socio3`;
                  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
                    postUrl
                  )}&text=${encodeURIComponent(shareText)}`;
                  window.open(telegramUrl, "_blank");
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span className="text-white">Share on Telegram</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Report Post</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-white/80 mb-4 text-sm">
              Help us keep the community safe. What's wrong with this post?
            </p>
            
            <div className="space-y-2">
              {/* Spam */}
              <button
                onClick={() => handleReport(1, 'Spam')}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                <div className="text-left">
                  <p className="text-white font-medium">Spam</p>
                  <p className="text-white/60 text-sm">Repetitive or unwanted content</p>
                </div>
              </button>

              {/* Inappropriate Content */}
              <button
                onClick={() => handleReport(2, 'Inappropriate Content')}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-left">
                  <p className="text-white font-medium">Inappropriate Content</p>
                  <p className="text-white/60 text-sm">Offensive or harmful material</p>
                </div>
              </button>

              {/* Harassment */}
              <button
                onClick={() => handleReport(3, 'Harassment')}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="text-left">
                  <p className="text-white font-medium">Harassment</p>
                  <p className="text-white/60 text-sm">Bullying or targeting individuals</p>
                </div>
              </button>

              {/* Copyright */}
              <button
                onClick={() => handleReport(4, 'Copyright Violation')}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-white font-medium">Copyright Violation</p>
                  <p className="text-white/60 text-sm">Unauthorized use of copyrighted content</p>
                </div>
              </button>

              {/* Other */}
              <button
                onClick={() => handleReport(5, 'Other')}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-white font-medium">Other</p>
                  <p className="text-white/60 text-sm">Something else that violates our guidelines</p>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-white/60 text-xs">
                Reports are reviewed by our community moderation system. False reports may result in account restrictions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
