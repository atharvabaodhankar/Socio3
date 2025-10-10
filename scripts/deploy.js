const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Socio3 contracts...");

  // Deploy PostContract
  const PostContract = await hre.ethers.getContractFactory("PostContract");
  const postContract = await PostContract.deploy();
  await postContract.waitForDeployment();
  
  console.log("PostContract deployed to:", await postContract.getAddress());

  // Deploy SocialContract
  const SocialContract = await hre.ethers.getContractFactory("SocialContract");
  const socialContract = await SocialContract.deploy();
  await socialContract.waitForDeployment();
  
  console.log("SocialContract deployed to:", await socialContract.getAddress());

  // Save contract addresses and ABIs to frontend
  const contractsData = {
    PostContract: {
      address: await postContract.getAddress(),
      abi: PostContract.interface.format('json')
    },
    SocialContract: {
      address: await socialContract.getAddress(),
      abi: SocialContract.interface.format('json')
    }
  };

  // Create contracts config file for frontend
  const contractsConfigPath = path.join(__dirname, "../frontend/src/config/deployedContracts.json");
  fs.writeFileSync(contractsConfigPath, JSON.stringify(contractsData, null, 2));
  
  console.log("Contract addresses and ABIs saved to frontend config");
  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });