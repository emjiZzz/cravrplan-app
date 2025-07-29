
import React from 'react';
import styles from './LoginPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';

// This is our LoginPage component, responsible for the user login interface.
const LoginPage: React.FC = () => {


  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login button clicked!');
  };

  return (
    // The main container for our login page, centered on the screen.
    <div className={styles.loginPageContainer}>
      {/* Logo section */}
      <div className={styles.logoSection}>
        <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.logo} />
      </div>

      <div className={styles.loginBox}>
        <h2 className={styles.title}> Log in </h2>
        <p className={styles.subtitle}> </p>

        {/* The login form itself */}
        <form className={styles.loginForm} onSubmit={handleLogin}>
          {/* Email Input Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              className={styles.inputField}
              required // Makes this field mandatory
            />
          </div>

          {/* Password Input Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder=" "
              className={styles.inputField}
              required // Makes this field mandatory
            />

          </div>

          {/* Login Button */}
          <button type="submit" className={styles.loginButton}>LOG IN</button>
        </form>

        {/* Section for "Don't have an account?" */}
        <p className={styles.signupText}>
          Don't have an account? <a href="#" className={styles.signupLink}>SIGN UP</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 