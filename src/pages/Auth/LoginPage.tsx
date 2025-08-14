
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, continueAsGuest, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Enhanced validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await login(email.trim(), password);
    if (result.success) {
      navigate('/recipes');
    } else {
      setError(result.error || 'Login failed. Please try again.');
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

        {/* Error message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Section for "Don't have an account?" */}
        <p className={styles.signupText}>
          Don't have an account? <button onClick={() => navigate('/onboarding')} className={styles.signupLink}>SIGN UP</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 