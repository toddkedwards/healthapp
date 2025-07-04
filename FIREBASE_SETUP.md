# 🔥 Firebase Setup Guide for GeekFit

This guide will help you set up Firebase for the GeekFit app to enable user authentication and data persistence.

## 📋 Prerequisites

- A Google account
- Node.js and npm installed
- Firebase CLI (optional but recommended)

## 🚀 Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "geekfit-app")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## 🔐 Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## 🗄️ Step 3: Set Up Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## 📱 Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "GeekFit Web")
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## ⚙️ Step 5: Update Firebase Configuration

1. Open `src/config/firebase.ts` in your GeekFit project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-actual-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 🔒 Step 6: Set Up Firestore Security Rules

1. In your Firebase project, go to "Firestore Database"
2. Click on the "Rules" tab
3. Replace the default rules with these development rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User quests
    match /userQuests/{questId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User achievements
    match /userAchievements/{achievementId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Boss battles
    match /bossBattles/{battleId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User inventory
    match /userInventory/{itemId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🧪 Step 7: Test Your Setup

1. Start your GeekFit app: `npm start`
2. Try to create a new account
3. Try to sign in with the created account
4. Check the Firebase console to see if user data is being created

## 📊 Step 8: Monitor Your App

1. In Firebase console, go to "Authentication" to see registered users
2. Go to "Firestore Database" to see user data
3. Go to "Analytics" (if enabled) to see app usage

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually means Firebase is being initialized multiple times
   - Check that you're only importing and initializing Firebase once

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Make sure the user is authenticated before accessing data

3. **"Network request failed"**
   - Check your internet connection
   - Verify your Firebase configuration is correct

4. **"Invalid API key"**
   - Double-check your Firebase configuration
   - Make sure you copied the entire config object correctly

### Development vs Production:

- **Development**: Use test mode security rules for easier development
- **Production**: Implement proper security rules before deploying

## 🚀 Next Steps

Once Firebase is set up, you can:

1. **Enable additional authentication methods** (Google, Apple, etc.)
2. **Set up Cloud Functions** for server-side logic
3. **Configure push notifications**
4. **Set up analytics and crash reporting**
5. **Implement proper security rules** for production

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-modeling)

---

**Happy coding! 🎮💪** 