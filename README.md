# Socio3 - Decentralized Social Media Platform

A production-grade Web3 social media platform that merges traditional social networking features with blockchain technology. Built as a fully decentralized application (dApp), Socio3 provides users with true content ownership, transparent moderation, and direct creator monetization through Ethereum smart contracts.

## 📌 Project Overview

### Problem Statement

Traditional social media platforms suffer from:
- **Centralized Control**: Platforms own user-generated content and can arbitrarily remove or censor it
- **Opaque Moderation**: Content removal decisions lack transparency and user accountability
- **Platform Lock-in**: Users cannot migrate their content and social graphs
- **Indirect Creator Revenue**: Creators rely on platform-controlled monetization with high fees
- **Data Privacy**: User data is controlled and monetized by corporations

### Solution

Socio3 addresses these issues through:

**Decentralized Content Storage**: Posts are stored on IPFS with metadata secured on Ethereum, ensuring permanent ownership and censorship resistance.

**Transparent Blockchain Moderation**: Community-driven reporting with on-chain moderation logic. All moderation actions are publicly auditable via smart contract events.

**Direct Creator Monetization**: ETH-based tipping system where 100% of tips go directly to creators with zero platform fees.

**Wallet-Based Identity**: No passwords, emails, or KYC - users control their identity through their Ethereum wallet.

**Frictionless Onboarding**: Automated ETH gifting system eliminates gas fee barriers for new users on Sepolia testnet.

### What Makes This Project Unique

- **Hybrid Architecture**: Combines blockchain immutability for critical data (posts, follows, likes) with Firebase for real-time features (comments, notifications, online status)
- **Smart Contract Moderation**: Algorithmic content moderation executed on-chain with configurable thresholds and report-to-like ratios
- **Seamless UX**: Despite being fully decentralized, provides Instagram-like user experience with instant feedback
- **Cross-Device Anti-Fraud**: Firebase-based tracking prevents ETH gift exploitation across browsers and devices
- **Gas-Optimized Contracts**: Efficient data structures and minimal on-chain storage reduce transaction costs

---

## 🏗️ System Architecture

### Architecture Overview

Socio3 implements a hybrid architecture that strategically distributes functionality across four distinct layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  React SPA   │  │  MetaMask    │  │  Ethers.js   │          │
│  │  (Vite +     │─▶│  Wallet      │◀─│  Web3 Client │          │
│  │   React 19)  │  │  Integration │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API/SERVICE LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Firebase    │  │  IPFS        │  │  Sepolia RPC │          │
│  │  Firestore   │  │  (Pinata)    │  │  (Infura)    │          │
│  │  Real-time   │  │  Gateway     │  │  Endpoint    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostContract │  │SocialContract│  │ProfileContract│         │
│  │              │  │              │  │              │          │
│  │ • Posts      │  │ • Follows    │  │ • Profiles   │          │
│  │ • Reports    │  │ • Likes      │  │ • Usernames  │          │
│  │ • Moderation │  │ • Tips       │  │ • IPFS Hash  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                 Sepolia Testnet (EVM)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Ethereum    │  │  IPFS        │  │  Firebase    │          │
│  │  State       │  │  Content     │  │  Documents   │          │
│  │              │  │              │  │              │          │
│  │ • Post IDs   │  │ • Images     │  │ • Comments   │          │
│  │ • Social     │  │ • Profile    │  │ • Notifications│         │
│  │   Graph      │  │   Data       │  │ • User Status│          │
│  │ • Reports    │  │ • Metadata   │  │ • ETH Gifts  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Descriptions

#### 1. Client Layer

**Components**:
- React 19 Single Page Application
- MetaMask wallet integration via browser extension
- Ethers.js v6 for smart contract interaction
- Tailwind CSS for responsive styling

**Responsibilities**:
- User interface rendering and interaction
- Wallet connection management
- Transaction signing and submission
- Local state management
- Client-side validation

**Security Boundaries**:
- All blockchain transactions require explicit user approval via MetaMask
- Private keys never leave the browser extension
- Frontend validates inputs before sending transactions
- IPFS gateway uses authenticated tokens

#### 2. API/Service Layer

**Firebase Firestore**:
- **Purpose**: Real-time data synchronization
- **Data Stored**: Comments, notifications, user online status, ETH gift tracking
- **Access Pattern**: Direct client SDK connections with security rules
- **Scalability**: Auto-scaling NoSQL database

**IPFS (Pinata)**:
- **Purpose**: Decentralized content storage
- **Data Stored**: Post images, profile pictures, cover images, metadata JSON
- **Access Pattern**: Upload via Pinata API, retrieve via authenticated gateway
- **Persistence**: Content pinned to prevent garbage collection

**Sepolia RPC (Infura)**:
- **Purpose**: Ethereum testnet connectivity
- **Access Pattern**: Read operations via Infura, write operations via MetaMask
- **Rate Limiting**: Managed through Infura project quotas

#### 3. Business Logic Layer (Smart Contracts)

**PostContract** (`0x5d5C1d313f580027204e04E8D4E3162f37A661CF`):
- Post creation and storage
- Report submission and tracking
- Automatic moderation logic
- Manual admin removal

**SocialContract** (`0xedb788eb4c9D5B0919C9e9c81947B8417FF57788`):
- Follow/unfollow operations
- Like/unlike posts
- ETH tip transfers
- Social graph queries

**ProfileContract** (`0x314FBc86715eD6a8f07C775e775CD4E61CF903Df`):
- Profile creation and updates
- Username registration and mapping
- Username availability checks

**Why Three Separate Contracts?**
- **Modularity**: Independent upgrades and testing
- **Gas Optimization**: Users only interact with needed contracts
- **Security**: Limits attack surface per contract
- **Clear Separation of Concerns**: Easier auditing and maintenance

#### 4. Data Storage Layer

**Ethereum State** (On-Chain):
- Post IDs and author addresses
- Social graph (follows, likes)
- Report counts and types
- Tips received
- Profile IPFS hash references

**IPFS** (Off-Chain, Content-Addressed):
- Media files (images)
- Metadata JSON (captions, profile data)
- Permanent content storage via content hashing

**Firebase Firestore** (Off-Chain, Traditional DB):
- Comments (real-time updates)
- Notifications (ephemeral data)
- User online/offline status
- ETH gift tracking (anti-fraud)

### Component Communication

#### Frontend ↔ Smart Contracts
```
User Action → Frontend Validation → MetaMask Popup → Transaction Signing 
→ Ethers.js Send → Infura RPC → Sepolia Network → Smart Contract Execution 
→ Event Emission → Frontend Listener → UI Update
```

#### Frontend ↔ IPFS
```
Media Upload → Pinata API (multipart/form-data) → IPFS Network → Content Hash 
→ Store Hash in Smart Contract → Retrieve via Gateway URL
```

#### Frontend ↔ Firebase
```
User Action → Firebase SDK → Firestore REST API → Real-time Listener 
→ WebSocket Update → UI Refresh
```

### Security Boundaries

**Wallet Level**: Private keys isolated in MetaMask, never exposed to application

**Smart Contract Level**: Access control modifiers (`onlyOwner`), input validation, reentrancy protection

**API Level**: Firebase security rules limit read/write access, IPFS gateway authentication

**Network Level**: HTTPS for all API calls, authenticated RPC endpoints

---

## 🔁 Application Flow

### 1. User Authentication Flow

**New User (No Wallet)**:
```
1. User visits socio3.vercel.app
2. Frontend detects no Web3 provider
3. Display "Install MetaMask" prompt
4. User installs MetaMask extension
5. User creates wallet and secret recovery phrase
6. User clicks "Connect Wallet" button
7. MetaMask popup requests permission
8. User approves connection
9. Frontend receives wallet address via window.ethereum.request()
10. Check ProfileContract.hasProfile(address) → false
11. Redirect to profile creation page
```

**Existing User**:
```
1. User clicks "Connect Wallet"
2. MetaMask shows list of accounts
3. User selects account and approves
4. Frontend receives address
5. Check ProfileContract.hasProfile(address) → true
6. Fetch profile IPFS hash from ProfileContract
7. Retrieve profile JSON from IPFS gateway
8. Load posts from PostContract.getPostsByAuthor()
9. Display user's home feed
```

**Technical Details**:
- Connection uses EIP-1193 provider API (`window.ethereum`)
- Account changes detected via `accountsChanged` event
- Network changes handled via `chainChanged` event
- Connection persisted in React Context (`Web3Context`)

### 2. Profile Creation Flow

```
1. User fills profile form:
   - Username (3-20 chars)
   - Display name
   - Bio
   - Profile picture (file upload)
   - Cover image (file upload)

2. Frontend validates inputs:
   - Check username regex: ^[a-zA-Z0-9_]+$
   - Check ProfileContract.isUsernameAvailable(username)
   - Validate image types (JPEG, PNG, WebP)

3. Check user balance:
   - Query: await provider.getBalance(address)
   - If balance < 0.001 ETH → Trigger ETH gift

4. ETH Gift Flow (if needed):
   - Query Firebase: users/{address}/ethGiftReceived
   - If false → Call faucet API with master password
   - Transaction: Faucet sends 0.005 ETH to user
   - Wait for transaction confirmation (3 blocks)
   - Update Firebase: ethGiftReceived = true
   - Show success notification

5. Upload images to IPFS:
   a. Profile picture:
      - Resize to 400x400px (client-side)
      - POST to Pinata API /pinning/pinFileToIPFS
      - Receive IPFS hash (e.g., QmXxxx...)
   
   b. Cover image:
      - Resize to 1200x400px
      - POST to Pinata API
      - Receive IPFS hash

6. Create metadata JSON:
   {
     "username": "johndoe",
     "displayName": "John Doe",
     "bio": "Web3 enthusiast",
     "profilePicture": "ipfs://QmProfile...",
     "coverImage": "ipfs://QmCover...",
     "createdAt": 1737715200000
   }

7. Upload metadata to IPFS:
   - POST JSON to Pinata
   - Receive metadata hash (QmMeta...)

8. Create profile on blockchain:
   - Call: ProfileContract.createProfile(metadataHash, username)
   - Gas estimation: ~150,000 - 200,000 gas
   - User signs transaction in MetaMask
   - Wait for confirmation (1 block on Sepolia ≈ 12s)
   - Event: ProfileCreated(address, ipfsHash, username, timestamp)

9. Store in Firebase:
   - Document: users/{address}
   - Data: {username, displayName, profileCreatedAt, ethGiftReceived}

10. Redirect to profile page
```

**Error Handling**:
- Insufficient Gas: Show balance and link to faucet
- Username Taken: Real-time validation during typing
- IPFS Upload Failure: Retry with exponential backoff
- Transaction Revert: Parse error message and show user-friendly explanation

### 3. Post Creation Flow

```
1. User navigates to /upload page

2. Select image:
   - <input type="file" accept="image/*">
   - Display image preview
   - Validate file size < 10MB
   - Validate dimensions (min 320x320, max 4096x4096)

3. Write caption:
   - Max 2000 characters
   - Client-side character counter
   - Support line breaks and emojis

4. Click "Post" button

5. Image upload to IPFS:
   - Compress image to target size (~1MB) using browser canvas API
   - Create FormData with image file
   - POST to Pinata API with authorization header
   - Receive image hash: QmImageHash...
   - Show upload progress (0-50%)

6. Create post metadata JSON:
   {
     "caption": "Amazing sunset! 🌅",
     "imageUrl": "ipfs://QmImageHash...",
     "timestamp": 1737715200000,
     "version": "1.0"
   }

7. Upload metadata to IPFS:
   - POST metadata JSON to Pinata
   - Receive metadata hash: QmMetaHash...
   - Show upload progress (50-70%)

8. Blockchain transaction:
   - Call: PostContract.createPost(QmMetaHash...)
   - Gas estimation: ~80,000 - 120,000 gas
   - User approves in MetaMask
   - Transaction submitted to mempool
   - Show pending status (70-90%)

9. Wait for confirmation:
   - Listen for transaction receipt
   - On success: Event PostCreated(postId, author, ipfsHash, timestamp)
   - Extract postId from event logs
   - Show upload progress (90-100%)

10. Create Firebase document:
    - Collection: posts/{postId}
    - Data: {
        authorAddress,
        caption,
        createdAt,
        commentsCount: 0
      }

11. Redirect to home feed:
    - Show success notification
    - New post appears at top of feed
```

**Technical Implementation**:
- Image compression: Uses HTML5 Canvas API to resize and compress
- IPFS pinning: Content permanently stored via Pinata pinning service
- Transaction monitoring: Ethers.js `.wait()` method until 1 confirmation
- Optimistic UI: Show post immediately with "pending" indicator

### 4. Social Interaction Flow

#### Like Flow
```
1. User views post in feed

2. Click heart icon

3. Frontend checks:
   - Current like status: SocialContract.hasUserLiked(postId, address)
   - If already liked → Unlike flow
   - If not liked → Proceed

4. Optimistic UI update:
   - Immediately toggle heart to filled/red
   - Increment like counter
   - Disable button during transaction

5. Blockchain transaction:
   - Call: SocialContract.likePost(postId)
   - Gas: ~45,000 - 65,000
   - User approves in MetaMask
   - Transaction confirmed

6. Event handling:
   - Listen for: PostLiked(postId, liker)
   - On success: Keep optimistic UI
   - On failure: Revert UI changes

7. Create notification:
   - Firebase: notifications/{postAuthorAddress}
   - Data: {
       type: "like",
       fromUser: likerAddress,
       postId: postId,
       timestamp: now(),
       read: false
     }

8. Real-time update:
   - Post author receives instant notification
   - Notification badge increments
```

#### Follow Flow
```
1. User clicks "Follow" on profile

2. Frontend validation:
   - Cannot follow yourself
   - Check current status: SocialContract.isFollowing(currentUser, targetUser)

3. Optimistic UI:
   - Change button to "Following"
   - Increment follower count
   - Disable button temporarily

4. Blockchain transaction:
   - Call: SocialContract.followUser(targetAddress)
   - Gas: ~60,000 - 80,000
   - User approves

5. Smart contract execution:
   - Update: following[follower][followed] = true
   - Increment: followerCount[followed]++
   - Increment: followingCount[follower]++
   - Emit: UserFollowed(follower, followed)

6. Firebase notification:
   - Create notification for followed user
   - Type: "follow"
   - Include follower's username and profile picture

7. Update home feed:
   - Followed user's posts now appear in feed
   - Sorted by timestamp descending
```

#### Tip Flow
```
1. User clicks tip icon on post

2. Modal opens with ETH amount input:
   - Suggested amounts: 0.001, 0.005, 0.01 ETH
   - Custom amount option
   - Display current balance

3. User enters amount and confirms

4. Validate:
   - Amount > 0
   - Balance >= amount + gas estimate
   - Post author ≠ current user

5. Blockchain transaction:
   - Call: SocialContract.tipPost(postId, authorAddress)
   - Send ETH: {value: ethers.parseEther(amount)}
   - Gas: ~50,000 - 70,000
   - User approves transaction including ETH transfer

6. Smart contract execution:
   - Receive ETH: msg.value
   - Update: tips[postId] += msg.value
   - Update: totalTipsReceived[author] += msg.value
   - Transfer: payable(author).transfer(msg.value)
   - Emit: PostTipped(postId, tipper, author, amount)

7. Transaction confirmation:
   - Wait for block inclusion
   - On success: Show success toast
   - On failure: Funds automatically refunded

8. Firebase notification:
   - Type: "tip"
   - Include: tipper address, amount in ETH, post preview
   - Author receives real-time notification

9. UI updates:
   - Update post tip count
   - Update author's total tips received
   - Show tip animation (coin dropping)
```

### 5. Content Discovery Flow

#### Search Flow
```
1. User types in search bar on /search page

2. Real-time search (debounced 300ms):
   - Frontend maintains local cache of all users
   - Filter operation on:
     a. Username (exact and partial match)
     b. Display name (case-insensitive)
     c. Bio text
     d. Wallet address (exact match)

3. Fetch user data:
   - Get all profiles from Firebase: users collection
   - For each profile, retrieve IPFS metadata
   - Cache results for 5 minutes

4. Display results:
   - Show profile picture, username, display name
   - Highlight matching text
   - Show follower count from SocialContract
   - Show follow button with current status

5. Click user → Navigate to /profile/{address}
```

#### Explore Flow
```
1. User navigates to /explore

2. Backend query (Firebase + Blockchain):
   - Get trending creators:
     a. Query Firebase: Order by followerCount DESC
     b. Get top 20 users
     c. For each, fetch IPFS profile data
   
   - Get top posts:
     a. Get all posts from PostContract.getAllPosts()
     b. For each post, get likes: SocialContract.getLikesCount(postId)
     c. Sort by likes DESC
     d. Take top 20
     e. Fetch IPFS metadata for each

3. Infinite scroll:
   - Load 10 posts initially
   - On scroll near bottom:
     - Fetch next 10 posts
     - Append to feed
   - Continue until all posts loaded

4. Click post → Navigate to /post/{postId}/{authorAddress}
```

### 6. Content Moderation Flow

#### User Report Flow
```
1. User clicks "Report" menu on post

2. Modal displays 5 report categories:
   1. Spam
   2. Inappropriate Content
   3. Harassment
   4. Copyright Violation
   5. Other

3. User selects category and optionally adds reason text

4. Frontend validation:
   - Check: PostContract.hasReported[postId][userAddress]
   - If true: Show "Already reported" error
   - If false: Proceed

5. Blockchain transaction:
   - Call: PostContract.reportPost(postId, categoryType, reason)
   - Gas: ~85,000 - 110,000
   - User approves

6. Smart contract execution:
   - Add to: postReports[postId][] array
   - Mark: hasReported[postId][reporter] = true
   - Increment: reportCounts[postId]++
   - Emit: PostReported(postId, reporter, type, reason)

7. Automatic moderation check:
   - Internal call to _checkAutoRemoval(postId)
   - Get likes: SocialContract.getLikesCount(postId)
   - Get reports: reportCounts[postId]
   
   - Scenario 1: reports >= 5
     → Remove immediately
   
   - Scenario 2: likes == 0 && reports >= 3
     → Remove due to low engagement
   
   - Scenario 3: reports >= (likes * 2)
     → Remove due to report-to-like ratio
     → Example: 10 likes, 20 reports → REMOVED

8. If auto-removed:
   - Update: posts[postId].isRemoved = true
   - Set: posts[postId].removalReason = "Auto-removed: [reason]"
   - Emit: PostRemoved(postId, author, reason)
   - Frontend filters out removed posts

9. Firebase tracking:
   - Log report in: moderation/reports/{reportId}
   - Update post status in: posts/{postId}/isRemoved
```

#### Admin Manual Removal Flow
```
1. Admin navigates to /admin dashboard

2. Dashboard displays:
   - Total posts count
   - Total reports count
   - Recent reports (last 50)
   - Report breakdown by category (pie chart)
   - Posts pending review (high report count)

3. Admin reviews flagged post:
   - View post image from IPFS
   - Read caption
   - See report count and reasons
   - Check reporter addresses
   - View like/comment activity

4. Admin decides to remove:
   - Clicks "Remove Post" button
   - Enters custom removal reason
   - Confirms action

5. Blockchain transaction:
   - Call: PostContract.manuallyRemovePost(postId, customReason)
   - Modifier: onlyOwner (checks msg.sender == owner)
   - Gas: ~50,000 - 70,000
   - Admin approves

6. Smart contract execution:
   - Update: posts[postId].isRemoved = true
   - Set: posts[postId].removalReason = customReason
   - Emit: PostRemoved(postId, author, customReason)

7. Frontend updates:
   - Post disappears from all feeds
   - Shows "Content Removed" placeholder on direct link
   - Admin dashboard updates statistics
```

### 7. Real-Time Comments Flow

```
1. User clicks comment icon on post

2. Comment modal opens:
   - Load existing comments from Firebase
   - Query: posts/{postId}/comments ORDER BY timestamp DESC
   - Display in chronological order

3. User types comment:
   - Max 500 characters
   - Character counter updates
   - Enter key submits (Shift+Enter for new line)

4. Submit comment:
   - No blockchain transaction (Firebase only)
   - Create document: posts/{postId}/comments/{commentId}
   - Data: {
       userId: currentUserAddress,
       username: currentUsername,
       text: commentText,
       timestamp: serverTimestamp(),
       likes: 0
     }

5. Real-time update:
   - Firebase onSnapshot listener active
   - New comment appears instantly for all viewers
   - No page refresh needed

6. Notification:
   - Create: notifications/{postAuthorAddress}/{notifId}
   - Type: "comment"
   - Include: commenter username, comment preview, post ID
   - Real-time delivery via Firebase

7. Comment persistence:
   - Stored in Firebase (not blockchain)
   - Pros: Instant updates, no gas costs, deletable
   - Cons: Centralized, not immutable
   - Design decision: Comments are ephemeral social interaction, not core content
```

### 8. Error Handling Flow

#### Network Error
```
1. User submits transaction while offline

2. Frontend detects:
   - navigator.onLine = false
   - OR fetch() request fails

3. UI response:
   - Show offline banner at top of page
   - Disable all blockchain interaction buttons
   - Show cached content from local storage
   - Display retry button

4. When back online:
   - Auto-retry pending transactions
   - Refresh blockchain data
   - Hide offline banner
```

#### Transaction Failure
```
1. User submits transaction

2. MetaMask rejects OR gas estimation fails

3. Frontend catches error:
   - Ethers.js throws error with reason
   - Parse error message:
     - "user rejected transaction"
     - "insufficient funds"
     - "execution reverted: [reason]"

4. UI response:
   - Revert optimistic UI updates
   - Show error toast with specific message
   - For "insufficient funds": Link to faucet
   - For contract revert: Show contract error reason
   - Log error to console for debugging

5. User options:
   - Retry transaction
   - Cancel action
   - Adjust gas price (if network congested)
```

#### IPFS Upload Failure
```
1. Image upload to Pinata fails

2. Frontend handles:
   - Retry with exponential backoff (3 attempts)
   - Attempt 1: Immediate retry
   - Attempt 2: Wait 2 seconds
   - Attempt 3: Wait 4 seconds

3. If all retries fail:
   - Show error: "Upload failed. Please try again."
   - Provide "Retry Upload" button
   - Optionally: Save form data to localStorage
   - Allow user to resume later

4. Fallback:
   - If Pinata down, use alternative IPFS gateway
   - Environment variable: VITE_IPFS_FALLBACK_GATEWAY
```

---

## 🧠 Design Decisions

### Why Sepolia Testnet?

**Chosen**: Sepolia  
**Alternatives Considered**: Goerli, Mumbai, Mainnet

**Reasoning**:
- **Active Support**: Sepolia is Ethereum Foundation's long-term testnet
- **Stability**: More stable than deprecated Goerli
- **Faucet Availability**: Multiple public faucets available
- **Mainnet-like**: Closest to Ethereum mainnet configuration
- **Cost**: Testnet allows free experimentation

**Trade-offs**:
- ❌ Not production-ready (test ETH has no value)
- ❌ Potential for testnet resets (though unlikely for Sepolia)
- ✅ Zero financial risk for users
- ✅ Faster iteration during development

### Why Three Separate Smart Contracts?

**Chosen**: PostContract, SocialContract, ProfileContract  
**Alternative**: Single monolithic contract

**Reasoning**:
- **Separation of Concerns**: Each contract has a single responsibility
- **Gas Optimization**: Users only interact with needed functionality
- **Independent Upgradability**: Can redeploy one without affecting others
- **Security**: Smaller contracts are easier to audit
- **Testing**: Isolated unit tests for each domain

**Trade-offs**:
- ❌ More deployment complexity (3 transactions)
- ❌ Higher initial gas cost for deployment
- ✅ Lower gas per user interaction
- ✅ Clearer code organization
- ✅ Easier to maintain and extend

### Why IPFS Instead of On-Chain Storage?

**Chosen**: IPFS (via Pinata)  
**Alternative**: Store images on-chain as base64

**Reasoning**:
- **Cost**: Storing 1MB image on-chain costs ~$200,000 in gas (at 50 gwei)
- **Scalability**: Blockchain state bloat is unsustainable
- **Decentralization**: IPFS provides content addressing without central servers
- **Permanence**: Content-addressed hashes ensure immutability
- **Performance**: Much faster to load images from IPFS gateway than on-chain

**Trade-offs**:
- ❌ Depends on IPFS pinning service (Pinata)
- ❌ Potential for unpinned content to be garbage collected
- ✅ 99.99% cost reduction vs on-chain storage
- ✅ Better user experience (fast image loading)

**Mitigation**:
- Use Pinata's dedicated infrastructure for high availability
- Paid Pinata plan ensures content remains pinned
- Multiple gateway fallbacks for redundancy

### Why Hybrid Firebase + Blockchain Architecture?

**Chosen**: Critical data on blockchain, ephemeral data on Firebase  
**Alternative**: 100% on-chain OR 100% centralized

**Reasoning**:

**Blockchain for**:
- Posts (ownership critical)
- Follows/Likes (social graph)
- Tips (financial transactions)
- Reports (moderation transparency)

**Firebase for**:
- Comments (high-frequency, deletable)
- Notifications (temporary, real-time)
- Online status (real-time presence)
- ETH gift tracking (anti-fraud)

**Why This Split?**:
- **UX**: Real-time features (comments, notifications) need instant updates. Waiting 12s for a comment confirmation is terrible UX.
- **Cost**: Storing every comment on-chain would cost users $0.50-$1 per comment.
- **Scalability**: Blockchain doesn't scale to Twitter-level comment volumes.
- **Practicality**: Not all data needs decentralization. Comments don't need immutability.

**Trade-offs**:
- ❌ Introduces centralization for some features
- ❌ Dependency on Firebase service availability
- ✅ Enables real-time user experience
- ✅ Dramatically reduces gas costs
- ✅ Best of both worlds: decentralized core, fast periphery

### Why Ethers.js v6 Instead of v5 or Web3.js?

**Chosen**: Ethers.js v6  
**Alternatives**: Ethers.js v5, Web3.js

**Reasoning**:
- **Modern**: Latest version with TypeScript support
- **Bundle Size**: 116kb (vs Web3.js 500kb+)
- **Developer Experience**: Better error messages, cleaner API
- **Documentation**: Comprehensive and well-maintained
- **Community**: Large ecosystem and active development

**Trade-offs**:
- ❌ Breaking changes from v5 (migration effort)
- ✅ Future-proof with latest features
- ✅ Better performance than alternatives

### Why Client-Side Image Compression?

**Chosen**: Browser Canvas API for compression  
**Alternative**: Server-side compression or no compression

**Reasoning**:
- **Bandwidth**: Reduces upload time from 30s to 5s for large images
- **Cost**: IPFS pinning costs scale with data size
- **User Experience**: Faster uploads, less waiting
- **Privacy**: No server sees original uncompressed image

**Implementation**:
```javascript
// Target: ~1MB final size
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = targetWidth;
canvas.height = targetHeight;
ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
const compressedBlob = await canvas.toBlob(blob => blob, 'image/jpeg', 0.85);
```

**Trade-offs**:
- ❌ Quality loss from compression (controlled at 0.85 quality)
- ✅ 80% reduction in upload time
- ✅ Works offline without server dependency

### Scalability Considerations

#### Current Limitations

**Smart Contract**:
- `getAllPosts()` iterates entire posts array → O(n) complexity
- Becomes expensive when post count > 10,000
- Maximum gas limit could be hit

**IPFS**:
- Gateway rate limits (Pinata: 5000 req/min on free tier)
- Single point of failure if Pinata goes down

**Firebase**:
- Firestore has 50,000 read/day limit on free tier
- Real-time listeners limited to 100 concurrent connections (free tier)

#### Proposed Scaling Solutions

**For Smart Contracts**:
1. **Pagination**: Modify `getAllPosts()` to accept `offset` and `limit` parameters
2. **Indexing Service**: Use The Graph protocol to index events off-chain
3. **L2 Migration**: Deploy to Polygon or Optimism for 100x cheaper gas
4. **Event-Based Loading**: Fetch posts from `PostCreated` events instead of contract calls

**For IPFS**:
1. **Multiple Gateways**: Configure fallback gateways (Cloudflare, Infura)
2. **Local IPFS Node**: Run dedicated node for faster retrieval
3. **CDN Layer**: Cloudflare workers cache frequent content

**For Firebase**:
1. **Upgrade Tier**: Move to Blaze plan (pay-as-you-go)
2. **Pagination**: Implement cursor-based pagination for comments
3. **Caching**: Use React Query to cache Firebase data client-side
4. **Batch Operations**: Batch write notification creation

**Production-Ready Checklist**:
- [ ] Deploy contracts to mainnet
- [ ] Implement contract upgradeability (proxy pattern)
- [ ] Add comprehensive error logging (Sentry)
- [ ] Set up monitoring (Grafana + alerts)
- [ ] Implement rate limiting on faucet API
- [ ] Add IPFS pinning redundancy
- [ ] Optimize smart contract gas usage (storage packing)
- [ ] Security audit by third-party firm
- [ ] Load testing (100k+ users)
- [ ] Implement progressive web app (PWA) features

---

## 📂 Folder Structure

```
socio3/
│
├── contracts/                          # Solidity smart contracts
│   ├── PostContract.sol               # Post creation, reports, moderation logic
│   ├── SocialContract.sol             # Follows, likes, tips
│   ├── ProfileContract.sol            # User profiles and usernames
│   └── Lock.sol                       # Example contract (unused)
│
├── frontend/                           # React application
│   ├── src/
│   │   ├── pages/                     # Route-level components
│   │   │   ├── Home.jsx              # Main feed showing followed users' posts
│   │   │   ├── Explore.jsx           # Discover trending creators and top posts
│   │   │   ├── Search.jsx            # User search functionality
│   │   │   ├── Profile.jsx           # User profile view with posts/stats
│   │   │   ├── Upload.jsx            # Create new post interface
│   │   │   ├── Post.jsx              # Individual post detail view
│   │   │   ├── Wallet.jsx            # Wallet balance and transactions
│   │   │   ├── Admin.jsx             # Moderation dashboard (owner only)
│   │   │   └── Messages.jsx          # Real-time chat interface
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── PostCard.jsx          # Post display component
│   │   │   ├── ProfileCard.jsx       # User profile card
│   │   │   ├── CommentModal.jsx      # Comment interface
│   │   │   ├── WalletConnectionHandler.jsx  # MetaMask integration
│   │   │   └── ...                   # Other UI components
│   │   │
│   │   ├── services/                  # Business logic layer
│   │   │   ├── firebaseService.js    # Firebase CRUD operations
│   │   │   ├── profileService.js     # Profile-related blockchain calls
│   │   │   ├── feedService.js        # Feed aggregation logic
│   │   │   ├── notificationService.js # Notification creation/retrieval
│   │   │   ├── tipService.js         # Tip transaction handling
│   │   │   ├── reportService.js      # Report submission
│   │   │   ├── faucetService.js      # ETH gift API integration
│   │   │   ├── trendingService.js    # Trending content algorithms
│   │   │   └── ...                   # Other service modules
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── usePresence.js        # Online/offline status tracking
│   │   │   ├── useProfile.js         # Profile data fetching
│   │   │   ├── usePosts.js           # Posts fetching and caching
│   │   │   ├── useNotifications.js   # Real-time notifications
│   │   │   └── ...                   # Other custom hooks
│   │   │
│   │   ├── context/                   # React Context providers
│   │   │   └── Web3Context.jsx       # Global wallet/contract state
│   │   │
│   │   ├── config/                    # Configuration files
│   │   │   ├── firebase.js           # Firebase initialization
│   │   │   ├── contracts.js          # Contract addresses and ABIs
│   │   │   └── pinata.js             # IPFS configuration
│   │   │
│   │   ├── utils/                     # Utility functions
│   │   │   ├── formatAddress.js      # Address shortening (0x1234...5678)
│   │   │   ├── formatTimestamp.js    # Relative time formatting
│   │   │   ├── ipfsGateway.js        # IPFS URL construction
│   │   │   └── ...                   # Other helpers
│   │   │
│   │   ├── App.jsx                    # Root component with routing
│   │   ├── main.jsx                   # React render entry point
│   │   └── index.css                  # Global Tailwind styles
│   │
│   ├── public/                        # Static assets
│   │   ├── logo.svg                   # Application logo
│   │   └── favicon.ico                # Browser icon
│   │
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite build configuration
│   └── .env                           # Environment variables (gitignored)
│
├── ignition/modules/                  # Hardhat Ignition deployment
│   ├── PostContract.js                # PostContract deployment script
│   ├── SocialContract.js              # SocialContract deployment script
│   └── ProfileContract.js             # ProfileContract deployment script
│
├── scripts/                           # Utility scripts
│   ├── deploy-all.js                  # Deploy all contracts at once
│   ├── verify-deployment.js           # Verify contract deployment
│   ├── test-blockchain.js             # Quick blockchain connectivity test
│   └── setup.js                       # Project initialization script
│
├── test/                              # Smart contract tests
│   └── Socio3.test.js                 # Comprehensive contract tests
│
├── .env                               # Root environment variables
├── .env.example                       # Environment template
├── hardhat.config.js                  # Hardhat network configuration
├── package.json                       # Root dependencies (Hardhat)
├── firebase.json                      # Firebase emulator configuration
├── firestore.rules                    # Firestore security rules
└── README.md                          # This file
```

### Key Directory Purposes

**`/contracts`**: Solidity source code for smart contracts. Each contract handles a specific domain (posts, social, profiles).

**`/frontend/src/pages`**: Each page corresponds to a route. Contains page-level logic and composition.

**`/frontend/src/services`**: Abstraction layer for external integrations. Separates business logic from UI components.

**`/frontend/src/hooks`**: Reusable stateful logic. Promotes code reuse across components.

**`/frontend/src/context`**: Global state management. Currently only Web3Context for wallet connection.

**`/ignition`**: Hardhat Ignition deployment modules. Deterministic deployments with proper verification.

**`/scripts`**: Development automation. Deployment, testing, and setup utilities.

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MetaMask**: Browser extension installed
- **Git**: For cloning repository

### 1. Clone Repository

```bash
git clone https://github.com/atharvabaodhankar/socio3.git
cd socio3
```

### 2. Install Dependencies

```bash
# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

#### Root `.env` File

Create `.env` in project root:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
INFURA_PROJECT_ID=your_infura_project_id

# IPFS/Pinata Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
VITE_PINATA_GATEWAY_TOKEN=your_gateway_token

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ

# Faucet Service
VITE_FAUCET_API_URL=https://sepolia-faucet-service.vercel.app/api/faucet
VITE_FAUCET_MASTER_PASSWORD=your_faucet_master_password

# Optional: Use Firebase local emulator
VITE_USE_FIREBASE_EMULATOR=false
```

#### Frontend `.env` File

Create `frontend/.env` (duplicate of root for Vite access):

```bash
# Copy all VITE_* variables from root .env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
# ... (all other VITE_* variables)
```

### 4. Obtain API Keys

#### Infura (Ethereum RPC)
1. Visit [infura.io](https://infura.io)
2. Create account and new project
3. Copy Project ID
4. Add to `.env` as `INFURA_PROJECT_ID`

#### Pinata (IPFS)
1. Visit [pinata.cloud](https://pinata.cloud)
2. Create account (free tier available)
3. Navigate to API Keys → New Key
4. Generate and copy:
   - API Key
   - API Secret
   - JWT token
5. Add to `.env`

#### Firebase
1. Visit [firebase.google.com](https://firebase.google.com)
2. Create new project
3. Enable Firestore Database
4. Go to Project Settings → General
5. Scroll to "Your Apps" → Web App
6. Copy configuration object values to `.env`

#### Faucet Service
1. Deploy [sepolia-faucet-service](https://github.com/atharvabaodhankar/sepolia-faucet-service)
2. Set master password during deployment
3. Add API URL and password to `.env`

### 5. Smart Contract Deployment (Optional)

**For Development**: Use existing deployed contracts (already in `frontend/src/config/contracts.js`)

**For Custom Deployment**:

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy-all.js --network sepolia

# Update contract addresses in frontend/src/config/contracts.js
```

### 6. Run Application

#### Development Mode

```bash
# Terminal 1: Start frontend
cd frontend
npm run dev
# Runs on http://localhost:5173

# Terminal 2 (Optional): Firebase emulator
firebase emulators:start --only firestore
# Runs on http://localhost:9080
```

#### Access Application

1. Open browser to `http://localhost:5173`
2. Connect MetaMask wallet
3. Switch network to Sepolia Testnet
4. Get free Sepolia ETH from faucet (automatic on profile creation)
5. Start exploring!

### 7. Firebase Local Testing (Optional)

For local Firebase development without consuming quota:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not done)
firebase init

# Start emulators
firebase emulators:start

# Update frontend/.env
VITE_USE_FIREBASE_EMULATOR=true
```

See [`FIREBASE_LOCAL_TESTING.md`](FIREBASE_LOCAL_TESTING.md) for detailed instructions.

---

## 🔐 Security Considerations

### Authentication

**Wallet-Based Identity**:
- No traditional username/password vulnerabilities
- Private keys managed by MetaMask extension
- User approves each transaction explicitly
- Frontend never accesses private keys

**Session Management**:
- Connection persisted in React Context (not localStorage)
- Cleared on wallet disconnect or page refresh
- No JWT tokens or session cookies

**Best Practice**:
- Always verify wallet connection before sensitive operations
- Double-check connected address matches expected user

### Data Protection

**On-Chain Data**:
- All blockchain data is **public** by design
- Post content, likes, follows, tips are visible to everyone
- Wallet addresses are **not anonymous** (pseudonymous)
- Users should not post sensitive personal information

**Firebase Data**:
- Comments and notifications protected by security rules
- Users can only read their own notifications
- Comments readable by anyone (public posts)
- ETH gift tracking prevents duplicate claiming

**IPFS Content**:
- All uploaded content is **public**
- IPFS hashes are permanent and cannot be deleted
- Content moderation only hides posts in UI, doesn't delete from IPFS
- Users should not upload private/copyrighted content

### API Security

**Firebase Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own notifications
    match /notifications/{userId}/{notifId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null;
    }
    
    // Comments are public but validated
    match /posts/{postId}/comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.text.size() <= 500;
    }
  }
}
```

**IPFS Gateway**:
- Uses authenticated Pinata gateway with token
- Prevents unauthorized uploads
- Rate limiting prevents abuse

**Smart Contracts**:
- `onlyOwner` modifier protects admin functions
- Input validation prevents malformed data
- Reentrancy protection on tip transfers
- Gas limit protection on loops

### Common Attack Vectors & Mitigations

#### 1. Reentrancy Attack
**Vulnerability**: Malicious contract calls back into tip function before state update

**Mitigation**:
```solidity
// In SocialContract.tipPost()
// Update state BEFORE external call
tips[_postId] += msg.value;
totalTipsReceived[_recipient] += msg.value;

// Then transfer (Checks-Effects-Interactions pattern)
payable(_recipient).transfer(msg.value);
```

#### 2. Front-Running
**Vulnerability**: Attacker sees pending username registration and submits higher gas to claim first

**Mitigation**:
- Limitation: Cannot fully prevent on public blockchain
- Partial solution: Use commit-reveal scheme for high-value usernames
- Current approach: Accept risk for testnet MVP

#### 3. Denial of Service (Gas Limit)
**Vulnerability**: `getAllPosts()` with 100k posts exceeds block gas limit

**Mitigation**:
- Implement pagination in production
- Use event indexing (The Graph) instead of direct queries
- Frontend caching to reduce calls

#### 4. Fake ETH Gift Claims
**Vulnerability**: User claims multiple gifts using different browsers

**Mitigation**:
- Firebase tracking by wallet address (persistent)
- Server-side validation in faucet API
- Master password prevents unauthorized API calls
- Rate limiting on faucet service

#### 5. IPFS Content Tampering
**Vulnerability**: Attacker modifies content on IPFS

**Mitigation**:
- **Impossible**: IPFS uses content-addressing
- Hash changes if content changes
- Blockchain stores original hash, so tampering is detectable

---

## ⚙️ Future Improvements

### Short-Term (Next Release)

1. **Encrypted Direct Messages**
   - End-to-end encryption using wallet signatures
   - Store encrypted messages in Firebase
   - Only sender/receiver can decrypt
   - Implementation: Use `ecies` library with ECDH key exchange

2. **Post Editing**
   - Allow users to edit captions (not images)
   - Store edit history on-chain or IPFS
   - Show "edited" indicator with timestamp
   - Challenge: On-chain immutability vs user needs

3. **User Blocking**
   - Block users to prevent seeing their content
   - Store block list in Firebase (not blockchain for privacy)
   - Filter blocked users from feed client-side
   - No on-chain cost

4. **Progressive Web App (PWA)**
   - Service worker for offline support
   - Cache IPFS content locally
   - Queue transactions for when back online
   - Add to home screen on mobile

5. **Advanced Analytics Dashboard**
   - Post performance metrics (likes over time)
   - Follower growth charts
   - Engagement rate calculations
   - Best time to post recommendations

### Medium-Term (3-6 Months)

1. **Layer 2 Migration**
   - Deploy to Polygon or Optimism
   - Reduce gas costs by 100x
   - Faster transaction confirmations (2s vs 12s)
   - Enables micro-tipping (0.0001 ETH feasible)

2. **NFT Post Minting**
   - Allow users to mint posts as NFTs (ERC-721)
   - Transfer post ownership
   - Royalties on secondary sales
   - Integration with OpenSea for discoverability

3. **DAO Governance**
   - Token-based voting for platform changes
   - Community decides report thresholds
   - Vote on feature roadmap
   - Smart contract-based proposals and execution

4. **Video Support**
   - Upload short videos (30s max)
   - Store on IPFS (use compression)
   - HLS streaming for performance
   - Challenge: Large file sizes, bandwidth costs

5. **Multi-Chain Support**
   - Deploy to Ethereum, Polygon, Base
   - Unified profile across chains
   - Cross-chain following/liking
   - Use Chainlink CCIP for messaging

### Long-Term (6-12 Months)

1. **Decentralized Content Indexing**
   - Migrate from Firebase to The Graph protocol
   - Event-based indexing of blockchain data
   - GraphQL API for complex queries
   - Fully decentralized backend

2. **Zero-Knowledge Profile Privacy**
   - Hide follower/following lists with zk-SNARKs
   - Prove you follow someone without revealing who
   - Private likes and tips
   - Implementation: Circom + SnarkJS

3. **Content Monetization Tools**
   - Subscription model (pay ETH for exclusive content)
   - NFT-gated posts (must own NFT to view)
   - Donation goals for creators
   - Revenue analytics

4. **AI-Powered Content Moderation**
   - Image recognition for NSFW detection
   - Text analysis for hate speech
   - Suggest report category automatically
   - Reduce false reports

5. **Decentralized CDN for IPFS**
   - Run own IPFS nodes for redundancy
   - Peer-to-peer content distribution
   - Reduce reliance on Pinata
   - Faster global content delivery

### Research & Experimentation

1. **Account Abstraction (ERC-4337)**
   - Gasless transactions for users
   - Social recovery of wallets
   - Batch transactions (follow 10 users in one tx)
   - Paymaster sponsorship for onboarding

2. **Soulbound Tokens (SBTs)**
   - Non-transferable reputation tokens
   - Verified user badges
   - Achievement NFTs
   - Anti-Sybil mechanisms

3. **Decentralized Identity (DID)**
   - ENS integration for usernames
   - Verifiable credentials for verification
   - Cross-platform identity
   - Interoperability with other dApps

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Socio3

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Links & Resources

### Live Application
- **Production URL**: [socio3.vercel.app](https://socio3.vercel.app)
- **Network**: Sepolia Testnet
- **Deployment**: Vercel (auto-deploy on `main` branch push)

### Smart Contract Addresses (Sepolia)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| PostContract | `0x5d5C1d313f580027204e04E8D4E3162f37A661CF` | [View](https://sepolia.etherscan.io/address/0x5d5C1d313f580027204e04E8D4E3162f37A661CF) |
| SocialContract | `0xedb788eb4c9D5B0919C9e9c81947B8417FF57788` | [View](https://sepolia.etherscan.io/address/0xedb788eb4c9D5B0919C9e9c81947B8417FF57788) |
| ProfileContract | `0x314FBc86715eD6a8f07C775e775CD4E61CF903Df` | [View](https://sepolia.etherscan.io/address/0x314FBc86715eD6a8f07C775e775CD4E61CF903Df) |

### Repositories
- **Main Project**: [github.com/atharvabaodhankar/socio3](https://github.com/atharvabaodhankar/socio3)
- **Faucet Service**: [github.com/atharvabaodhankar/sepolia-faucet-service](https://github.com/atharvabaodhankar/sepolia-faucet-service)

### Documentation
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [React Documentation](https://react.dev/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Pinata Documentation](https://docs.pinata.cloud/)

### Community & Support
- **Issues**: [GitHub Issues](https://github.com/atharvabaodhankar/socio3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/atharvabaodhankar/socio3/discussions)
- **Email**: support@socio3.app (coming soon)

---

## 👥 Target Users

**Primary Users**:
- **Web3 Enthusiasts**: Users familiar with MetaMask and crypto wallets
- **Content Creators**: Artists, photographers seeking true content ownership
- **Privacy Advocates**: Users concerned about centralized platform control
- **Early Adopters**: Tech-savvy individuals exploring decentralized apps

**Use Cases**:
1. **Digital Artists**: Share artwork with provable ownership, receive tips directly
2. **Photographers**: Build portfolio with immutable timestamps, preventing content theft
3. **Web3 Communities**: Share updates, coordinate activities, transparent moderation
4. **Crypto Enthusiasts**: Engage with like-minded individuals, no platform censorship
5. **Researchers**: Study blockchain-based social networks, access public moderation data

**Current Limitations**:
- Requires technical knowledge (MetaMask setup, gas concepts)
- Limited to Sepolia testnet (no real financial value)
- Smaller network effect compared to Web2 platforms

**Future Expansion**:
- Simplified onboarding for non-crypto users
- Mobile app for mainstream adoption
- Mainnet deployment for real economic activity

---

## 🎯 Contact & Contributions

### Reporting Issues

Found a bug? Please report it:

1. Check [existing issues](https://github.com/atharvabaodhankar/socio3/issues)
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/wallet version

### Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Submit** pull request with detailed description

**Code Guidelines**:
- Follow existing code style (Prettier formatting)
- Add JSDoc comments for complex functions
- Write unit tests for smart contract changes
- Update documentation if adding features
- Keep commits atomic and well-described

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/socio3.git

# 2. Create branch
git checkout -b feature/your-feature

# 3. Make changes and test
npm run test                    # Test contracts
cd frontend && npm run dev      # Test frontend

# 4. Commit and push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

# 5. Create pull request on GitHub
```

---

**Built with ❤️ for the decentralized future**

*Socio3 represents the evolution of social media - where users truly own their content, communities govern themselves, and creators are fairly rewarded. Join us in building a more transparent, equitable, and user-centric social platform.*

---

## Appendix: Quick Reference

### Common Commands

```bash
# Frontend development
cd frontend && npm run dev

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat run scripts/deploy-all.js --network sepolia

# Start Firebase emulator
firebase emulators:start

# Build for production
cd frontend && npm run build
```

### Environment Variables Quick Reference

```bash
# Required for frontend
VITE_PINATA_JWT=               # IPFS uploads
VITE_FIREBASE_API_KEY=         # Firebase connection
VITE_FAUCET_API_URL=           # ETH gifts

# Required for deployment
PRIVATE_KEY=                    # Deployer wallet
INFURA_PROJECT_ID=             # Sepolia RPC
```

### Key Files to Know

- `frontend/src/context/Web3Context.jsx` - Global wallet state
- `frontend/src/config/contracts.js` - Contract addresses and ABIs
- `frontend/src/services/firebaseService.js` - Firebase operations
- `contracts/PostContract.sol` - Core post logic
- `hardhat.config.js` - Network configuration

### Troubleshooting

**MetaMask not connecting?**
- Check you're on Sepolia network
- Clear browser cache and reconnect
- Ensure MetaMask is unlocked

**Transaction failing?**
- Check wallet has enough Sepolia ETH
- Try increasing gas limit in MetaMask
- Verify contract addresses in config

**IPFS upload failing?**
- Check Pinata API keys in .env
- Verify file size < 10MB
- Check network connection

**Firebase not working?**
- Verify API keys in .env
- Check Firestore security rules
- Ensure Firebase project is active

---

*Last Updated: January 24, 2026*