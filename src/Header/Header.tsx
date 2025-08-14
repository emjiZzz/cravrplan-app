import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import CravrPlanBowlLogo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isGuestMode, clearGuestData } = useGuest();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    if (isGuestMode) {
      clearGuestData();
      navigate('/');
    } else {
      logout();
      navigate('/');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const isPlanPage = location.pathname === '/plan';

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.headerContainer}>
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
        </div>

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

        <div className={styles.userSection}>
          <div className={styles.userProfile}>
            {isAuthenticated && user ? (
              <span className={styles.userGreeting}>HI {user.fullName?.toUpperCase() || 'USER'}</span>
            ) : (
              <span className={styles.guestMode}>IN GUEST MODE</span>
            )}
          </div>
        </div>

        <div className={styles.authLinks}>
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
