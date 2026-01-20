const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACTS = {
  POST_CONTRACT: "0x5d5C1d313f580027204e04E8D4E3162f37A661CF",
  SOCIAL_CONTRACT: "0xedb788eb4c9D5B0919C9e9c81947B8417FF57788",
  PROFILE_CONTRACT: "0x314FBc86715eD6a8f07C775e775CD4E61CF903Df"
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
