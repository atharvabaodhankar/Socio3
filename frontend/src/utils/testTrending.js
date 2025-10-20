import { getTrendingCreators, getTopPosts } from '../services/trendingService';

// Test function to verify trending functionality
export const testTrendingService = async (provider, posts) => {
  console.log('🧪 Testing Trending Service...');
  
  try {
    // Test 1: Get trending creators
    console.log('1. Getting trending creators...');
    const trendingCreators = await getTrendingCreators(provider, posts, 5);
    console.log(`Found ${trendingCreators.length} trending creators:`, trendingCreators);

    // Test 2: Get top posts
    console.log('2. Getting top posts...');
    const topPosts = await getTopPosts(posts, 9);
    console.log(`Found ${topPosts.length} top posts:`, topPosts);

    console.log('✅ Trending service tests completed!');
    return { trendingCreators, topPosts };
  } catch (error) {
    console.error('❌ Trending service test failed:', error);
    return null;
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testTrending = testTrendingService;
}