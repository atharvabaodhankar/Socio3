import deployedContracts from './deployedContracts.json';

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  POST_CONTRACT: deployedContracts.PostContract.address,
  SOCIAL_CONTRACT: deployedContracts.SocialContract.address
};

// Contract ABIs from deployment
export const POST_CONTRACT_ABI = deployedContracts.PostContract.abi;
export const SOCIAL_CONTRACT_ABI = deployedContracts.SocialContract.abi;

// Network configuration
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