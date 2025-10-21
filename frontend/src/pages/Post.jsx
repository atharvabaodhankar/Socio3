import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { usePosts } from '../hooks/usePosts';
import PostModal from '../components/PostModal';
import { parsePostUrl } from '../utils/postNavigation';

const Post = () => {
  const { postId, authorAddress } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useWeb3();
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Parse URL parameters
  const { postId: parsedPostId, authorAddress: parsedAuthorAddress } = parsePostUrl(postId, authorAddress);
  
  // Fetch posts from the author
  const { posts, loading, error } = usePosts(parsedAuthorAddress);

  useEffect(() => {
    if (posts.length > 0 && parsedPostId) {
      // Find the specific post by ID
      const postIndex = posts.findIndex(post => post.id === parsedPostId);
      if (postIndex !== -1) {
        setSelectedPost(posts[postIndex]);
        setSelectedIndex(postIndex);
      } else {
        // Post not found, redirect to author's profile
        navigate(`/profile/${parsedAuthorAddress}`);
      }
    }
  }, [posts, parsedPostId, parsedAuthorAddress, navigate]);

  const handleClose = () => {
    navigate(`/profile/${parsedAuthorAddress}`);
  };

  const goToNextPost = () => {
    if (selectedIndex < posts.length - 1) {
      const nextPost = posts[selectedIndex + 1];
      setSelectedPost(nextPost);
      setSelectedIndex(selectedIndex + 1);
      // Update URL
      navigate(`/post/${nextPost.id}/${parsedAuthorAddress}`, { replace: true });
    }
  };

  const goToPrevPost = () => {
    if (selectedIndex > 0) {
      const prevPost = posts[selectedIndex - 1];
      setSelectedPost(prevPost);
      setSelectedIndex(selectedIndex - 1);
      // Update URL
      navigate(`/post/${prevPost.id}/${parsedAuthorAddress}`, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-white mb-4">Error Loading Post</h2>
        <p className="text-white/60 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white hover:bg-white/80 text-black px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!selectedPost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
        <p className="text-white/60 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate(`/profile/${parsedAuthorAddress}`)}
          className="bg-white hover:bg-white/80 text-black px-6 py-3 rounded-xl font-medium transition-colors"
        >
          View Profile
        </button>
      </div>
    );
  }

  return (
    <PostModal
      post={selectedPost}
      isOpen={true}
      onClose={handleClose}
      onNext={goToNextPost}
      onPrev={goToPrevPost}
      hasNext={selectedIndex < posts.length - 1}
      hasPrev={selectedIndex > 0}
    />
  );
};

export default Post;