# Firebase Setup and Guest/Member Mode Implementation

## Overview

The CravrPlan app now supports two modes of operation:

1. **Guest Mode** - Users can try the app without registration (data not saved)
2. **Member Mode** - Full functionality for registered users with data persistence

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication and Firestore Database

### 2. Enable Authentication

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication

### 3. Set up Firestore Database

1. Go to Firestore Database in Firebase Console
2. Create database in test mode (for development)
3. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /mealPlans/{planId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /favoriteRecipes/{favoriteId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /fridgeIngredients/{ingredientId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. Update Firebase Configuration

Replace the placeholder configuration in `src/services/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Features by Mode

### Guest Mode
- ✅ Browse recipes
- ✅ View recipe details
- ✅ Add recipes to favorites (temporary)
- ✅ Create meal plans (temporary)
- ✅ Manage fridge ingredients (temporary)
- ❌ Data is not saved permanently
- ❌ Cannot add custom recipes
- ❌ Cannot use drag & drop features
- ❌ Limited access to advanced features

### Member Mode
- ✅ All Guest Mode features
- ✅ Data persistence across sessions
- ✅ Add custom recipes
- ✅ Full drag & drop functionality
- ✅ Advanced meal planning features
- ✅ Data synced across devices
- ✅ Access to all premium features



## Implementation Details

### Authentication Flow
- Uses Firebase Authentication for secure user management
- Automatic session persistence

### Data Storage
- **Guest Mode**: localStorage (temporary)
- **Member Mode**: Firestore (persistent)
- Automatic data migration when switching modes

### Context Providers
- `AuthProvider`: Manages authentication state
- `GuestProvider`: Handles guest mode data
- `FavoritesProvider`: Manages recipe favorites
- `PlanProvider`: Manages meal plans

### Components
- `GuestModeBanner`: Shows limitations and upgrade prompts
- Updated `Header`: Shows current mode and user info
- Updated `LoginPage`: Includes guest mode option

## Usage Instructions

### For Users
1. **Try as Guest**: Click "Continue as Guest" on login page
2. **Create Account**: Click "Sign Up" to create a member account
3. **Upgrade**: Guest users see upgrade prompts for member-only features

### For Developers
1. Set up Firebase project and update configuration
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Test both guest and member modes of operation

## Security Considerations

- All user data is isolated by user ID
- Firestore security rules prevent unauthorized access
- Guest data is stored locally and cleared on logout

## Future Enhancements

- Social authentication (Google, Facebook)
- Premium subscription features
- Data export/import functionality
- Advanced meal planning algorithms
- Recipe sharing between users

