import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import { auth } from '../services/firebase';
import { firestoreService } from '../services/firestoreService';

// ===== TYPE DEFINITIONS =====

/**
 * User interface - defines the structure of user data
 */
interface User {
  id: string;           // Unique user ID from Firebase
  email: string;        // User's email address
  fullName: string;     // User's full name
}

/**
 * AuthContext interface - defines what the context provides to components
 */
interface AuthContextType {
  user: User | null;                                    // Current user data (null if not logged in)
  isAuthenticated: boolean;                             // Whether user is logged in
  isLoading: boolean;                                   // Loading state for auth operations
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;  // Login function
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;  // Signup function
  logout: () => void;                                   // Logout function
  continueAsGuest: () => void;                          // Continue without authentication
  authError: string | null;                             // Current authentication error message
  clearAuthError: () => void;                           // Clear error message
}

// ===== CONTEXT CREATION =====

/**
 * Create the authentication context
 * This will hold all authentication-related state and functions
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Custom hook to use the authentication context
 * Provides easy access to auth functions and state from any component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ===== PROVIDER PROPS =====

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;  // React components that will have access to auth context
}

// ===== AUTH PROVIDER COMPONENT =====

/**
 * AuthProvider Component
 * 
 * Provides authentication functionality to the entire app.
 * Manages user login, signup, logout, and authentication state.
 * Uses Firebase Authentication and Firestore for user data storage.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ===== STATE MANAGEMENT =====

  const [user, setUser] = useState<User | null>(null);           // Current user data
  const [isLoading, setIsLoading] = useState(true);             // Loading state
  const [authError, setAuthError] = useState<string | null>(null); // Error messages

  // ===== FIREBASE AUTH STATE LISTENER =====

  /**
   * Listen for changes in Firebase authentication state
   * This runs when the component mounts and whenever auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // User is signed in - get their data from Firestore
        try {
          const userData = await firestoreService.getUser(firebaseUser.uid);

          if (userData) {
            // Create user object with data from Firestore
            const user: User = {
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName
            };

            setUser(user);
            localStorage.setItem('cravrplan_user', JSON.stringify(user));

            // Update when they last logged in
            await firestoreService.updateUserLastLogin(firebaseUser.uid);

            // Check if there are any pending preferences to save
            const pendingPreferences = localStorage.getItem('pending_preferences');
            if (pendingPreferences) {
              try {
                const preferences = JSON.parse(pendingPreferences);
                await firestoreService.saveUserPreferences(firebaseUser.uid, preferences);
                localStorage.removeItem('pending_preferences');
                console.log('Pending preferences saved successfully');
              } catch (error) {
                console.error('Error saving pending preferences:', error);
              }
            }
          } else {
            // User exists in Firebase but not in our database
            console.error('User data not found in Firestore');
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          await signOut(auth);
        }
      } else {
        // User is signed out - clear everything
        setUser(null);
        localStorage.removeItem('cravrplan_user');
        setAuthError(null);
      }
      setIsLoading(false);
    });

    // Cleanup function - unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  // ===== AUTHENTICATION FUNCTIONS =====

  /**
   * Handle user login
   * Attempts to sign in with Firebase and returns success/error status
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Only show loading for actual login attempts, not for initial auth check
    const isInitialLoad = !user && isLoading;
    if (!isInitialLoad) {
      setIsLoading(true);
    }

    try {
      // Attempt to sign in with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful - user authenticated with Firebase');
      setAuthError(null);
      return { success: true };
    } catch (error: any) {
      // Firebase throws an error when login fails - we catch it here and return a user-friendly message
      console.error('Firebase login error caught:', error.code, error.message);
      let errorMessage = 'Invalid email or password, please try again.';

      // Map Firebase error codes to user-friendly messages
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      console.log('Returning error message to LoginPage:', errorMessage);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      if (!isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  /**
   * Handle user signup
   * Creates a new user account in both Firebase Auth and Firestore
   */
  const signup = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    console.log('AuthContext: Starting signup process...');

    try {
      console.log('AuthContext: Creating user in Firebase Auth...');
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('AuthContext: Firebase user created:', firebaseUser.uid);

      console.log('AuthContext: Creating user in Firestore...');
      // Create the user in our Firestore database
      await firestoreService.createUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName: fullName
      });
      console.log('AuthContext: User created in Firestore');

      // Sign out immediately after creating account to prevent auto-login
      await signOut(auth);
      console.log('AuthContext: User signed out after account creation');

      console.log('AuthContext: Signup successful');
      return { success: true };
    } catch (error: any) {
      console.error('AuthContext: Signup error:', error);
      let errorMessage = 'Signup failed. Please try again.';

      // Give specific error messages for common issues
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   * Signs out the user from Firebase Authentication
   */
  const logout = async () => {
    try {
      await signOut(auth);
      // The auth state listener will handle clearing the user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Handle continuing as guest (no authentication)
   * Allows users to use the app without creating an account
   */
  const continueAsGuest = () => {
    // Clear any existing user data
    setUser(null);
    localStorage.removeItem('cravrplan_user');
    setIsLoading(false);
    setAuthError(null);
  };

  // ===== CONTEXT VALUE =====

  /**
   * What we provide to other components through the context
   */
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,  // Convert user to boolean (true if user exists, false if null)
    isLoading,
    login,
    signup,
    logout,
    continueAsGuest,
    authError,
    clearAuthError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
