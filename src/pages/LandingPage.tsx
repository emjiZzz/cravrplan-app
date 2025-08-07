import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import CravrPlanLogo from '../assets/logo.png';
import bgImage from '../assets/bg-image.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🍽️',
      title: 'Smart Recipe Search',
      description: 'Discover thousands of recipes with advanced filtering and ingredient-based search'
    },
    {
      icon: '📅',
      title: 'Meal Planning',
      description: 'Plan your meals with our interactive calendar and nutritional tracking'
    },
    {
      icon: '🛒',
      title: 'Shopping Lists',
      description: 'Generate shopping lists automatically from your meal plans'
    },
    {
      icon: '🥬',
      title: 'Fridge to Recipe',
      description: 'Find recipes using ingredients you already have in your fridge'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Recipes' },
    { number: '50+', label: 'Cuisines' },
    { number: '24/7', label: 'Available' },
    { number: '100%', label: 'Free' }
  ];

  return (
    <div className={styles.landingContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <img src={bgImage} alt="Food background" className={styles.heroBgImage} />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <img src={CravrPlanLogo} alt="CravrPlan Logo" className={styles.heroLogo} />
          </div>

          <h1 className={styles.heroTitle}>
            Plan Your Meals,
            <span className={styles.highlight}> Love Your Food</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Discover recipes, plan your meals, and create shopping lists all in one place.
            Make cooking easier and more enjoyable with CravrPlan.
          </p>

          <div className={styles.heroActions}>
            <button
              onClick={() => navigate('/recipes')}
              className={styles.primaryButton}
            >
              Explore Recipes
            </button>
            <button
              onClick={() => navigate('/plan')}
              className={styles.secondaryButton}
            >
              Start Planning
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose CravrPlan?</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to make meal planning simple and enjoyable
          </p>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Transform Your Meal Planning?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of users who have simplified their cooking routine with CravrPlan
          </p>
          <div className={styles.ctaActions}>
            <button
              onClick={() => navigate('/signup')}
              className={styles.ctaPrimaryButton}
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className={styles.ctaSecondaryButton}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.quickActionsSection}>
        <div className={styles.container}>
          <h3 className={styles.quickActionsTitle}>Quick Start</h3>
          <div className={styles.quickActionsGrid}>
            <button
              onClick={() => navigate('/fridge')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>🥬</div>
              <h4>What's in My Fridge?</h4>
              <p>Find recipes with ingredients you have</p>
            </button>

            <button
              onClick={() => navigate('/recipes')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>🔍</div>
              <h4>Browse Recipes</h4>
              <p>Discover new dishes to try</p>
            </button>

            <button
              onClick={() => navigate('/plan')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>📅</div>
              <h4>Plan Meals</h4>
              <p>Create your weekly meal plan</p>
            </button>

            <button
              onClick={() => navigate('/shop')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>🛒</div>
              <h4>Shopping List</h4>
              <p>Generate your grocery list</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 