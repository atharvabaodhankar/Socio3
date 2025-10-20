import { 
  savePostSettings, 
  getPostSettings, 
  updatePostSettings,
  getMultiplePostSettings 
} from '../services/postSettingsService';

// Test function to verify post settings functionality
export const testPostSettingsService = async (userAddress) => {
  console.log('🧪 Testing Post Settings Service...');
  
  const testPostId = 1;
  const testSettings = {
    allowComments: false,
    showLikeCount: true
  };

  try {
    // Test 1: Save post settings
    console.log('1. Saving post settings...');
    await savePostSettings(testPostId, userAddress, testSettings);
    console.log('✅ Post settings saved');

    // Test 2: Get post settings
    console.log('2. Getting post settings...');
    const retrievedSettings = await getPostSettings(testPostId, userAddress);
    console.log('Retrieved settings:', retrievedSettings);

    // Test 3: Update post settings
    console.log('3. Updating post settings...');
    const updatedSettings = {
      allowComments: true,
      showLikeCount: false
    };
    await updatePostSettings(testPostId, userAddress, updatedSettings);
    console.log('✅ Post settings updated');

    // Test 4: Get updated settings
    const finalSettings = await getPostSettings(testPostId, userAddress);
    console.log('Final settings:', finalSettings);

    // Test 5: Test multiple posts
    console.log('5. Testing multiple post settings...');
    const testPosts = [
      { id: 1, author: userAddress },
      { id: 2, author: userAddress }
    ];
    const multipleSettings = await getMultiplePostSettings(testPosts);
    console.log('Multiple settings:', multipleSettings);

    console.log('✅ All post settings tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Post settings test failed:', error);
    return false;
  }
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testPostSettings = testPostSettingsService;
}