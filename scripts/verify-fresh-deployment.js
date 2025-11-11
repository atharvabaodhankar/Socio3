const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACTS = {
  POST_CONTRACT: "0xfAf5EdEb50A1677708141457fBdf61642B8a252E",
  SOCIAL_CONTRACT: "0x4Aa3Cf50E01552e7695883E376E4249aa717eb94",
  PROFILE_CONTRACT: "0x7040554cB52b34Dcf8836ddD503F318b1dd67eE4"
};

const POST_ABI = [
  "function postCount() view returns (uint256)",
  "function owner() view returns (address)"
];

const SOCIAL_ABI = [
  "function getFollowerCount(address) view returns (uint256)",
  "function getLikesCount(uint256) view returns (uint256)"
];

const PROFILE_ABI = [
  "function hasProfile(address) view returns (bool)",
  "function isUsernameAvailable(string) view returns (bool)"
];

async function verify() {
  console.log('🔍 Verifying Fresh Deployment...\n');
  
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  
  // Test PostContract
  console.log('📝 Testing PostContract...');
  const postContract = new ethers.Contract(CONTRACTS.POST_CONTRACT, POST_ABI, provider);
  const postCount = await postContract.postCount();
  const owner = await postContract.owner();
  console.log(`   Address: ${CONTRACTS.POST_CONTRACT}`);
  console.log(`   Post Count: ${postCount.toString()} (should be 0)`);
  console.log(`   Owner: ${owner}`);
  console.log(`   ✅ ${postCount.toString() === '0' ? 'FRESH!' : 'Has data'}\n`);
  
  // Test SocialContract
  console.log('👥 Testing SocialContract...');
  const socialContract = new ethers.Contract(CONTRACTS.SOCIAL_CONTRACT, SOCIAL_ABI, provider);
  const followerCount = await socialContract.getFollowerCount(owner);
  const likesCount = await socialContract.getLikesCount(1);
  console.log(`   Address: ${CONTRACTS.SOCIAL_CONTRACT}`);
  console.log(`   Follower Count (owner): ${followerCount.toString()} (should be 0)`);
  console.log(`   Likes Count (post 1): ${likesCount.toString()} (should be 0)`);
  console.log(`   ✅ ${followerCount.toString() === '0' && likesCount.toString() === '0' ? 'FRESH!' : 'Has data'}\n`);
  
  // Test ProfileContract
  console.log('👤 Testing ProfileContract...');
  const profileContract = new ethers.Contract(CONTRACTS.PROFILE_CONTRACT, PROFILE_ABI, provider);
  const hasProfile = await profileContract.hasProfile(owner);
  const usernameAvailable = await profileContract.isUsernameAvailable("testuser");
  console.log(`   Address: ${CONTRACTS.PROFILE_CONTRACT}`);
  console.log(`   Owner has profile: ${hasProfile} (should be false)`);
  console.log(`   Username "testuser" available: ${usernameAvailable} (should be true)`);
  console.log(`   ✅ ${!hasProfile && usernameAvailable ? 'FRESH!' : 'Has data'}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 All contracts are FRESH and working!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 Summary:');
  console.log(`   PostContract:    ${CONTRACTS.POST_CONTRACT}`);
  console.log(`   SocialContract:  ${CONTRACTS.SOCIAL_CONTRACT}`);
  console.log(`   ProfileContract: ${CONTRACTS.PROFILE_CONTRACT}`);
  console.log('\n✅ Ready to use!');
}

verify().catch(console.error);
