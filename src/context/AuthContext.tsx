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

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await firestoreService.getUser(firebaseUser.uid);

          if (userData) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName
            };

            setUser(user);
            localStorage.setItem('cravrplan_user', JSON.stringify(user));

            // Update last login
            await firestoreService.updateUserLastLogin(firebaseUser.uid);

            // Check for pending preferences and save them
            const pendingPreferences = localStorage.getItem('pending_preferences');
            if (pendingPreferences) {
              try {
                const preferences = JSON.parse(pendingPreferences);
                await firestoreService.saveUserPreferences(firebaseUser.uid, preferences);
                localStorage.removeItem('pending_preferences');
              } catch (error) {
                console.error('Error saving pending preferences:', error);
              }
            }
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.error('User data not found in Firestore');
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          await signOut(auth);
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('cravrplan_user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const isInitialLoad = !user && isLoading;
    if (!isInitialLoad) {
      setIsLoading(true);
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      return { success: false, error: errorMessage };
    } finally {
      if (!isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user in Firestore
      await firestoreService.createUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName: fullName
      });

      // Sign out the user immediately after creating account
      await signOut(auth);

      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Signup failed. Please try again.';

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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const continueAsGuest = () => {
    setUser(null);
    localStorage.removeItem('cravrplan_user');
    setIsLoading(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    continueAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
