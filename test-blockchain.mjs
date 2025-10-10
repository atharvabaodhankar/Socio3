import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xDA671972905F8F6Ee25c4c745822690970418285";
const ABI = [
  "function getAllPosts() view returns ((address,string,uint256,uint256)[])",
  "function postCount() view returns (uint256)",
];

async function testBlockchain() {
  try {
    console.log("Testing blockchain connection...");

    const provider = new ethers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com"
    );
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log("Getting post count...");
    const count = await contract.postCount();
    console.log("Total posts:", count.toString());

    console.log("Getting all posts...");
    const posts = await contract.getAllPosts();
    console.log("Posts:", posts);

    if (posts.length === 0) {
      console.log(
        "No posts found in the blockchain. You need to create some posts first!"
      );
    } else {
      posts.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          author: post[0],
          ipfsHash: post[1],
          timestamp: new Date(Number(post[2]) * 1000).toLocaleString(),
          id: post[3].toString(),
        });
      });
    }
  } catch (error) {
    console.error("Blockchain test failed:", error);
  }
}

testBlockchain();
