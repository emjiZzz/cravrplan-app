import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OnboardingPage.module.css';
import CravrPlanLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';


interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  cookingLevel: string;
  timePreferences: string[];
  allergies: string[];
  spiceLevel: string;
  servingSize: string;
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const signupCompletedRef = useRef(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    cookingLevel: 'beginner',
    timePreferences: [],
    allergies: [],
    spiceLevel: 'medium',
    servingSize: '2-4'
  });
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const totalSteps = 7; // Back to 7 steps since we removed case 9

  // Handle signup success state
  useEffect(() => {
    if (isSignupSuccess) {
      // Signup success detected, user should be redirected to login
    }
  }, [isSignupSuccess]);

  const handlePreferenceChange = (category: keyof UserPreferences, value: string | string[]) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSignupDataChange = (field: string, value: string) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    // Prevent step changes after signup is complete
    if (signupCompletedRef.current) {
      // Preventing nextStep after signup completion
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    // Prevent step changes after signup is complete
    if (signupCompletedRef.current) {
      // Preventing prevStep after signup completion
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validation
    if (!signupData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!signupData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!signupData.password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validation passed, proceeding with signup

    // Set local loading state
    setIsSignupLoading(true);

    try {
      const result = await signup(signupData.fullName.trim(), signupData.email.trim(), signupData.password);

      if (result.success) {
        // Store preferences temporarily - they will be saved after user logs in
        try {
          localStorage.setItem('pending_preferences', JSON.stringify(preferences));
        } catch (error) {
          console.error('Error storing preferences:', error);
          // Don't block the signup flow if preferences fail to save
        }

        // Mark signup as complete
        setIsSignupSuccess(true);
        signupCompletedRef.current = true;

        // Redirect to login page after successful signup
        navigate('/login');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
        // Stay on signup form (case 7) and show error
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      // Clear local loading state
      setIsSignupLoading(false);
    }
  };

  const renderStep = () => {

    // If signup was successful, don't render any steps - user should be redirected
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
              {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian', 'French', 'Thai', 'Japanese', 'Greek', 'Spanish', 'Middle Eastern'].map(option => (
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
              {['Quick (15-30 min)', 'Medium (30-60 min)', 'Long (60+ min)', 'Meal Prep', 'Weekend Cooking'].map(option => (
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
            <div className={styles.stepIcon}>⚠️</div>
            <h3>Allergies & Restrictions</h3>
            <p>Do you have any food allergies or intolerances?</p>
            <div className={styles.optionsGrid}>
              {['Nuts', 'Dairy', 'Shellfish', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Sesame'].map(option => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionButton} ${preferences.allergies.includes(option) ? styles.selected : ''}`}
                  onClick={() => {
                    const updated = preferences.allergies.includes(option)
                      ? preferences.allergies.filter(item => item !== option)
                      : [...preferences.allergies, option];
                    handlePreferenceChange('allergies', updated);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>📝</div>
            <h3>Create Your Account</h3>
            <p>Almost done! Create your account to save your preferences.</p>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

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
                  onClick={() => navigate('/login')}
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

  return (
    <div className={styles.onboardingPageContainer}>
      {/* Logo section */}
      <div className={styles.logoSection}>
        <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.logo} />
      </div>

      <div className={styles.onboardingBox}>
        {/* Progress indicator */}
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

        {/* Step content */}
        <div className={styles.stepContainer}>
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className={styles.navigationButtons}>
          {currentStep > 1 && currentStep < 7 && !signupCompletedRef.current && (
            <button
              type="button"
              className={styles.backButton}
              onClick={prevStep}
            >
              Back
            </button>
          )}

          {currentStep < 6 && !signupCompletedRef.current && (
            <button
              type="button"
              className={styles.nextButton}
              onClick={nextStep}
            >
              Next
            </button>
          )}

          {currentStep === 6 && !signupCompletedRef.current && (
            <button
              type="button"
              className={styles.nextButton}
              onClick={nextStep}
            >
              Next
            </button>
          )}
        </div>

        {/* Skip option for early steps */}
        {currentStep <= 6 && !signupCompletedRef.current && (
          <button
            type="button"
            className={styles.skipButton}
            onClick={() => navigate('/login')}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
