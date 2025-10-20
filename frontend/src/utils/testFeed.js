import { 
  getFollowingFeed, 
  getAllPostsFeed, 
  getFollowingCount, 
  hasFollowing 
} from '../services/feedService';

// Test function to verify feed functionality
export const testFeedService = async (userAddress, posts, provider) => {
  console.log('🧪 Testing Feed Service...');
  
  try {
    // Test 1: Check if user has following (blockchain)
    console.log('1. Checking if user has following (blockchain)...');
    const userHasFollowing = await hasFollowing(userAddress, posts, provider);
    console.log(`Has following: ${userHasFollowing}`);

    // Test 2: Get following feed (blockchain)
    console.log('2. Getting following feed (blockchain)...');
    const followingFeed = await getFollowingFeed(userAddress, posts, provider, 10);
    console.log(`Following feed posts: ${followingFeed.length}`, followingFeed);

    // Test 3: Get all posts feed
    console.log('3. Getting all posts feed...');
    const allPostsFeed = getAllPostsFeed(posts, 10);
    console.log(`All posts feed: ${allPostsFeed.length}`, allPostsFeed);

    console.log('✅ Feed service tests completed!');
    return { userHasFollowing, followingFeed, allPostsFeed };
  } catch (error) {
    console.error('❌ Feed service test failed:', error);
    return null;
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testFeed = testFeedService;
}