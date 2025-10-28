# 🎨 Socio3 - Decentralized Social Media Platform

A Web3-powered social media dApp inspired by Instagram, built with React, Ethereum smart contracts, and IPFS storage. Features advanced content moderation, automatic post removal, and comprehensive reporting system.

## 🚀 Features

### 🔐 Core Features
- **Decentralized Content**: Posts stored on IPFS with metadata on Ethereum
- **Wallet-based Authentication**: No passwords, just connect your wallet
- **Crypto Tipping**: Support creators with ETH tips
- **True Ownership**: Users own their content permanently
- **Social Features**: Follow, like, and interact with creators

### 🛡️ Advanced Moderation System
- **5-Category Reporting**: Spam, Inappropriate Content, Harassment, Copyright, Other
- **Automatic Post Removal**: Smart contract-based content moderation
- **Report-to-Like Ratio**: Intelligent removal based on community feedback
- **Admin Dashboard**: Real-time monitoring and manual controls
- **Blockchain Transparency**: All moderation actions recorded on-chain

### 📊 Auto-Deletion Logic
- **High Reports**: 5+ reports = automatic removal
- **Low Engagement**: 0 likes + 3 reports = removal
- **Report Ratio**: Reports ≥ (Likes × 2) = removal
- **User Notifications**: Authors notified when posts are removed

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

3. **Fresh deployment with reporting system**
```bash
npx hardhat run scripts/deployFresh.js --network sepolia
```

## 📍 Current Deployment (Sepolia Testnet)

**Deployment Date:** October 28, 2025  
**Network:** Sepolia Testnet  

### Contract Addresses
| Contract | Address | Etherscan |
|----------|---------|-----------|
| **PostContract** | `0x1C4C0Eff199Af5C97d3DC723E91a56382fD52067` | [View](https://sepolia.etherscan.io/address/0x1C4C0Eff199Af5C97d3DC723E91a56382fD52067) |
| **SocialContract** | `0x9CE41910E2d80D4e33a64bc295e6C953450C0D41` | [View](https://sepolia.etherscan.io/address/0x9CE41910E2d80D4e33a64bc295e6C953450C0D41) |

### New Features Deployed
- ✅ Advanced reporting system with 5 categories
- ✅ Automatic post removal based on community reports
- ✅ Admin dashboard for content moderation
- ✅ Blockchain-based transparency for all actions
- ✅ User notifications for removed content

## 🛡️ Content Moderation System

### Reporting Categories
1. **🚫 Spam** - Repetitive or unwanted content
2. **⚠️ Inappropriate Content** - Offensive or harmful material
3. **👤 Harassment** - Bullying or targeting individuals
4. **©️ Copyright Violation** - Unauthorized use of copyrighted content
5. **❓ Other** - Violations not covered by other categories

### Auto-Deletion Logic

#### Scenario 1: High Report Threshold
- **Condition**: `reports >= 5`
- **Action**: Immediate removal
- **Example**: Any post with 5+ reports gets removed regardless of likes

#### Scenario 2: Low Engagement + Reports
- **Condition**: `likes == 0 && reports >= 3`
- **Action**: Faster removal for unpopular content
- **Example**: Post with 0 likes and 3 reports gets removed

#### Scenario 3: Report-to-Like Ratio
- **Condition**: `reports >= (likes × 2)`
- **Action**: Removal when reports significantly exceed likes
- **Examples**:
  - 1 like + 2 reports = REMOVED
  - 2 likes + 4 reports = REMOVED
  - 10 likes + 20 reports = REMOVED

### User Notifications
When a post is removed, the author receives:
- 📧 **Notification** explaining the removal reason
- 📊 **Report Statistics** showing report count and types
- 🔗 **Appeal Process** (future feature)
- 📋 **Community Guidelines** reminder

### Admin Features
Access the admin dashboard at `/admin` (contract owner only):
- 📊 **Real-time Statistics** - Total reports, pending reviews, removed posts
- 📋 **Report Management** - View all reports with details
- 🔧 **Manual Controls** - Remove posts manually if needed
- ⚙️ **Threshold Settings** - Adjust auto-removal parameters

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

## 🎮 How to Use

### For Users
1. **Connect Wallet** - Click "Connect Wallet" and approve MetaMask connection
2. **Create Posts** - Go to `/upload`, select image, add caption, and publish
3. **Social Interactions** - Like posts, follow users, send tips
4. **Report Content** - Click three dots (⋮) on any post → "Report Post" → Select category
5. **Share Posts** - Use share button to copy links or share on social media

### For Content Creators
1. **Upload Content** - High-quality images with engaging captions perform best
2. **Build Following** - Engage with community, follow others, create consistently
3. **Earn Tips** - Quality content attracts tips from supporters
4. **Monitor Performance** - Check your profile for likes, follows, and tips received

### For Moderators/Admins
1. **Access Dashboard** - Visit `/admin` (requires contract owner wallet)
2. **Monitor Reports** - View real-time report statistics and details
3. **Manual Actions** - Remove posts manually when needed
4. **Adjust Settings** - Modify report thresholds via smart contract functions

### Reporting Process
1. **Find Problematic Content** - Navigate to the post you want to report
2. **Open Options Menu** - Click the three dots (⋮) in the top-right of the post
3. **Select Report** - Choose "Report Post" (only available for others' posts)
4. **Choose Category** - Select from 5 report types with descriptions
5. **Confirm Report** - Transaction sent to blockchain, report logged
6. **Automatic Review** - System checks if post should be auto-removed

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
