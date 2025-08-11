import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import CravrPlanBowlLogo from '../assets/salad.png';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if we're on the Plan page
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
          <h1>CravrPlan</h1>
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
          {null}
        </nav>

        <div className={styles.authLinks}>
          {isAuthenticated ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>Welcome, {user?.fullName}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                LOG OUT
              </button>
            </div>
          ) : (
            <button onClick={() => handleNavClick('/login')}>LOG IN</button>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
