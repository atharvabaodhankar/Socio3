# 🎨 Socio3 - Decentralized Social Media Platform

A production-ready Web3 social media dApp that combines the familiar experience of Instagram with the power of blockchain technology. Built with React, Ethereum smart contracts, and IPFS storage, featuring advanced content moderation, automatic ETH gifting for new users, and true content ownership.

## 🚀 Live Platform

**🌐 Platform**: [socio3.vercel.app](https://socio3.vercel.app)  
**🔗 Network**: Sepolia Testnet  
**📅 Last Deployment**: January 20, 2026  

## ✨ Key Features

### 🔐 Core Social Features
- **Decentralized Content**: Posts stored on IPFS with metadata secured on Ethereum
- **Wallet-Based Authentication**: No passwords or emails - just connect your wallet
- **Social Interactions**: Like, comment, follow, and tip creators with ETH
- **True Content Ownership**: Users permanently own their posts and profiles
- **Real-Time Experience**: Instant comments and notifications via Firebase

### 🛡️ Advanced Content Moderation
- **5-Category Reporting System**: Spam, Inappropriate Content, Harassment, Copyright, Other
- **Intelligent Auto-Removal**: Smart contract-based content moderation with configurable thresholds
- **Community-Driven**: Report-to-like ratio system for fair content evaluation
- **Admin Dashboard**: Real-time monitoring and manual moderation controls
- **Blockchain Transparency**: All moderation actions permanently recorded on-chain

### 🎁 Seamless Onboarding System
- **Automatic ETH Gifting**: New users receive free Sepolia ETH (0.005 ETH) automatically
- **Pre-Funding Profile Setup**: ETH sent before profile creation to cover gas fees
- **Cross-Device Tracking**: Firebase prevents duplicate gifts across browsers and devices
- **Zero Barriers**: Users can start interacting immediately without external faucets

### 🔍 Discovery & Search
- **Advanced User Search**: Find users by username, display name, bio, or wallet address
- **Trending Creators**: Discover popular creators based on followers and engagement
- **Top Posts**: Explore most-liked and most-tipped content
- **Smart Feed**: Personalized home feed from followed creators

## 🏗️ Architecture

### Smart Contracts (Sepolia Testnet)
| Contract | Address | Purpose |
|----------|---------|---------|
| **PostContract** | `0x5d5C1d313f580027204e04E8D4E3162f37A661CF` | Post creation, reporting, and moderation |
| **SocialContract** | `0xedb788eb4c9D5B0919C9e9c81947B8417FF57788` | Likes, follows, tips, and social interactions |
| **ProfileContract** | `0x314FBc86715eD6a8f07C775e775CD4E61CF903Df` | User profiles and username management |

### Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite, Tailwind CSS | Modern, responsive UI |
| **Web3** | Ethers.js 6.15, MetaMask | Blockchain interactions |
| **Smart Contracts** | Solidity 0.8.28, Hardhat | On-chain logic |
| **Backend** | Firebase Firestore | Real-time data and notifications |
| **Storage** | IPFS (Pinata) | Decentralized media storage |
| **Faucet** | [Sepolia Faucet Service](https://github.com/atharvabaodhankar/sepolia-faucet-service) | Automated ETH distribution |
| **Hosting** | Vercel | Frontend deployment |

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Git

### Quick Start

1. **Clone and Install**
```bash
git clone https://github.com/atharvabaodhankar/socio3.git
cd socio3
npm install
cd frontend && npm install && cd ..
```

2. **Environment Configuration**
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. **Configure Environment Variables**

**Root `.env` (Blockchain & Services):**
```bash
# Blockchain
PRIVATE_KEY=your_deployer_private_key
INFURA_PROJECT_ID=your_infura_project_id

# IPFS/Pinata
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_secret
VITE_PINATA_JWT=your_pinata_jwt
VITE_PINATA_GATEWAY_URL=your_pinata_gateway
VITE_PINATA_GATEWAY_TOKEN=your_gateway_token

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Faucet Service
VITE_FAUCET_API_URL=https://sepolia-faucet-service.vercel.app/api/faucet
VITE_FAUCET_MASTER_PASSWORD=your_master_password
```

**Frontend `.env` (Same variables with VITE_ prefix for client-side access)**

4. **Development**
```bash
# Start frontend development server
cd frontend
npm run dev

# In another terminal - compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

## 🎮 How to Use

### For New Users
1. **Connect Wallet** → Click "Connect Wallet" and approve MetaMask
2. **Get Free ETH** → System automatically detects new users and offers free Sepolia ETH
3. **Create Profile** → Set up username, bio, profile picture, and cover image
4. **Start Exploring** → Browse trending creators and posts
5. **Create Content** → Upload images with captions to share with the community
6. **Engage** → Like posts, follow creators, and tip with your gifted ETH

### For Existing Users
1. **Connect Wallet** → Standard connection, no ETH gift needed
2. **Create Posts** → Go to `/upload`, select image, add caption, and publish
3. **Social Interactions** → Like, comment, follow, and tip other creators
4. **Discover Content** → Use search and explore pages to find new creators
5. **Moderate Content** → Report inappropriate posts using the 5-category system

### For Moderators/Admins
1. **Access Dashboard** → Visit `/admin` (requires contract owner wallet)
2. **Monitor Reports** → View real-time report statistics and details
3. **Review Content** → Check reported posts and removal history
4. **Manual Actions** → Remove posts manually when needed
5. **Adjust Settings** → Modify report thresholds via smart contract functions

## 🛡️ Content Moderation System

### Reporting Categories
1. **🚫 Spam** - Repetitive, promotional, or unwanted content
2. **⚠️ Inappropriate Content** - Offensive, harmful, or NSFW material
3. **👤 Harassment** - Bullying, threats, or targeting individuals
4. **©️ Copyright Violation** - Unauthorized use of copyrighted content
5. **❓ Other** - Violations not covered by other categories

### Automatic Removal Logic

#### Scenario 1: High Report Threshold
- **Condition**: `reports >= 5`
- **Action**: Immediate removal regardless of likes
- **Example**: Any post with 5+ reports gets removed

#### Scenario 2: Low Engagement + Reports
- **Condition**: `likes == 0 && reports >= 3`
- **Action**: Faster removal for unpopular content
- **Example**: Post with 0 likes and 3 reports gets removed

#### Scenario 3: Report-to-Like Ratio
- **Condition**: `reports >= (likes × 2)`
- **Action**: Removal when reports significantly exceed engagement
- **Examples**:
  - 1 like + 2 reports = REMOVED
  - 5 likes + 10 reports = REMOVED
  - 20 likes + 40 reports = REMOVED

### Admin Dashboard Features
Access at `/admin` (contract owner only):
- 📊 **Real-time Statistics** - Report counts, removal rates, trending issues
- 📋 **Report Management** - View all reports with user details and reasons
- 🔧 **Manual Controls** - Remove posts manually with custom reasons
- ⚙️ **Threshold Settings** - Adjust auto-removal parameters
- 📈 **Analytics** - Track moderation effectiveness over time

## 🎁 Welcome Gift & Faucet System

### How It Works
1. **New User Detection** → System checks if user has < 0.001 ETH when creating profile
2. **Automatic ETH Gift** → Sends 0.005 ETH using admin faucet service
3. **Firebase Tracking** → Prevents duplicate gifts across devices and browsers
4. **Seamless Experience** → Users get ETH exactly when they need it for transactions

### Faucet Service Integration
- **Repository**: [sepolia-faucet-service](https://github.com/atharvabaodhankar/sepolia-faucet-service)
- **API Endpoint**: `https://sepolia-faucet-service.vercel.app/api/faucet`
- **Features**: Rate limiting, admin mode, transaction tracking, error handling
- **Security**: Master password authentication, input validation, abuse prevention

### Benefits
- **Zero Onboarding Friction** → New users can start immediately
- **No External Dependencies** → No need to find external faucets
- **Cross-Device Consistency** → Works across browsers and devices
- **Intelligent Distribution** → Only sends ETH to users who actually need it

## 📊 Project Structure

```
socio3/
├── contracts/                    # Smart contracts
│   ├── PostContract.sol         # Post creation, reporting, moderation
│   ├── SocialContract.sol       # Likes, follows, tips
│   └── ProfileContract.sol      # User profiles, usernames
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── pages/               # Route pages (Home, Explore, Profile, etc.)
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # Business logic (Firebase, blockchain, IPFS)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React Context (Web3Context)
│   │   ├── config/              # Configuration files
│   │   └── utils/               # Utility functions
├── ignition/modules/            # Hardhat deployment scripts
├── test/                        # Smart contract tests
├── scripts/                     # Deployment and utility scripts
└── firestore.rules             # Firebase security rules
```

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
npx hardhat test

# Test specific contract
npx hardhat test test/Socio3.js

# Test with gas reporting
REPORT_GAS=true npx hardhat test
```

### Frontend Testing
```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Test build locally
npm run preview
```

### Manual Testing Checklist
- [ ] Connect wallet with MetaMask
- [ ] Create profile (should trigger ETH gift for new users)
- [ ] Upload post with image and caption
- [ ] Like, comment, and tip on posts
- [ ] Follow/unfollow other users
- [ ] Search for users by username
- [ ] Report inappropriate content
- [ ] Check admin dashboard (if owner)

## 🚀 Deployment

### Smart Contracts
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-all.js --network sepolia

# Verify deployment
npx hardhat run scripts/verify-fresh-deployment.js --network sepolia

# Update frontend contract addresses
# (Addresses are auto-updated in frontend/src/config/contracts.js)
```

### Frontend
```bash
cd frontend
npm run build

# Deploy to Vercel (recommended)
vercel --prod

# Or deploy to other platforms using the dist/ folder
```

## 🔐 Security Features

- **Wallet-Based Authentication** → No passwords, no email vulnerabilities
- **Smart Contract Access Controls** → Owner-only functions for critical operations
- **Firebase Security Rules** → Proper read/write permissions
- **IPFS Content Addressing** → Immutable content storage
- **Input Validation** → Comprehensive validation on frontend and contracts
- **Rate Limiting** → Faucet service prevents abuse
- **Cross-Device Tracking** → Prevents duplicate gift exploitation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Submit a pull request with detailed description

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new smart contract functions
- Update documentation for new features
- Test on Sepolia testnet before submitting
- Ensure Firebase security rules are appropriate

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links & Resources

### Project Links
- **Live Platform**: [socio3.vercel.app](https://socio3.vercel.app)
- **GitHub Repository**: [github.com/atharvabaodhankar/socio3](https://github.com/atharvabaodhankar/socio3)
- **Faucet Service**: [github.com/atharvabaodhankar/sepolia-faucet-service](https://github.com/atharvabaodhankar/sepolia-faucet-service)

### Blockchain Explorers
- **PostContract**: [sepolia.etherscan.io/address/0x5d5C1d313f580027204e04E8D4E3162f37A661CF](https://sepolia.etherscan.io/address/0x5d5C1d313f580027204e04E8D4E3162f37A661CF)
- **SocialContract**: [sepolia.etherscan.io/address/0xedb788eb4c9D5B0919C9e9c81947B8417FF57788](https://sepolia.etherscan.io/address/0xedb788eb4c9D5B0919C9e9c81947B8417FF57788)
- **ProfileContract**: [sepolia.etherscan.io/address/0x314FBc86715eD6a8f07C775e775CD4E61CF903Df](https://sepolia.etherscan.io/address/0x314FBc86715eD6a8f07C775e775CD4E61CF903Df)

### Technology Documentation
- [Ethereum](https://ethereum.org/) - Blockchain platform
- [Hardhat](https://hardhat.org/) - Development framework
- [React](https://reactjs.org/) - Frontend framework
- [Ethers.js](https://docs.ethers.io/) - Web3 library
- [IPFS](https://ipfs.io/) - Decentralized storage
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

**Built with ❤️ for the decentralized web**

*Socio3 represents the future of social media - where users own their content, communities moderate themselves, and creators are directly rewarded by their audience. Join us in building a more open, transparent, and creator-friendly social platform.*