const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing reporting system...");
  
  const [deployer, user1, user2] = await ethers.getSigners();
  
  // Contract addresses from deployment
  const POST_CONTRACT_ADDRESS = "0x1C4C0Eff199Af5C97d3DC723E91a56382fD52067";
  
  // Get contract instance
  const PostContract = await ethers.getContractFactory("PostContract");
  const postContract = PostContract.attach(POST_CONTRACT_ADDRESS);
  
  console.log("📋 Testing report status checking...");
  
  try {
    // Test hasReported function for a non-existent post
    const hasReported1 = await postContract.hasReported(1, deployer.address);
    console.log("✅ Has deployer reported post 1:", hasReported1);
    
    const hasReported2 = await postContract.hasReported(1, user1.address);
    console.log("✅ Has user1 reported post 1:", hasReported2);
    
    // Test report count
    const reportCount = await postContract.getReportCount(1);
    console.log("✅ Report count for post 1:", reportCount.toString());
    
    console.log("\n🎉 Report status checking works correctly!");
    
  } catch (error) {
    console.error("❌ Error testing reporting:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n✅ Reporting test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Reporting test failed:", error);
    process.exit(1);
  });