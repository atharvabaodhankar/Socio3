const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts with reporting functionality...");

  // Deploy PostContract
  const PostContract = await ethers.getContractFactory("PostContract");
  const postContract = await PostContract.deploy();
  await postContract.waitForDeployment();
  
  console.log("PostContract deployed to:", await postContract.getAddress());

  // Deploy SocialContract
  const SocialContract = await ethers.getContractFactory("SocialContract");
  const socialContract = await SocialContract.deploy();
  await socialContract.waitForDeployment();
  
  console.log("SocialContract deployed to:", await socialContract.getAddress());

  // Save addresses to a file for frontend
  const addresses = {
    POST_CONTRACT: await postContract.getAddress(),
    SOCIAL_CONTRACT: await socialContract.getAddress(),
  };

  console.log("\nContract Addresses:");
  console.log("POST_CONTRACT:", addresses.POST_CONTRACT);
  console.log("SOCIAL_CONTRACT:", addresses.SOCIAL_CONTRACT);
  
  console.log("\nUpdate your frontend/src/config/contracts.js with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });