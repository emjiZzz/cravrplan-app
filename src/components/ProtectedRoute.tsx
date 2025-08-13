import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
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
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // If authentication is required and user is not authenticated, redirect
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If authentication is not required, allow access regardless of auth state
  // This fixes the plan page issue where authenticated users were being redirected
  if (!requireAuth) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
