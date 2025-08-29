
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

/**
 * LoginPage Component
 * 
 * Handles user authentication and login functionality.
 * Provides a form for users to enter their email and password,
 * validates input, and attempts to authenticate with Firebase.
 * Includes error handling and loading states.
 */
const LoginPage: React.FC = () => {
  // ===== HOOKS AND CONTEXT =====

  const navigate = useNavigate();                                    // Hook for programmatic navigation
  const { login, isLoading, authError, clearAuthError } = useAuth(); // Authentication context

  // ===== STATE MANAGEMENT =====

  const [email, setEmail] = useState('');        // Stores the email input value
  const [password, setPassword] = useState('');  // Stores the password input value
  const [error, setError] = useState('');        // Stores any error/warning messages to display
  const errorRef = useRef<HTMLDivElement | null>(null); // Ref to the error message container for accessibility

  // ===== EFFECTS =====

  /**
   * Sync local error state with authentication context error
   * When the centralized auth error changes, mirror it locally for display
   */
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  /**
   * Handle error display and accessibility
   * Monitor error state changes to ensure errors are properly displayed and focused
   */
  useEffect(() => {
    if (error && errorRef.current) {
      console.log('Error state updated - displaying error message:', error);
      // Bring the error into view and focus it for accessibility
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorRef.current.focus();
    }
  }, [error]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle login form submission
   * Processes the login attempt, validates input, and displays appropriate errors
   */
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

  /**
   * Handle input field changes
   * Updates the corresponding state and clears any existing errors
   */
  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }

    // Clear error when user starts typing
    if (error) {
      setError('');
      clearAuthError();
    }
  };

  /**
   * Navigate to signup page
   */
  const handleSignupClick = () => {
    navigate('/onboarding');
  };

  // ===== RENDER =====

  return (
    <div className={styles.loginPageContainer}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.logo} />
      </div>

      {/* Login Form Container */}
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Log in</h2>
        <p className={styles.subtitle}>Welcome back to CravrPlan</p>

        {/* Login Form */}
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
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              onChange={(e) => handleInputChange('password', e.target.value)}
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

        {/* Error Message Display */}
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

        {/* Signup Link */}
        <p className={styles.signupText}>
          Don't have an account? <button onClick={handleSignupClick} className={styles.signupLink}>SIGN UP</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 