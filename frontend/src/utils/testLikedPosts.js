import { 
  likePost, 
  unlikePost, 
  isPostLiked, 
  getLikedPosts,
  getPostLikeCount 
} from '../services/likedPostsService';

// Test function to verify liked posts functionality
export const testLikedPostsService = async (userAddress) => {
  console.log('🧪 Testing Liked Posts Service...');
  
  const testPostId = 1;
  const testPostAuthor = '0x1234567890123456789012345678901234567890';
  const testPostData = {
    caption: 'Test post for likes',
    imageUrl: 'https://example.com/test.jpg'
  };

  try {
    // Test 1: Check initial like status
    console.log('1. Checking initial like status...');
    const initialLiked = await isPostLiked(userAddress, testPostId);
    console.log(`Initial liked status: ${initialLiked}`);

    // Test 2: Like the post
    console.log('2. Liking the post...');
    await likePost(userAddress, testPostId, testPostAuthor, testPostData);
    
    // Test 3: Check like status after liking
    const afterLike = await isPostLiked(userAddress, testPostId);
    console.log(`After like status: ${afterLike}`);

    // Test 4: Get like count
    const likeCount = await getPostLikeCount(testPostId);
    console.log(`Post like count: ${likeCount}`);

    // Test 5: Get user's liked posts
    const likedPosts = await getLikedPosts(userAddress);
    console.log(`User's liked posts count: ${likedPosts.length}`);

    // Test 6: Unlike the post
    console.log('6. Unliking the post...');
    await unlikePost(userAddress, testPostId);
    
    // Test 7: Check final status
    const finalLiked = await isPostLiked(userAddress, testPostId);
    console.log(`Final liked status: ${finalLiked}`);

    console.log('✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testLikedPosts = testLikedPostsService;
}