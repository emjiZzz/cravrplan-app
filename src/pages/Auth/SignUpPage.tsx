import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUpPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

// This is our SignUpPage component, responsible for the user registration interface.
const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Enhanced validation with specific messages
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const result = await signup(fullName.trim(), email.trim(), password);
    if (result.success) {
      // Show success message and redirect to home page since user is now logged in
      setError(''); // Clear any existing errors
      setSuccessMessage('Account created successfully! Redirecting to home page...');

      // Redirect to home page after a short delay since user is automatically logged in
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      // Show specific error messages
      if (result.error?.includes('User with this email already exists')) {
        setError('An account with this email address already exists. Please use a different email or try logging in.');
      } else if (result.error?.includes('All fields are required')) {
        setError('Please fill in all required fields');
      } else if (result.error?.includes('valid email address')) {
        setError('Please enter a valid email address');
      } else if (result.error?.includes('at least 6 characters')) {
        setError('Password must be at least 6 characters long');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    }
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

        {/* Error message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required // Makes this field mandatory
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className={styles.signUpButton}
            disabled={isLoading}
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
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