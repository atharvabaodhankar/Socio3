# 🎨 DESIGN.md  
## Project: Socio3 – A Web3-Powered Social Media dApp  

### 🧩 Overview
**Socio3** is a decentralized social media platform inspired by Instagram — reimagined for Web3.  
It allows users to share posts, follow creators, tip in crypto, and truly **own** their digital content through blockchain-powered storage and smart contracts.

Socio3 merges the familiar feel of social networks with the transparency, security, and ownership benefits of decentralization.

---

## 🧱 1. System Architecture

### **Frontend**
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS + Framer Motion
- **Web3 Library:** Ethers.js
- **Wallet Integration:** MetaMask / WalletConnect
- **Routing:** React Router DOM
- **Hosting:** Vercel or Firebase Hosting

### **Backend / Off-chain**
- **Database:** Firebase Firestore (real-time comments, notifications, and temporary caching)
- **Storage:** IPFS via Pinata or Web3.Storage (for media uploads)
- **Authentication:** Wallet-based login (no passwords, no email)
- **Functions:** Firebase Cloud Functions for triggering notifications and post updates

### **Blockchain Layer**
- **Smart Contract Framework:** Hardhat
- **Language:** Solidity
- **Network:** Sepolia Testnet
- **Core Contracts:**
  1. `PostContract.sol` → stores post metadata (author, IPFS CID, timestamp)
  2. `SocialContract.sol` → handles follows, likes, tips, and ownership logic
- **Interaction:** via Ethers.js in React frontend

---

## 🎨 2. UI/UX Design

### **Design Principles**
- Minimal, responsive, and visually similar to Instagram’s clean aesthetic.  
- Dark-first interface with smooth transitions and gradients.  
- Framer Motion for micro-interactions (like button animations, modals).  
- Emphasis on wallet-based identity and decentralization transparency.  

---

## 🧭 3. User Flow

1. **Connect Wallet**
   - User connects via MetaMask or WalletConnect.
   - On first login, Socio3 creates a wallet-linked profile in Firestore.

2. **Create Post**
   - User uploads an image/video (stored on IPFS).
   - Adds caption, hashtags → stored in Firestore.
   - The IPFS hash and wallet address are written to the blockchain.

3. **View Feed**
   - Posts are fetched from Firestore (metadata verified via blockchain).
   - Feed is ordered by time, likes, or tips.
   - Users can interact with posts in real-time.

4. **Interactions**
   - Like/Unlike → handled through SocialContract.
   - Comments → stored in Firestore (for speed).
   - Tip → sends ETH directly to creator via Ethers.js.

5. **Profile**
   - Displays wallet-based username, posts, tips earned, and follower count.

---

## 🖥️ 4. UI Screens

| Screen | Description |
|---------|--------------|
| **Home Feed** | Scrollable grid feed showing posts from followed creators. |
| **Explore** | Discover trending or most-tipped posts. |
| **Upload** | Form to upload image/video, caption, and publish. |
| **Profile** | User info, bio, avatar, posts grid, and stats. |
| **Post Details** | Post view with comments, tip option, and on-chain data. |
| **Wallet Page** | Wallet address, balance, NFTs, tips received. |

---

## 🧩 5. Components Overview

| Component | Purpose |
|------------|----------|
| `Navbar.jsx` | Navigation bar (Home, Explore, Upload, Profile, Wallet) |
| `PostCard.jsx` | Displays post image/video, caption, and like/tip actions |
| `UploadModal.jsx` | IPFS file upload + post creation interface |
| `ConnectWalletButton.jsx` | Handles MetaMask connection and address display |
| `TipModal.jsx` | Send ETH tips to creators |
| `ProfileHeader.jsx` | Displays wallet info and stats |
| `CommentSection.jsx` | Real-time comments (Firestore) |
| `Loader.jsx` | Universal loading animation |

---

## ⚙️ 6. Smart Contract Design

### **PostContract.sol**
Handles creation and retrieval of posts.

```solidity
struct Post {
    address author;
    string ipfsHash;
    uint256 timestamp;
}
````

Functions:

* `createPost(string memory ipfsHash)`
* `getPost(uint256 id)`
* `getAllPosts()`

### **SocialContract.sol**

Manages likes, follows, and tips.

```solidity
mapping(address => mapping(address => bool)) public following;
mapping(uint256 => uint256) public tips;
```

Functions:

* `followUser(address user)`
* `likePost(uint256 postId)`
* `tipPost(uint256 postId) payable`

---

## 💡 7. Color Palette & Design Language

| Element    | Color                                | Description                           |
| ---------- | ------------------------------------ | ------------------------------------- |
| Primary    | `#4F46E5`                            | Web3 violet-blue accent               |
| Background | `#0F172A` (dark) / `#F9FAFB` (light) | Clean contrast                        |
| Accent     | `#F472B6`                            | Interactive highlights (like, follow) |
| Success    | `#10B981`                            | Confirmation/tips                     |
| Error      | `#EF4444`                            | Warnings or errors                    |

Font: **Inter / Poppins**
Icons: **Lucide React**
Animations: **Framer Motion (fade-in, pop, hover effects)**

---

## 🔐 8. Security Considerations

* Verify wallet signatures for sensitive operations.
* Validate and sanitize captions before uploading.
* Use contract modifiers for access control (e.g., only author can delete post).
* Pin all IPFS uploads for permanence.
* Rate-limit posting via Firebase functions to prevent spam.

---

## 📱 9. Responsive Layout

| Device  | Layout                                                   |
| ------- | -------------------------------------------------------- |
| Mobile  | 1-column feed with bottom nav                            |
| Tablet  | 2-column feed layout                                     |
| Desktop | 3-column layout with sidebar for Explore & Notifications |

---

## 🚀 10. Future Enhancements

* DAO-based community moderation system.
* NFT minting for premium posts.
* AI-powered personalized feed.
* End-to-end encrypted wallet-to-wallet messaging.
* Lens Protocol integration for decentralized identity sync.

---

## 🧠 Summary

**Socio3** redefines social networking by combining:

* Familiar user experience (like Instagram)
* True content ownership (via IPFS + Ethereum)
* Instant interactions (via Firebase)
* Creator monetization (via tipping & NFTs)

Built for the next era of social media — transparent, decentralized, and user-owned.


