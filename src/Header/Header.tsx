// Header Component - Main navigation header for the CravrPlan app
// This component contains the logo, navigation menu, and authentication controls
// It handles navigation between different pages and shows user authentication state

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import CravrPlanBowlLogo from '../assets/salad.png';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';

/**
 * Header Component
 * 
 * Main navigation header for the CravrPlan app.
 * Contains the logo, navigation menu, and authentication controls.
 * Handles navigation between different pages and user authentication state.
 * 
 * Features:
 * - Clickable logo that navigates to home page
 * - Navigation menu with active page highlighting
 * - User authentication status display
 * - Login/logout functionality
 * - Guest mode support
 */
const Header: React.FC = () => {
  // ===== HOOKS AND CONTEXT =====

  const navigate = useNavigate();                    // Hook for programmatic navigation between pages
  const location = useLocation();                    // Hook to get current route location (which page user is on)
  const { user, isAuthenticated, logout } = useAuth();  // Authentication context - user data and login/logout functions
  const { isGuestMode, clearGuestData } = useGuest();   // Guest mode context - for users who don't want to create accounts

  // ===== EVENT HANDLERS =====

  /**
   * Handle logo click - navigate to home page
   * When user clicks the logo, take them back to the main recipes page
   */
  const handleLogoClick = () => {
    navigate('/');
  };

  /**
   * Handle navigation button clicks
   * @param path - The route path to navigate to (e.g., '/recipes', '/fridge', '/plan')
   */
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  /**
   * Handle logout button click
   * Clears guest data if in guest mode, otherwise logs out authenticated user
   * After logout, navigates user back to home page
   */
  const handleLogout = () => {
    if (isGuestMode) {
      // Clear guest data and navigate to home
      clearGuestData();
      navigate('/');
    } else {
      // Log out authenticated user and navigate to home
      logout();
      navigate('/');
    }
  };

  /**
   * Handle login button click - navigate to login page
   * Takes user to the login page where they can sign in
   */
  const handleLogin = () => {
    navigate('/login');
  };

  // ===== COMPUTED VALUES =====

  // Check if current page is the meal plan page for special styling
  // This allows us to apply different styles when user is on the meal plan page
  const isPlanPage = location.pathname === '/plan';

  // ===== RENDER =====

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.headerContainer}>
        {/* Logo Section - Clickable logo that takes user to home page */}
        <div
          className={styles.logo}
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={CravrPlanBowlLogo}
            alt="CravrPlan Logo"
            className={styles.logoImage}
          />
          <h1>CravrPlan</h1>
        </div>

        {/* Navigation Menu - Buttons to navigate between main app sections */}
        <nav className={`${styles.navigation} ${isPlanPage ? styles.planPage : ''}`}>
          <button
            onClick={() => handleNavClick('/recipes')}
            className={location.pathname === '/recipes' || location.pathname.startsWith('/recipes/') ? styles.active : ''}
          >
            RECIPES
          </button>
          <button
            onClick={() => handleNavClick('/fridge')}
            className={location.pathname === '/fridge' ? styles.active : ''}
          >
            FRIDGE
          </button>
          <button
            onClick={() => handleNavClick('/plan')}
            className={location.pathname === '/plan' ? styles.active : ''}
          >
            MEAL PLAN
          </button>
        </nav>

        {/* Authentication Section - Shows user status and login/logout buttons */}
        <div className={styles.authLinks}>
          {/* User Profile Display - Shows if user is logged in or in guest mode */}
          <div className={styles.userProfile}>
            {isAuthenticated && user ? (
              <span className={styles.userGreeting}>HI {user.fullName?.toUpperCase() || 'USER'}</span>
            ) : (
              <span className={styles.guestMode}>IN GUEST MODE</span>
            )}
          </div>

          {/* Login/Logout Button - Changes based on authentication status */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              LOG OUT
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className={styles.loginButton}
            >
              LOG IN
            </button>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
