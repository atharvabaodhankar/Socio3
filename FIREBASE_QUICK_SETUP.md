# Quick Firebase Setup for Socio3

## 🚀 Quick Setup (5 minutes)

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select your existing `socio3-3c5a3` project
3. Enable Firestore Database:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - **Choose "Start in test mode"** (important!)
   - Select a location (us-central1 is fine)

### 2. Update Security Rules (Temporary)
1. In Firestore Database, go to "Rules" tab
2. Replace the rules with this **temporary** open rule:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary open rules for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

### 3. Your Environment Variables
Your `.env` file already has the correct Firebase config:
```env
VITE_FIREBASE_PROJECT_ID=socio3-3c5a3
# ... other Firebase vars
```

## ✅ Test It
1. Restart your dev server: `npm run dev`
2. Try liking a post - it should work now!
3. Comments should also work

## 🔒 Security (Do This Later)
The current rules allow anyone to read/write. For production, you'll want to:
1. Implement proper authentication
2. Use the secure rules from `firestore.rules`
3. Add user verification

## 🐛 Troubleshooting
- **Still getting permissions error?** Make sure you selected "test mode" when creating the database
- **Rules not updating?** Wait 1-2 minutes after publishing rules
- **Firebase not connecting?** Check your project ID in `.env` matches your Firebase project

## 📊 What Gets Stored
- **Likes**: `likes/{postId}_{userAddress}`
- **Comments**: `comments/{randomId}`  
- **Stats**: `postStats/{postId}` (auto-generated)

The app will automatically create these collections when you interact with posts!