// src/components/Header/Header.tsx

import React from 'react';
import styles from './Header.module.css'; // Make sure this path is correct relative to Header.tsx

const Header: React.FC = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoSection}>
        <div className={styles.bowlIconPlaceholder}></div>
        <span className={styles.appName}>CravrPlan</span>
      </div>

      <nav className={styles.navigation}>
        <a href="#" className={styles.navLink}>RECIPES</a>
        <a href="#" className={styles.navLink}>PLAN</a>
        <a href="#" className={styles.navLink}>SHOP</a>
      </nav>

      <div className={styles.userStatus}>
        <a href="#" className={styles.navLink}>LOG IN</a>
      </div>
    </header>
  );
};

export default Header; // This line is absolutely essential!