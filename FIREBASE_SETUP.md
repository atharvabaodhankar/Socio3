# Firebase Setup for Socio3

## Overview
Socio3 uses Firebase Firestore to store social interactions (likes and comments) for better performance and cost efficiency compared to storing everything on the blockchain.

## Architecture
- **Blockchain**: Posts, tips, and financial data
- **Firebase**: Likes, comments, and social interactions
- **IPFS**: Media files (images, videos)

## Setup Instructions

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database
4. Enable Authentication (optional, for future features)

### 2. Firestore Database
1. Create a Firestore database in production mode
2. Set up the following collections:
   - `likes` - User likes on posts
   - `comments` - User comments on posts  
   - `postStats` - Aggregated stats (like count, comment count)

### 3. Security Rules
Deploy the security rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### 4. Environment Variables
Update your `.env` file with Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Data Structure

### Likes Collection
```javascript
{
  postId: "1",
  userAddress: "0x...",
  timestamp: serverTimestamp()
}
```

### Comments Collection
```javascript
{
  postId: "1", 
  userAddress: "0x...",
  text: "Great post!",
  timestamp: serverTimestamp()
}
```

### Post Stats Collection
```javascript
{
  postId: "1",
  likes: 42,
  comments: 15
}
```

## Features
- ✅ Real-time like updates
- ✅ Real-time comment updates  
- ✅ Optimistic UI updates
- ✅ Automatic stats aggregation
- ✅ Wallet-based authentication
- ✅ Mobile-optimized interactions

## Benefits
- **Fast**: Instant social interactions
- **Cost-effective**: No gas fees for likes/comments
- **Scalable**: Firebase handles millions of operations
- **Real-time**: Live updates across all users
- **Secure**: Wallet-based user identification