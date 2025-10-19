// Utility functions for post navigation

// Create a URL-friendly post identifier
export const createPostUrl = (postId, authorAddress) => {
  return `/post/${postId}/${authorAddress}`;
};

// Parse post URL parameters
export const parsePostUrl = (postId, authorAddress) => {
  return {
    postId: parseInt(postId),
    authorAddress: authorAddress.toLowerCase()
  };
};

// Navigate to a specific post
export const navigateToPost = (navigate, postId, authorAddress) => {
  const postUrl = createPostUrl(postId, authorAddress);
  navigate(postUrl);
};

// Open post modal with specific post
export const openSpecificPost = (navigate, onClose, postId, authorAddress) => {
  if (onClose) onClose(); // Close current modal
  navigateToPost(navigate, postId, authorAddress);
};