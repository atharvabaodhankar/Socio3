const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Starting fresh deployment of Socio3 contracts with reporting...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy PostContract with reporting functionality
  console.log("\n📝 Deploying PostContract...");
  const PostContract = await ethers.getContractFactory("PostContract");
  const postContract = await PostContract.deploy();
  await postContract.waitForDeployment();
  const postAddress = await postContract.getAddress();
  console.log("✅ PostContract deployed to:", postAddress);

  // Deploy SocialContract
  console.log("\n👥 Deploying SocialContract...");
  const SocialContract = await ethers.getContractFactory("SocialContract");
  const socialContract = await SocialContract.deploy();
  await socialContract.waitForDeployment();
  const socialAddress = await socialContract.getAddress();
  console.log("✅ SocialContract deployed to:", socialAddress);

  // Get contract ABIs
  const postABI = PostContract.interface.formatJson();
  const socialABI = SocialContract.interface.formatJson();

  // Create deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PostContract: {
        address: postAddress,
        abi: JSON.parse(postABI)
      },
      SocialContract: {
        address: socialAddress,
        abi: JSON.parse(socialABI)
      }
    }
  };

  // Save deployment info
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Create frontend config
  const frontendConfig = `
// Auto-generated contract configuration
// Generated on: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
  POST_CONTRACT: "${postAddress}",
  SOCIAL_CONTRACT: "${socialAddress}"
};

export const POST_CONTRACT_ABI = ${postABI};

export const SOCIAL_CONTRACT_ABI = ${socialABI};

export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia testnet
  chainName: "Sepolia",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  blockExplorer: "https://sepolia.etherscan.io"
};

// Helper function to get contract instance
export const getContract = (contractAddress, abi, signer) => {
  const { ethers } = require('ethers');
  return new ethers.Contract(contractAddress, abi, signer);
};
`;

  fs.writeFileSync('./frontend/src/config/contracts.js', frontendConfig);

  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("PostContract:", postAddress);
  console.log("SocialContract:", socialAddress);
  console.log("Network: Sepolia Testnet");
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(50));
  
  console.log("\n📋 Contract Features:");
  console.log("✅ Post creation and management");
  console.log("✅ Social interactions (likes, follows, tips)");
  console.log("✅ Reporting system with 5 categories");
  console.log("✅ Automatic post removal based on reports");
  console.log("✅ Admin controls and moderation");
  
  console.log("\n🔗 Etherscan Links:");
  console.log(`PostContract: https://sepolia.etherscan.io/address/${postAddress}`);
  console.log(`SocialContract: https://sepolia.etherscan.io/address/${socialAddress}`);
  
  console.log("\n✅ Frontend configuration updated!");
  console.log("📁 Files updated:");
  console.log("  - frontend/src/config/contracts.js");
  console.log("  - deployment-info.json");
  
  console.log("\n🚀 Ready to launch! Your Socio3 platform is deployed with:");
  console.log("  - Fresh smart contracts");
  console.log("  - Complete reporting system");
  console.log("  - Auto-moderation features");
  console.log("  - Admin dashboard");
}

main()
  .then(() => {
    console.log("\n🎊 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });