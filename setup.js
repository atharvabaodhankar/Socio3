#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Setting up Socio3 - Decentralized Social Media Platform\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Compile contracts
console.log('🔨 Compiling smart contracts...');
try {
  execSync('npx hardhat compile', { stdio: 'inherit' });
  console.log('✅ Smart contracts compiled\n');
} catch (error) {
  console.error('❌ Failed to compile smart contracts');
  process.exit(1);
}

// Run tests
console.log('🧪 Running tests...');
try {
  execSync('npx hardhat test test/Socio3.js', { stdio: 'inherit' });
  console.log('✅ All tests passed\n');
} catch (error) {
  console.error('❌ Tests failed');
  process.exit(1);
}

// Deploy contracts locally
console.log('🚀 Deploying contracts locally...');
try {
  execSync('npx hardhat run scripts/deploy.js', { stdio: 'inherit' });
  console.log('✅ Contracts deployed locally\n');
} catch (error) {
  console.error('❌ Failed to deploy contracts');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Copy .env.example to .env and add your Infura project ID');
console.log('2. Start the frontend: cd frontend && npm run dev');
console.log('3. Connect your MetaMask wallet');
console.log('4. Start creating posts!\n');
console.log('📚 For more information, check the README.md file');
console.log('🌐 Visit: http://localhost:5173 (frontend)');
console.log('🔗 GitHub: https://github.com/your-username/socio3\n');
console.log('Built with ❤️ for the decentralized web');