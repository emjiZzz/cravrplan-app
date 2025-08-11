import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('cravrplan_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('cravrplan_user');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to show loading state for better UX
    const timer = setTimeout(initializeAuth, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // For now, simulate successful login
      const mockUser: User = {
        id: '1',
        email,
        fullName: email.split('@')[0] // Use email prefix as name for demo
      };

      setUser(mockUser);
      localStorage.setItem('cravrplan_user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // TODO: Replace with actual API call
      // For now, simulate successful signup
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        fullName
      };

      setUser(mockUser);
      localStorage.setItem('cravrplan_user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cravrplan_user');
    // Clear all local data when user logs out
    localStorage.removeItem('mealPlans');
    localStorage.removeItem('shoppingLists');
    localStorage.removeItem('activeShoppingListId');
    localStorage.removeItem('recipeFavorites');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
