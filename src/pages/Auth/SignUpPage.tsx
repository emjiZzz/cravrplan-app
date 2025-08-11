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

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const success = await signup(fullName, email, password);
    if (success) {
      navigate('/recipes');
    } else {
      setError('Failed to create account. Please try again.');
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