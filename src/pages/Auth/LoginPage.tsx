
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

// This is our LoginPage component, responsible for the user login interface.
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/recipes');
    } else {
      setError('Invalid email or password');
    }
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
          Don't have an account? <a href="/signup" className={styles.signupLink}>SIGN UP</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 