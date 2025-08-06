import React from 'react';
import styles from './SignUpPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';

// This is our SignUpPage component, responsible for the user registration interface.
const SignUpPage: React.FC = () => {

  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Sign up button clicked!');
  };

  return (
    // The main container for our sign up page, centered on the screen.
    <div className={styles.signUpPageContainer}>
      {/* Logo section */}
      <div className={styles.logoSection}>
        <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.logo} />
      </div>

      <div className={styles.signUpBox}>
        <h2 className={styles.title}> Sign up </h2>
        <p className={styles.subtitle}> </p>

        {/* The sign up form itself */}
        <form className={styles.signUpForm} onSubmit={handleSignUp}>
          {/* Full Name Input Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder=" "
              className={styles.inputField}
              required // Makes this field mandatory
            />
          </div>

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

          {/* Confirm Password Input Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder=" "
              className={styles.inputField}
              required // Makes this field mandatory
            />
          </div>

          {/* Sign Up Button */}
          <button type="submit" className={styles.signUpButton}>SIGN UP</button>
        </form>

        {/* Section for "Already have an account?" */}
        <p className={styles.loginText}>
          Already have an account? <a href="/login" className={styles.loginLink}>LOG IN</a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage; 