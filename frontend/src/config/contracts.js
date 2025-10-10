// Contract addresses and ABIs
// Note: Update these addresses after deploying contracts

export const CONTRACT_ADDRESSES = {
  POST_CONTRACT: "", // Update after deployment
  SOCIAL_CONTRACT: "" // Update after deployment
};

// Contract ABIs (will be generated after compilation)
export const POST_CONTRACT_ABI = [
  // This will be populated from artifacts after compilation
];

export const SOCIAL_CONTRACT_ABI = [
  // This will be populated from artifacts after compilation
];

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia testnet
  chainName: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
  blockExplorer: "https://sepolia.etherscan.io"
};

// Helper function to get contract instance
export const getContract = (contractAddress, abi, signer) => {
  const { ethers } = require('ethers');
  return new ethers.Contract(contractAddress, abi, signer);
};