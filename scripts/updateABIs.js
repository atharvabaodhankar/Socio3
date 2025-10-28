const fs = require('fs');
const path = require('path');

// Read compiled contract artifacts
const postContractArtifact = JSON.parse(
  fs.readFileSync('./artifacts/contracts/PostContract.sol/PostContract.json', 'utf8')
);

const socialContractArtifact = JSON.parse(
  fs.readFileSync('./artifacts/contracts/SocialContract.sol/SocialContract.json', 'utf8')
);

// Create the updated contracts config
const contractsConfig = `
import deployedContracts from './deployedContracts.json';

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  POST_CONTRACT: "0xDD175036321A6ea90d29fd7acA6e955ca8989284",
  SOCIAL_CONTRACT: "0xb94d507A95Fe1Cb97C53199B78Cd30B3D0eFD75D"
};

// Contract ABIs from deployment
export const POST_CONTRACT_ABI = ${JSON.stringify(postContractArtifact.abi, null, 2)};

export const SOCIAL_CONTRACT_ABI = ${JSON.stringify(socialContractArtifact.abi, null, 2)};

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
`;

// Write the updated config
fs.writeFileSync('./frontend/src/config/contracts.js', contractsConfig);

console.log('✅ Updated frontend/src/config/contracts.js with new ABIs and addresses!');