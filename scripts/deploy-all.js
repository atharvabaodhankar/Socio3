const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting fresh deployment of all contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log();

  // Deploy PostContract
  console.log("📝 Deploying PostContract...");
  const PostContract = await hre.ethers.getContractFactory("PostContract");
  const postContract = await PostContract.deploy();
  await postContract.waitForDeployment();
  const postAddress = await postContract.getAddress();
  console.log("✅ PostContract deployed to:", postAddress);
  console.log();

  // Wait a bit to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Deploy SocialContract
  console.log("👥 Deploying SocialContract...");
  const SocialContract = await hre.ethers.getContractFactory("SocialContract");
  const socialContract = await SocialContract.deploy();
  await socialContract.waitForDeployment();
  const socialAddress = await socialContract.getAddress();
  console.log("✅ SocialContract deployed to:", socialAddress);
  console.log();

  // Wait a bit to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Deploy ProfileContract
  console.log("👤 Deploying ProfileContract...");
  const ProfileContract = await hre.ethers.getContractFactory("ProfileContract");
  const profileContract = await ProfileContract.deploy();
  await profileContract.waitForDeployment();
  const profileAddress = await profileContract.getAddress();
  console.log("✅ ProfileContract deployed to:", profileAddress);
  console.log();

  // Summary
  console.log("🎉 All contracts deployed successfully!\n");
  console.log("📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("PostContract:    ", postAddress);
  console.log("SocialContract:  ", socialAddress);
  console.log("ProfileContract: ", profileAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save to file
  const fs = require('fs');
  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PostContract: postAddress,
      SocialContract: socialAddress,
      ProfileContract: profileAddress
    }
  };

  fs.writeFileSync(
    'deployment-addresses.json',
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
