
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, authError, clearAuthError } = useAuth();

  // State variables to store form data and error messages
  const [email, setEmail] = useState('');        // Stores the email input value
  const [password, setPassword] = useState('');  // Stores the password input value
  const [error, setError] = useState('');        // Stores any error/warning messages to display
  const errorRef = useRef<HTMLDivElement | null>(null); // Ref to the error message container

  // When the centralized auth error changes, mirror it locally for display
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Monitor error state changes to ensure errors are properly displayed
  useEffect(() => {
    if (error && errorRef.current) {
      console.log('Error state updated - displaying error message:', error);
      // Bring the error into view and focus it for accessibility
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorRef.current.focus();
    }
  }, [error]);

  // Handle login form submission - this function processes the login attempt and displays errors
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login form submitted - clearing previous errors');
    // Clear any previous error messages when user tries to login again
    setError('');
    clearAuthError();

    // Step 1: Validate that email field is not empty
    if (!email.trim()) {
      console.log('Validation failed: Empty email field');
      setError('Please enter your email address');
      return;
    }

    // Step 2: Validate that password field is not empty
    if (!password.trim()) {
      console.log('Validation failed: Empty password field');
      setError('Please enter your password');
      return;
    }

    // Step 3: Validate email format using a simple regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log('Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return;
    }

    console.log('All validations passed - attempting login with Firebase');
    // Step 4: Attempt to login with Firebase authentication
    // The login function will catch Firebase errors and return user-friendly messages
    const result = await login(email.trim(), password);
    console.log('Login result received:', result);

    // Step 5: Handle the login result
    if (result.success) {
      // Login successful - redirect to recipes page
      console.log('Login successful - redirecting to recipes page');
      navigate('/recipes');
    } else {
      // Login failed - display the specific error message from Firebase
      // This will show user-friendly messages like "Invalid email or password"
      const errorMessage = result.error || 'Invalid email or password, please try again.';
      console.log('Login failed - setting error message:', errorMessage);

      // Use setTimeout to ensure the error state is set properly
      // This helps prevent any timing issues with state updates
      setTimeout(() => {
        setError(errorMessage);
      }, 0);
    }
  };



  return (
    <div className={styles.loginPageContainer}>
      {/* Logo section */}
      <div className={styles.logoSection}>
        <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.logo} />
      </div>

      <div className={styles.loginBox}>
        <h2 className={styles.title}>Log in</h2>
        <p className={styles.subtitle}>Welcome back to CravrPlan</p>

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
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) { setError(''); clearAuthError(); } }}
              required
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
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) { setError(''); clearAuthError(); } }}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>

        {/* Warning message - displays when login fails or validation errors occur (shown under the form) */}
        {error && (
          <div
            key={`error-${Date.now()}`}
            ref={errorRef}
            className={styles.errorMessage}
            role="alert"
            aria-live="polite"
            tabIndex={-1}
          >
            <strong>⚠️ Warning:</strong> {error}
          </div>
        )}

        {/* Section for "Don't have an account?" */}
        <p className={styles.signupText}>
          Don't have an account? <button onClick={() => navigate('/onboarding')} className={styles.signupLink}>SIGN UP</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 