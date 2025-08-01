import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import CravrPlanBowlLogo from '../assets/bowl-logo.png';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
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
            className={location.pathname === '/recipes' ? styles.active : ''}
          >
            RECIPES
          </button>
          <button
            onClick={() => handleNavClick('/plan')}
            className={location.pathname === '/plan' ? styles.active : ''}
          >
            MEAL PLAN
          </button>
          <button
            onClick={() => handleNavClick('/shop')}
            className={location.pathname === '/shop' ? styles.active : ''}
          >
            GROCERY
          </button>
        </nav>

        <div className={styles.authLinks}>
          <button onClick={() => handleNavClick('/login')}>LOG IN</button>
        </div>
      </header>
    </div>
  );
};

export default Header;
