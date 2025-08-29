import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OnboardingPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import type { UserPreferences } from '../../utils/preferenceMapper';

/**
 * OnboardingPage Component
 * 
 * Multi-step onboarding process for new users.
 * Collects user preferences (dietary restrictions, cuisine preferences, cooking level, time preferences)
 * and creates a new user account. Guides users through a 6-step process to personalize their experience.
 */
const OnboardingPage: React.FC = () => {
  // ===== HOOKS AND CONTEXT =====

  const navigate = useNavigate();                    // Hook for programmatic navigation
  const { signup } = useAuth();                     // Authentication context for user signup

  // ===== STATE MANAGEMENT =====

  const [currentStep, setCurrentStep] = useState(1);  // Current step in the onboarding process
  const signupCompletedRef = useRef(false);          // Ref to track if signup is completed (prevents step changes)

  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    cookingLevel: 'beginner',
    timePreferences: []
  });

  // Signup form data state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [error, setError] = useState('');              // Error message display
  const [isSignupLoading, setIsSignupLoading] = useState(false);  // Loading state during signup
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);  // Success state after signup

  // ===== CONSTANTS =====

  const totalSteps = 6;  // Total number of onboarding steps

  // ===== EFFECTS =====

  /**
   * Handle signup success state
   * Monitors when signup is successful and logs the event
   */
  useEffect(() => {
    if (isSignupSuccess) {
      console.log('Signup success detected, user should be redirected to login');
    }
  }, [isSignupSuccess]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle preference changes for any category
   * @param category - The preference category to update
   * @param value - The new value(s) for the category
   */
  const handlePreferenceChange = (category: keyof UserPreferences, value: string | string[]) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  /**
   * Handle signup form data changes
   * @param field - The form field to update
   * @param value - The new value for the field
   */
  const handleSignupDataChange = (field: string, value: string) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Navigate to the next step in the onboarding process
   * Prevents navigation after signup completion
   */
  const nextStep = () => {
    // Prevent step changes after signup is complete
    if (signupCompletedRef.current) {
      console.log('Preventing nextStep after signup completion');
      return;
    }

    console.log('nextStep called, currentStep:', currentStep, 'totalSteps:', totalSteps);
    if (currentStep < totalSteps) {
      console.log('Setting currentStep to:', currentStep + 1);
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  /**
   * Navigate to the previous step in the onboarding process
   * Prevents navigation after signup completion
   */
  const prevStep = () => {
    // Prevent step changes after signup is complete
    if (signupCompletedRef.current) {
      console.log('Preventing prevStep after signup completion');
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  /**
   * Handle signup form submission
   * Validates form data and creates a new user account
   */
  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('=== SIGNUP PROCESS START ===');
    console.log('Signup form submitted');
    console.log('Form data:', signupData);
    setError('');

    // Step 1: Validate full name
    if (!signupData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    // Step 2: Validate email
    if (!signupData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Step 3: Validate password
    if (!signupData.password.trim()) {
      setError('Please enter a password');
      return;
    }

    // Step 4: Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Step 5: Validate password length
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    console.log('Validation passed, calling signup...');
    console.log('Email being used:', signupData.email.trim());

    // Set local loading state
    setIsSignupLoading(true);

    try {
      // Attempt to create user account
      const result = await signup(signupData.fullName.trim(), signupData.email.trim(), signupData.password);
      console.log('Signup result:', result);

      if (result.success) {
        console.log('=== SIGNUP SUCCESS ===');
        console.log('Signup successful, redirecting to login...');

        // Store preferences temporarily - they will be saved after user logs in
        try {
          localStorage.setItem('pending_preferences', JSON.stringify(preferences));
          console.log('Preferences stored temporarily, will be saved after login');
        } catch (error) {
          console.error('Error storing preferences:', error);
          // Don't block the signup flow if preferences fail to save
        }

        // Mark signup as complete
        setIsSignupSuccess(true);
        signupCompletedRef.current = true;

        // Note: User is already signed out by AuthContext after signup
        console.log('User signed out after successful signup');

        // Redirect to login page after successful signup
        console.log('Redirecting to login page...');
        navigate('/login');
      } else {
        console.log('=== SIGNUP FAILED ===');
        console.log('Signup failed:', result.error);
        setError(result.error || 'Signup failed. Please try again.');
        // Stay on signup form (case 6) and show error
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      // Clear local loading state
      setIsSignupLoading(false);
    }
  };

  /**
   * Navigate to login page
   */
  const handleSkipToLogin = () => {
    navigate('/login');
  };

  // ===== STEP RENDERING =====

  /**
   * Render the appropriate step content based on current step
   */
  const renderStep = () => {
    console.log('Rendering step:', currentStep, 'Signup completed:', signupCompletedRef.current, 'Signup success:', isSignupSuccess);

    // If signup was successful, show success message
    if (isSignupSuccess) {
      return (
        <div className={styles.stepContent}>
          <div className={styles.stepIcon}>🎉</div>
          <h3>Account Created Successfully!</h3>
          <p>Redirecting to login page...</p>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      );
    }

    // Render different content based on current step
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>🎯</div>
            <h3>Welcome to CravrPlan!</h3>
            <p>Let's personalize your experience by setting up your preferences. This will help us show you the best recipes for your taste and lifestyle.</p>
            <div className={styles.welcomeFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🍽️</span>
                <span>Personalized recipe recommendations</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⏱️</span>
                <span>Meal planning based on your schedule</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🥗</span>
                <span>Dietary preference filtering</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>🥗</div>
            <h3>Dietary Preferences</h3>
            <p>Select any dietary restrictions or preferences you follow:</p>
            <div className={styles.optionsGrid}>
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein'].map(option => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionButton} ${preferences.dietaryRestrictions.includes(option) ? styles.selected : ''}`}
                  onClick={() => {
                    const updated = preferences.dietaryRestrictions.includes(option)
                      ? preferences.dietaryRestrictions.filter(item => item !== option)
                      : [...preferences.dietaryRestrictions, option];
                    handlePreferenceChange('dietaryRestrictions', updated);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>🌍</div>
            <h3>Cuisine Preferences</h3>
            <p>What types of cuisine do you enjoy most?</p>
            <div className={styles.optionsGrid}>
              {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian', 'French', 'Thai', 'Japanese', 'Greek', 'Middle Eastern'].map(option => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionButton} ${preferences.cuisinePreferences.includes(option) ? styles.selected : ''}`}
                  onClick={() => {
                    const updated = preferences.cuisinePreferences.includes(option)
                      ? preferences.cuisinePreferences.filter(item => item !== option)
                      : [...preferences.cuisinePreferences, option];
                    handlePreferenceChange('cuisinePreferences', updated);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>👨‍🍳</div>
            <h3>Cooking Experience</h3>
            <p>What's your cooking skill level?</p>
            <div className={styles.optionsColumn}>
              {[
                { value: 'beginner', label: 'Beginner', description: 'New to cooking, prefer simple recipes' },
                { value: 'intermediate', label: 'Intermediate', description: 'Some experience, comfortable with most recipes' },
                { value: 'expert', label: 'Expert', description: 'Experienced cook, enjoy complex recipes' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.optionCard} ${preferences.cookingLevel === option.value ? styles.selected : ''}`}
                  onClick={() => handlePreferenceChange('cookingLevel', option.value)}
                >
                  <div className={styles.optionCardContent}>
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>⏰</div>
            <h3>Time Preferences</h3>
            <p>How much time do you typically have for cooking?</p>
            <div className={styles.optionsGrid}>
              {['Quick (15-30 min)', 'Medium (30-60 min)', 'Long (60+ min)'].map(option => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionButton} ${preferences.timePreferences.includes(option) ? styles.selected : ''}`}
                  onClick={() => {
                    const updated = preferences.timePreferences.includes(option)
                      ? preferences.timePreferences.filter(item => item !== option)
                      : [...preferences.timePreferences, option];
                    handlePreferenceChange('timePreferences', updated);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>📝</div>
            <h3>Create Your Account</h3>
            <p>Almost done! Create your account to save your preferences.</p>

            {/* Error Message Display */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className={styles.signupForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName" className={styles.label}>Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className={styles.inputField}
                  value={signupData.fullName}
                  onChange={(e) => handleSignupDataChange('fullName', e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  className={styles.inputField}
                  value={signupData.email}
                  onChange={(e) => handleSignupDataChange('email', e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  type="password"
                  id="password"
                  className={styles.inputField}
                  value={signupData.password}
                  onChange={(e) => handleSignupDataChange('password', e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={styles.inputField}
                  value={signupData.confirmPassword}
                  onChange={(e) => handleSignupDataChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formButtons}>
                <button
                  type="submit"
                  className={styles.signupButton}
                  disabled={isSignupLoading}
                >
                  {isSignupLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleSkipToLogin}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  // ===== RENDER =====

  return (
    <div className={styles.onboardingPageContainer}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.logo} />
      </div>

      {/* Main Onboarding Container */}
      <div className={styles.onboardingBox}>
        {/* Progress Indicator */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${signupCompletedRef.current || isSignupSuccess ? 100 : (currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>
            {signupCompletedRef.current || isSignupSuccess ? 'Complete!' : `Step ${currentStep} of ${totalSteps}`}
          </p>
        </div>

        {/* Step Content */}
        <div className={styles.stepContainer}>
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className={styles.navigationButtons}>
          {/* Back Button - Show on steps 2-5 */}
          {currentStep > 1 && currentStep < 6 && !signupCompletedRef.current && (
            <button
              type="button"
              className={styles.backButton}
              onClick={prevStep}
            >
              Back
            </button>
          )}

          {/* Next Button - Show on steps 1-5 */}
          {currentStep < 5 && !signupCompletedRef.current && (
            <button
              type="button"
              className={styles.nextButton}
              onClick={nextStep}
            >
              Next
            </button>
          )}

          {/* Next Button for step 5 */}
          {currentStep === 5 && !signupCompletedRef.current && (
            <button
              type="button"
              className={styles.nextButton}
              onClick={nextStep}
            >
              Next
            </button>
          )}
        </div>

        {/* Skip Option - Show on steps 1-5 */}
        {currentStep <= 5 && !signupCompletedRef.current && (
          <button
            type="button"
            className={styles.skipButton}
            onClick={handleSkipToLogin}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
