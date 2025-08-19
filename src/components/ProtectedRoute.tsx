import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Props interface for the ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;    // The content to render if access is allowed
  requireAuth?: boolean;        // Whether authentication is required (default: true)
  redirectTo?: string;          // Where to redirect if access is denied (default: '/login')
}

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that controls access to routes based on authentication status.
 * Can be configured to require authentication or allow access regardless of auth state.
 * 
 * Usage examples:
 * - <ProtectedRoute requireAuth={true}> - Only authenticated users can access
 * - <ProtectedRoute requireAuth={false}> - Anyone can access (for login/onboarding pages)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  // Get authentication status and loading state from context
  const { isAuthenticated, isLoading } = useAuth();

  // Get current location for special route handling
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#546A04'
      }}>
        Loading...
      </div>
    );
  }

  // Special case: Always allow access to onboarding page, regardless of auth state
  // This prevents redirect loops during the onboarding process
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If authentication is not required, allow access regardless of auth state
  // This is used for public pages like login, onboarding, or pages that work for both guests and members
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If we reach here, authentication is required and user is authenticated
  // Allow access to the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
