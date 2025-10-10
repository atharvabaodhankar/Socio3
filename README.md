# 🎨 Socio3 - Decentralized Social Media Platform

A Web3-powered social media dApp inspired by Instagram, built with React, Ethereum smart contracts, and IPFS storage.

## 🚀 Features

- **Decentralized Content**: Posts stored on IPFS with metadata on Ethereum
- **Wallet-based Authentication**: No passwords, just connect your wallet
- **Crypto Tipping**: Support creators with ETH tips
- **True Ownership**: Users own their content permanently
- **Social Features**: Follow, like, and interact with creators

## 🛠️ Tech Stack

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Ethers.js for Web3 integration
- React Router for navigation

### Backend
- Firebase Firestore for real-time data
- IPFS via Pinata for media storage
- Ethereum smart contracts (Solidity)

### Blockchain
- Hardhat development framework
- Sepolia testnet deployment
- MetaMask wallet integration

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd socio3
```

2. **Install dependencies**
```bash
# Root dependencies (Hardhat)
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

3. **Environment Setup**
Create environment files from examples:
```bash
# Root .env for blockchain and backend services
cp .env.example .env

# Frontend .env for client-side environment variables
cp frontend/.env.example frontend/.env
```

Then update both `.env` files with your actual credentials:
- **Root .env**: Infura Project ID, Private Key, Pinata credentials, Firebase config
- **Frontend .env**: Same credentials but with `VITE_` prefix for Vite

⚠️ **Security Note**: Never commit `.env` files to version control. They contain sensitive credentials.

## 🔧 Development

### Smart Contracts

1. **Compile contracts**
```bash
npx hardhat compile
```

2. **Run tests**
```bash
npx hardhat test
```

3. **Start local blockchain**
```bash
npx hardhat node
```

4. **Deploy to local network**
```bash
npx hardhat ignition deploy ./ignition/modules/Socio3.js --network localhost
```

5. **Deploy to Sepolia testnet**
```bash
npx hardhat ignition deploy ./ignition/modules/Socio3.js --network sepolia
```

### Frontend

1. **Start development server**
```bash
cd frontend
npm run dev
```

2. **Build for production**
```bash
cd frontend
npm run build
```

## 📋 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Update `frontend/src/config/firebase.js` with your config
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`

### Pinata IPFS Setup
1. Create a Pinata account
2. Generate API keys
3. Update `frontend/src/config/pinata.js` with your credentials

### MetaMask Setup
1. Install MetaMask extension
2. Add Sepolia testnet
3. Get test ETH from Sepolia faucet

## 🏗️ Project Structure

```
socio3/
├── contracts/              # Smart contracts
│   ├── PostContract.sol    # Post creation and retrieval
│   └── SocialContract.sol  # Social interactions (likes, follows, tips)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   └── config/         # Configuration files
├── test/                   # Contract tests
├── ignition/modules/       # Deployment scripts
└── firestore.rules         # Firebase security rules
```

## 🔐 Security

- Wallet-based authentication
- Firebase security rules
- Smart contract access controls
- IPFS content addressing
- Input validation and sanitization

## 🚀 Deployment

### Smart Contracts
1. Update `hardhat.config.js` with your Infura project ID
2. Add your private key to `.env`
3. Deploy to Sepolia: `npx hardhat ignition deploy ./ignition/modules/Socio3.js --network sepolia`
4. Update contract addresses in `frontend/src/config/contracts.js`

### Frontend
1. Build the frontend: `cd frontend && npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting platform

## 📱 Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Create Post**: Upload image/video, add caption, and share
3. **Explore**: Discover trending posts and new creators
4. **Interact**: Like posts, follow creators, and send tips
5. **Profile**: View your posts, followers, and earnings

## 🧪 Testing

Run the test suite:
```bash
npx hardhat test
```

Test specific contracts:
```bash
npx hardhat test test/Socio3.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Ethereum](https://ethereum.org/)
- [IPFS](https://ipfs.io/)
- [Hardhat](https://hardhat.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ for the decentralized web
