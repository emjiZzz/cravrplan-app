import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Using actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUIxCZpTj4k0Ylq2yJfkjiumeaxNvEpYI",
  authDomain: "cravrplan.firebaseapp.com",
  projectId: "cravrplan",
  storageBucket: "cravrplan.firebasestorage.app",
  messagingSenderId: "833954772764",
  appId: "1:833954772764:web:3197e2ee85c659b501acd9",
  measurementId: "G-QZ7G1XZNS0"
};

// Initialize Firebase only if no apps exist
let app;
const apps = getApps();
if (apps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
