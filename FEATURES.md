# Socio3 Features Documentation

Complete documentation of all features available in the Socio3 decentralized social media platform.

---

## Table of Contents

1. [Blockchain Features](#blockchain-features)
2. [User Authentication & Profiles](#user-authentication--profiles)
3. [Content Creation & Management](#content-creation--management)
4. [Social Interactions](#social-interactions)
5. [Messaging System](#messaging-system)
6. [Content Discovery](#content-discovery)
7. [Monetization](#monetization)
8. [Content Moderation](#content-moderation)
9. [User Experience Features](#user-experience-features)
10. [Admin Features](#admin-features)
11. [Security & Privacy](#security--privacy)

---

## Blockchain Features

### Smart Contract Architecture

**Three Separate Contracts:**
- **PostContract** (`0x5d5C1d313f580027204e04E8D4E3162f37A661CF`)
  - Post creation and storage
  - Report submission and tracking
  - Automatic and manual content moderation
  
- **SocialContract** (`0xedb788eb4c9D5B0919C9e9c81947B8417FF57788`)
  - Follow/unfollow operations
  - Like/unlike posts
  - ETH tip transfers
  - Social graph queries
  
- **ProfileContract** (`0x314FBc86715eD6a8f07C775e775CD4E61CF903Df`)
  - Profile creation and updates
  - Username registration and mapping
  - Username availability checks

### Blockchain Network
- **Network**: Sepolia Testnet (Ethereum)
- **RPC Provider**: Infura
- **Wallet Integration**: MetaMask via EIP-1193
- **Library**: Ethers.js v6

### On-Chain Data Storage
- Post IDs and author addresses
- Social graph (follows, likes)
- Report counts and types
- Tips received
- Profile IPFS hash references
- Username mappings

---

## User Authentication & Profiles

### Wallet-Based Authentication
- **No passwords or emails required**
- MetaMask wallet connection via browser extension
- EIP-1193 provider API integration
- Account change detection
- Network change handling
- Connection persistence via React Context

### Profile Management

**Profile Creation:**
- Username selection (3-20 characters, alphanumeric + underscore)
- Display name
- Bio (up to 500 characters)
- Profile picture upload
- Cover image upload
- Website URL
- Twitter handle
- All data stored on IPFS with hash on blockchain

**Profile Features:**
- Edit profile information
- Update profile picture and cover image
- Change username (with availability check)
- View follower/following counts
- View total tips earned
- View post count
- Public profile pages accessible via address or username

**Profile Display:**
- Formatted wallet addresses (0x1234...5678)
- Username or display name priority
- Profile picture with fallback to initials
- Cover image support
- Social links (website, Twitter)
- Real-time follower count updates

---

## Content Creation & Management

### Post Creation

**Upload Process:**
1. Image/video file selection (up to 10MB)
2. Client-side image compression (target ~1MB)
3. **NSFW Content Detection** (JigsawStack API)
   - Automatic scanning before upload
   - Real-time validation feedback
   - Blocks inappropriate content
4. Caption writing (up to 500 characters)
5. IPFS upload via Pinata
6. Metadata JSON creation
7. Blockchain transaction
8. Firebase document creation

**Supported Media:**
- Image formats: PNG, JPG, GIF, WebP
- Video formats: MP4
- Maximum file size: 10MB
- Automatic image optimization

**Advanced Post Options:**
- **Allow Comments Toggle**: Enable/disable comments on posts
- **Show Like Count Toggle**: Show/hide like count publicly
- Settings saved to Firebase
- Per-post configuration

### Content Storage

**IPFS (Pinata):**
- Post images and videos
- Profile pictures and cover images
- Metadata JSON files
- Permanent content pinning
- Authenticated gateway access
- Content-addressed storage

**Blockchain:**
- Post IDs and timestamps
- Author addresses
- IPFS hash references
- Removal status and reasons

**Firebase:**
- Comments (real-time)
- Post settings (comments, like visibility)
- Saved posts
- Liked posts tracking

### Post Features
- Image/video display
- Caption with hashtag support
- Timestamp display
- Author information
- Like count (if enabled)
- Comment count
- Tip amount display
- Share functionality
- Save/bookmark posts
- Report functionality

---

## Social Interactions

### Following System

**Features:**
- Follow/unfollow users
- Follower count display
- Following count display
- Cannot follow yourself
- Real-time follower updates
- Follow button with loading states
- Follow status persistence

**Follow Button Variants:**
- Primary (white background)
- Secondary (transparent with border)
- Small and large sizes
- Loading and disabled states

### Likes System

**Features:**
- Like/unlike posts
- Like count display (if enabled by post author)
- Heart animation on double-tap
- Optimistic UI updates
- Real-time like count synchronization
- Like status persistence
- Cannot like your own posts

**Like Interactions:**
- Single tap: Open post modal
- Double tap: Like post
- Heart button: Toggle like
- Animated heart overlay on like

### Comments System

**Features:**
- Add comments to posts
- Real-time comment updates
- Comment count display
- View all comments
- Comment author profiles
- Timestamp display
- Can be disabled by post author

**Comment Management:**
- Post comments via Firebase
- Real-time synchronization
- Character limit: 500 characters
- Enter key to submit
- Shift+Enter for new line
- Comment author navigation

### Saved Posts

**Features:**
- Save/bookmark posts
- View saved posts in profile
- Remove from saved
- Saved posts tab in profile
- Firebase-based storage
- User-specific saved collections

---

## Messaging System

### Real-Time Chat

**Features:**
- One-on-one messaging
- Real-time message delivery
- Message history
- Online/offline status indicators
- Last seen timestamps
- Typing indicators
- Message timestamps

**Message Management:**
- Send text messages
- Edit messages (own messages only)
- Delete messages (own messages only)
- Message reactions (emoji)
- Multiple reaction support
- Reaction toggle (add/remove)

**Chat Features:**
- Chat list with recent conversations
- Last message preview
- Unread message indicators
- Online status badges
- Profile picture in chat
- Navigate to user profile from chat

**Emoji Support:**
- Emoji picker with 100+ emojis
- Quick reaction emojis (8 common)
- Insert emojis in messages
- React to messages with emojis
- One reaction per user per message
- Visual reaction display

**User Presence:**
- Real-time online/offline status
- Green indicator for online users
- Gray indicator for offline users
- Last seen timestamp
- Automatic presence updates
- Presence tracking across app

---

## Content Discovery

### Home Feed

**Personalized Feed:**
- Posts from followed users
- Chronological order (newest first)
- Fallback to all posts if not following anyone
- Infinite scroll support
- Post count display
- Empty state with suggestions

**Feed Features:**
- Instagram-style centered layout
- Stories section (trending creators)
- Suggested creators sidebar
- Quick actions sidebar
- Auto-scroll button
- Refresh functionality

### Explore Page

**Discovery Features:**
- Trending posts (by likes)
- Most tipped posts
- Recent posts
- Filter tabs for sorting
- Grid and feed view options
- Trending creators sidebar
- Top posts grid (9 posts)

**Sorting Options:**
- Trending (by likes)
- Most Tipped (by ETH received)
- Recent (by timestamp)
- Real-time updates

### Search

**Search Capabilities:**
- Search by username
- Search by display name
- Search by wallet address
- Search by bio content
- Real-time search results
- Debounced search (300ms)
- Result caching (5 minutes)

**Search Results:**
- Profile picture display
- Username and display name
- Follower count
- Follow button
- Navigate to profile
- Highlight matching text

### Trending System

**Trending Creators:**
- Ranked by follower count
- Post count display
- Trending badge indicator
- Top 5 creators featured
- Exclude current user
- Real-time ranking updates

**Top Posts:**
- Ranked by likes
- Tip amount display
- Post preview grid
- Click to view full post
- Top 9 posts featured
- Hover stats overlay

---

## Monetization

### ETH Tipping System

**Features:**
- Direct ETH tips to creators
- Zero platform fees (100% to creator)
- Instant transfers via smart contract
- Tip any amount (minimum 0.001 ETH)
- Quick tip amounts (0.001, 0.01, 0.1 ETH)
- Custom tip amounts
- Tip confirmation modal

**Tip Tracking:**
- Total tips received per post
- Total tips received per user
- Tip count statistics
- Tip history
- Transaction hash recording
- Firebase notification system

**Tip Notifications:**
- Real-time tip notifications
- Sender information
- Tip amount display
- Post preview
- Transaction details
- Tip message support
- Notification dashboard

**Tip Dashboard:**
- View all received tips
- Sender profiles
- Tip amounts
- Timestamps
- Post references
- Total earnings display

### Welcome Gift System

**Automatic ETH Gifting:**
- Detects new users (balance < 0.001 ETH)
- Automatically sends 0.005 ETH
- One-time gift per address
- Firebase tracking to prevent abuse
- Cross-device fraud prevention
- Transaction confirmation
- Success/failure notifications

**Gift Tracking:**
- Firebase-based gift registry
- Device fingerprinting
- IP-based detection
- Transaction hash storage
- Gift status monitoring
- Statistics dashboard

---

## Content Moderation

### Community Reporting

**Report System:**
- 5 report categories:
  1. Spam
  2. Inappropriate Content
  3. Harassment
  4. Copyright Violation
  5. Other
- Custom reason text
- One report per user per post
- Cannot report own posts
- Report count tracking
- Firebase notification system

**Report Tracking:**
- Report count per post
- Reporter addresses
- Report types and reasons
- Timestamps
- Report status (pending/resolved)
- Admin dashboard visibility

### Automatic Moderation

**Auto-Removal Scenarios:**

1. **High Report Threshold:**
   - 5+ reports → Automatic removal
   - Regardless of like count
   - Immediate action

2. **Low Engagement:**
   - 0 likes + 3+ reports → Removal
   - Indicates poor quality content
   - Community consensus

3. **Report-to-Like Ratio:**
   - Reports ≥ (Likes × 2) → Removal
   - Example: 10 likes, 20 reports = REMOVED
   - Configurable threshold

**Removal Process:**
- Post marked as removed on blockchain
- Removal reason recorded
- Event emitted for tracking
- Post hidden from all feeds
- Author notified
- Irreversible action

### Manual Moderation

**Admin Controls:**
- Manual post removal
- Custom removal reasons
- View all reports
- Report statistics
- Removed posts list
- Moderation dashboard

**Admin Dashboard:**
- Total reports count
- Pending reports count
- Removed posts count
- Recent reports table
- Report type breakdown
- Status tracking

---

## User Experience Features

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly interactions
- Adaptive navigation
- Responsive images

### Animations & Transitions
- Smooth page transitions
- Loading animations
- Success/error modals
- Heart animation on like
- Hover effects
- Scale transitions
- Fade effects

### Loading States
- Skeleton screens
- Spinner animations
- Progress indicators
- Optimistic UI updates
- Loading modals
- Disabled button states

### Error Handling
- User-friendly error messages
- Retry functionality
- Network error detection
- Transaction failure handling
- IPFS upload failures
- Fallback mechanisms

### Modals & Overlays
- Post detail modal
- Tip modal
- Share modal
- Report modal
- Success modal
- Error modal
- Loading modal
- Edit profile modal
- Welcome gift modal

### Navigation
- React Router integration
- Navbar with active states
- Profile navigation
- Post navigation
- Back button support
- Scroll to top
- Auto-scroll button

### Notifications
- Tip notifications
- Follow notifications
- Like notifications
- Comment notifications
- Report notifications
- Real-time updates
- Notification badges

### Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support
- High contrast mode
- Touch target sizes

---

## Admin Features

### Admin Dashboard

**Access Control:**
- Owner-only access
- Wallet address verification
- Secure admin routes
- Permission checks

**Dashboard Features:**
- Statistics overview
- Recent reports table
- Report filtering
- Status management
- Moderation actions

**Statistics:**
- Total reports count
- Pending reports count
- Removed posts count
- Report type breakdown
- Time-based analytics

**Report Management:**
- View all reports
- Filter by status
- Filter by type
- Sort by date
- Report details
- Reporter information

### Moderation Tools

**Manual Actions:**
- Remove posts manually
- Add custom removal reasons
- View removed posts
- Restore posts (if needed)
- Ban users (future feature)

**Configurable Settings:**
- Report threshold adjustment
- Report-to-like ratio tuning
- Auto-moderation rules
- Whitelist management

---

## Security & Privacy

### Wallet Security
- Private keys never exposed
- MetaMask isolation
- Transaction signing required
- User approval for all actions
- Secure RPC connections

### Data Privacy
- No email or password storage
- Wallet-based identity
- User-controlled data
- IPFS content addressing
- Decentralized storage

### Content Security
- NSFW content detection
- Automated content scanning
- Community reporting
- Transparent moderation
- Immutable blockchain records

### Transaction Security
- Gas estimation
- Transaction confirmation
- Error handling
- Revert protection
- Reentrancy guards

### API Security
- Authenticated IPFS gateway
- Rate limiting
- CORS protection
- Environment variables
- Secure endpoints

### Firebase Security
- Security rules enforcement
- User-specific data access
- Read/write permissions
- Query limitations
- Data validation

---

## Technical Features

### Performance Optimization
- Client-side image compression
- Lazy loading
- Infinite scroll
- Caching strategies
- Debounced search
- Optimistic UI updates

### State Management
- React Context API
- Custom hooks
- Local state management
- Real-time synchronization
- Persistent state

### Real-Time Features
- Firebase Firestore listeners
- WebSocket connections
- Live presence tracking
- Instant notifications
- Real-time comments
- Live like counts

### Error Recovery
- Automatic retries
- Exponential backoff
- Fallback mechanisms
- User notifications
- Transaction monitoring

### Browser Compatibility
- Modern browser support
- MetaMask integration
- Web3 provider detection
- Fallback for unsupported features

---

## Future Features (Roadmap)

### Planned Features
- Mobile app (iOS/Android)
- NFT profile pictures
- Token-gated communities
- Cross-chain support
- Video posts
- Stories feature
- Live streaming
- Group chats
- Post scheduling
- Analytics dashboard
- Creator monetization tools
- Subscription tiers
- Enhanced moderation AI
- Multi-language support
- Dark/light theme toggle

---

## Feature Summary

### Core Features
✅ Wallet-based authentication
✅ Profile creation and management
✅ Post creation with IPFS storage
✅ Like, comment, and share
✅ Follow/unfollow users
✅ ETH tipping system
✅ Real-time messaging
✅ Content discovery (Explore, Search)
✅ Community reporting
✅ Automatic moderation
✅ Admin dashboard
✅ Welcome gift system
✅ Saved posts
✅ NSFW content detection
✅ Post settings (comments, likes)
✅ Message reactions
✅ User presence tracking

### Advanced Features
✅ Optimistic UI updates
✅ Real-time synchronization
✅ Infinite scroll
✅ Responsive design
✅ Error handling
✅ Loading states
✅ Animations
✅ Modals
✅ Notifications
✅ Search with caching
✅ Trending algorithms
✅ Gas optimization
✅ Security best practices

---

## Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- Framer Motion
- React Router DOM 7
- Ethers.js 6

### Blockchain
- Ethereum (Sepolia Testnet)
- Solidity 0.8.28
- Hardhat
- Infura RPC

### Storage
- IPFS (Pinata)
- Firebase Firestore
- Firebase Authentication

### APIs & Services
- JigsawStack (NSFW detection)
- Pinata (IPFS pinning)
- Sepolia Faucet (ETH gifting)

### Development Tools
- ESLint
- Git
- npm
- Vercel (deployment)

---

## Deployment

### Frontend
- **Platform**: Vercel
- **URL**: https://socio3.vercel.app
- **Build**: Vite production build
- **Environment**: Production

### Smart Contracts
- **Network**: Sepolia Testnet
- **Deployment**: Hardhat Ignition
- **Verification**: Etherscan
- **Gas Optimization**: Enabled

### IPFS
- **Provider**: Pinata
- **Gateway**: Authenticated
- **Pinning**: Permanent
- **CDN**: Global distribution

### Firebase
- **Hosting**: Firebase Hosting
- **Database**: Firestore
- **Rules**: Security rules enabled
- **Indexes**: Optimized queries

---

## Getting Started

### For Users
1. Install MetaMask browser extension
2. Create or import wallet
3. Visit https://socio3.vercel.app
4. Connect wallet
5. Receive welcome gift (0.005 ETH)
6. Create profile
7. Start posting and interacting!

### For Developers
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start development server: `npm run dev`
5. Deploy contracts: `npx hardhat ignition deploy`
6. Build frontend: `npm run build`
7. Deploy to Vercel

---

## Support & Documentation

### Resources
- GitHub Repository: https://github.com/atharvabaodhankar/Socio3
- Live Demo: https://socio3.vercel.app
- README: Comprehensive setup guide
- DESIGN.md: Architecture documentation
- DEPLOYMENT_FRESH.md: Deployment guide

### Community
- Report issues on GitHub
- Feature requests welcome
- Contributions encouraged
- Open source project

---

**Last Updated**: February 7, 2026
**Version**: 1.0.0
**License**: MIT
