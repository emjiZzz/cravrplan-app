// src/components/Header/Header.tsx

import React from 'react';
import styles from './Header.module.css';
import CravrPlanBowlLogo from '../assets/bowl-logo.png';

const Header: React.FC = () => {
  return (
    <div className={styles.headerWrapper}>

      <header className={styles.headerContainer}>
        <div className={styles.logo}>
          <img src={CravrPlanBowlLogo} alt="CravrPlan Logo" className={styles.logoImage} />
          <h1>CravrPlan</h1>
        </div>
        <nav className={styles.navigation}>
          <a href="/recipes" className={styles.active}>RECIPES</a>
          <a href="/plan">PLAN</a>
          <a href="/shop">SHOP</a>
        </nav>
        <div className={styles.authLinks}>
          <a href="/login">LOG IN</a>
        </div>
      </header>
    </div>
  );
};

export default Header;