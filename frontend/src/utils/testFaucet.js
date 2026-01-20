// Test script for faucet functionality
import { requestTestETHAdmin, checkFaucetStatus, checkUserNeedsETH } from '../services/faucetService';
import { hasUserBeenWelcomed, markUserAsWelcomed, getWelcomeGiftHistory, getWelcomeGiftStats } from '../services/firebaseService';

// Test the faucet service
export const testFaucetService = async () => {
  console.log('🧪 Testing Faucet Service...');
  
  try {
    // Test 1: Check faucet status
    console.log('1. Checking faucet status...');
    const status = await checkFaucetStatus();
    console.log('Faucet status:', status);
    
    // Test 2: Test with a sample address (don't actually request)
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e';
    console.log(`2. Testing balance check for ${testAddress}...`);
    
    // Note: This would require a provider, so we'll skip for now
    console.log('Balance check requires provider - skipping in test');
    
    // Test 3: Test faucet request (commented out to avoid spam)
    console.log('3. Faucet request test - commented out to avoid spam');
    // const result = await requestTestETHAdmin(testAddress);
    // console.log('Faucet result:', result);
    
    console.log('✅ Faucet service tests completed');
    
  } catch (error) {
    console.error('❌ Faucet test failed:', error);
  }
};

// Test the Firebase welcome gift system
export const testFirebaseWelcomeSystem = async () => {
  console.log('🧪 Testing Firebase Welcome Gift System...');
  
  try {
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e';
    
    // Test 1: Check if user has been welcomed
    console.log('1. Testing hasUserBeenWelcomed...');
    const hasBeenWelcomed = await hasUserBeenWelcomed(testAddress);
    console.log('Has been welcomed:', hasBeenWelcomed);
    
    // Test 2: Get welcome gift history
    console.log('2. Testing getWelcomeGiftHistory...');
    const history = await getWelcomeGiftHistory(testAddress);
    console.log('Welcome gift history:', history);
    
    // Test 3: Get welcome gift stats (admin function)
    console.log('3. Testing getWelcomeGiftStats...');
    const stats = await getWelcomeGiftStats();
    console.log('Welcome gift stats:', stats);
    
    // Test 4: Mark user as welcomed (test only - don't actually mark)
    console.log('4. Testing markUserAsWelcomed (dry run)...');
    console.log('Would mark user as welcomed with test data');
    // await markUserAsWelcomed(testAddress, { success: true, amount: '0.005 ETH', transactionHash: 'test' });
    
    console.log('✅ Firebase welcome gift system tests completed');
    
  } catch (error) {
    console.error('❌ Firebase welcome gift test failed:', error);
  }
};

// Test the welcome gift system (legacy localStorage version)
export const testWelcomeGiftSystem = () => {
  console.log('🧪 Testing Legacy Welcome Gift System (localStorage)...');
  
  try {
    const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e';
    
    // Test localStorage functionality
    console.log('1. Testing localStorage functionality...');
    
    // Clear any existing welcome status
    localStorage.removeItem(`welcomed_${testAddress.toLowerCase()}`);
    console.log('Cleared welcome status');
    
    // Check if user has been welcomed
    const hasBeenWelcomed = localStorage.getItem(`welcomed_${testAddress.toLowerCase()}`);
    console.log('Has been welcomed:', hasBeenWelcomed);
    
    // Set welcome status
    localStorage.setItem(`welcomed_${testAddress.toLowerCase()}`, 'true');
    console.log('Set welcome status to true');
    
    // Check again
    const hasBeenWelcomedAfter = localStorage.getItem(`welcomed_${testAddress.toLowerCase()}`);
    console.log('Has been welcomed after setting:', hasBeenWelcomedAfter);
    
    console.log('✅ Legacy welcome gift system tests completed');
    
  } catch (error) {
    console.error('❌ Legacy welcome gift test failed:', error);
  }
};

// Run tests if in development
if (import.meta.env.DEV) {
  console.log('🚀 Faucet system loaded with Firebase tracking!');
  console.log('Available test functions:');
  console.log('- testFaucetService() - Test faucet API');
  console.log('- testFirebaseWelcomeSystem() - Test Firebase welcome tracking');
  console.log('- testWelcomeGiftSystem() - Test legacy localStorage system');
  
  // Make functions available globally for console testing
  window.testFaucetService = testFaucetService;
  window.testFirebaseWelcomeSystem = testFirebaseWelcomeSystem;
  window.testWelcomeGiftSystem = testWelcomeGiftSystem;
}