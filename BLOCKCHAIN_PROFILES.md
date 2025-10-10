# Blockchain Profile System

## 🚀 Overview
Socio3 now uses a decentralized profile system that stores profile data on the blockchain and IPFS, ensuring true ownership and permanence of user profiles.

## 🏗️ Architecture

### Smart Contract: ProfileContract
- **Address**: `0x08A915445A77Fe63aD1c57a8A6034F3159A7fcD2`
- **Network**: Sepolia Testnet
- **Purpose**: Manages usernames and IPFS hashes for profile data

### Data Storage
- **Blockchain**: Usernames, IPFS hashes, timestamps
- **IPFS**: Profile images, cover images, bio, social links
- **Pinata**: IPFS pinning service for reliable access

## ✨ Features

### 1. Unique Usernames
- 3-20 characters (letters, numbers, underscores)
- Blockchain-enforced uniqueness
- Real-time availability checking
- Username-to-address mapping

### 2. Decentralized Profile Data
- Profile images stored on IPFS
- Cover images stored on IPFS
- Bio, website, Twitter links in JSON on IPFS
- Immutable profile history on blockchain

### 3. Enhanced User Experience
- **Comments show usernames** instead of wallet addresses
- **Profile pictures** displayed throughout the app
- **Real-time username validation**
- **Seamless editing** with blockchain confirmation

## 🎯 Profile Structure

### Blockchain Data
```solidity
struct Profile {
    string ipfsHash;        // IPFS hash containing profile data
    uint256 timestamp;      // When profile was created/updated
    bool exists;           // Whether profile exists
}
```

### IPFS JSON Data
```json
{
  "username": "alice_crypto",
  "displayName": "Alice Johnson", 
  "bio": "Web3 developer and NFT artist",
  "website": "https://alice.dev",
  "twitter": "alice_crypto",
  "profileImage": "QmProfileImageHash...",
  "coverImage": "QmCoverImageHash..."
}
```

## 🔧 Smart Contract Functions

### Core Functions
- `createProfile(ipfsHash, username)` - Create new profile
- `updateProfile(ipfsHash)` - Update profile data
- `updateUsername(newUsername)` - Change username
- `getProfile(user)` - Get profile data
- `getUsername(user)` - Get username by address
- `isUsernameAvailable(username)` - Check availability

### View Functions
- `hasProfile(user)` - Check if user has profile
- `getUserByUsername(username)` - Get address by username

## 🎨 UI Components

### EditProfileModal
- **Profile image upload** to IPFS via Pinata
- **Cover image upload** to IPFS via Pinata
- **Username validation** with real-time checking
- **Bio and social links** editing
- **Blockchain transaction** confirmation

### Profile Display
- **Username-based display names** throughout app
- **Profile images** in avatars and comments
- **Cover images** on profile pages
- **Social links** with proper formatting

## 💡 Benefits

### For Users
- **True ownership** of profile data
- **Permanent usernames** that can't be taken away
- **Decentralized storage** - no single point of failure
- **Cross-platform compatibility** - use anywhere

### For Developers
- **Immutable user identity** across dApps
- **Reliable username system** with blockchain guarantees
- **Rich profile data** with images and metadata
- **Easy integration** with existing Web3 apps

## 🔒 Security Features

- **Wallet-based authentication** - only profile owner can edit
- **Username uniqueness** enforced by smart contract
- **IPFS content addressing** - tamper-proof data storage
- **Blockchain immutability** - permanent record of changes

## 🚀 Usage Examples

### Creating a Profile
1. Click "Edit Profile" button
2. Choose username (3-20 chars)
3. Upload profile/cover images
4. Add bio and social links
5. Confirm blockchain transaction
6. Profile is live and decentralized!

### Viewing Profiles
- Usernames appear in comments instead of addresses
- Profile images show in avatars
- Rich profile pages with all user data
- Social links are clickable and verified

## 🌐 Integration

The profile system integrates seamlessly with:
- **Comments system** - shows usernames
- **Post display** - shows profile images
- **Social interactions** - enhanced user identity
- **Cross-dApp compatibility** - use profiles anywhere

Your Web3 identity is now truly decentralized and owned by you! 🎉