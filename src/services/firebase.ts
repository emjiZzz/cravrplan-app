// Firebase Configuration and Initialization
// This file sets up Firebase for authentication and database access
// Firebase is Google's backend service that provides authentication, database, and hosting

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object - gets values from environment variables
// These values are set in your .env file and tell Firebase which project to connect to
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,                    // API key for Firebase project
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,            // Domain for authentication
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,              // Your Firebase project ID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,      // Storage bucket for files
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,  // For push notifications
  appId: import.meta.env.VITE_FIREBASE_APP_ID,                      // Your Firebase app ID
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID        // For analytics
};

// Initialize Firebase app - only create one instance
// This prevents multiple Firebase instances from being created
let app;
const apps = getApps();

// Check if Firebase is already initialized
if (apps.length === 0) {
  // Create new Firebase app instance
  // This happens the first time the app loads
  app = initializeApp(firebaseConfig);
} else {
  // Use existing Firebase app instance
  // This prevents creating multiple instances if the file is imported multiple times
  app = apps[0];
}

// Initialize Firebase Authentication service
// This provides user login, signup, and authentication functionality
export const auth = getAuth(app);

// Initialize Cloud Firestore database service
// This provides database functionality for storing user data, recipes, etc.
export const db = getFirestore(app);

// Export the Firebase app instance
// This can be used by other parts of the app if needed
export default app;
