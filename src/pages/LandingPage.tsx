import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import CravrPlanLogo from '../assets/logo.png';
import bgImage from '../assets/bg-image.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: '🍽️',
      title: 'Smart Recipe Search',
      description: 'Discover thousands of recipes with advanced filtering and ingredient-based search. Find exactly what you\'re craving!',
      color: '#FF6B6B'
    },
    {
      icon: '📅',
      title: 'Intelligent Meal Planning',
      description: 'Plan your meals with our interactive calendar and nutritional tracking. Stay organized and healthy!',
      color: '#4ECDC4'
    },
    {
      icon: '✓',
      title: 'Fridge to Recipe Magic',
      description: 'Find recipes using ingredients you already have in your fridge. Reduce waste and save money!',
      color: '#45B7D1'
    },
    {
      icon: '✓',
      title: 'Personalized Experience',
      description: 'Save your favorite recipes, track your preferences, and get personalized recommendations!',
      color: '#96CEB4'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Recipes Available', icon: '🍳' },
    { number: '50+', label: 'Global Cuisines', icon: '🌍' },
    { number: '24/7', label: 'Always Available', icon: '⏰' },
    { number: '100%', label: 'Completely Free', icon: '✓' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Home Chef',
      content: 'CravrPlan has completely transformed how I plan meals. The fridge-to-recipe feature is a game-changer!',
      avatar: '👩‍🍳'
    },
    {
      name: 'Mike Chen',
      role: 'Busy Parent',
      content: 'Finally, a meal planning app that actually works! My family loves the variety of recipes we discover.',
      avatar: '👨‍👩‍👧‍👦'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Health Enthusiast',
      content: 'The nutritional tracking and healthy recipe options have helped me maintain my fitness goals.',
      avatar: '🏃‍♀️'
    }
  ];

  const benefits = [
    {
      icon: '✓',
      title: 'Save Money',
      description: 'Reduce food waste and make the most of your grocery budget'
    },
    {
      icon: '✓',
      title: 'Save Time',
      description: 'Quick meal planning and organized shopping lists'
    },
    {
      icon: '✓',
      title: 'Eat Healthier',
      description: 'Discover nutritious recipes and track your nutrition'
    },
    {
      icon: '✓',
      title: 'Reduce Stress',
      description: 'No more "what\'s for dinner" dilemmas'
    }
  ];

  return (
    <div className={styles.landingContainer}>
      {/* Hero Section */}
      <section className={`${styles.heroSection} ${isVisible ? styles.visible : ''}`}>
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
            Transform your cooking experience with intelligent meal planning, smart recipe discovery,
            and personalized recommendations. Make every meal a delightful adventure.
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

          <div className={styles.heroScroll}>
            <div className={styles.scrollIndicator}>
              <span>Scroll to explore</span>
              <div className={styles.scrollArrow}>↓</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`${styles.featuresSection} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose CravrPlan?</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to make meal planning simple, enjoyable, and sustainable
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard} style={{ '--accent-color': feature.color } as React.CSSProperties}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <div className={styles.featureAccent}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${styles.statsSection} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`${styles.benefitsSection} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Transform Your Cooking Experience</h2>
            <p className={styles.sectionSubtitle}>
              Join thousands of users who have revolutionized their meal planning
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDescription}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`${styles.testimonialsSection} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Our Users Say</h2>
            <p className={styles.sectionSubtitle}>
              Real stories from real people who love CravrPlan
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"{testimonial.content}"</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{testimonial.avatar}</div>
                  <div className={styles.testimonialInfo}>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${styles.ctaSection} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Transform Your Meal Planning?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of users who have simplified their cooking routine and discovered the joy of organized meal planning
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
        </div>
      </section>

      {/* Quick Actions */}
      <section className={`${styles.quickActionsSection} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.quickActionsTitle}>Quick Start Your Journey</h3>
            <p className={styles.sectionSubtitle}>
              Choose your path and start exploring the world of delicious possibilities
            </p>
          </div>

          <div className={styles.quickActionsGrid}>
            <button
              onClick={() => navigate('/fridge')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>✓</div>
              <h4>What's in My Fridge?</h4>
              <p>Find recipes with ingredients you have</p>
              <div className={styles.quickActionArrow}>→</div>
            </button>

            <button
              onClick={() => navigate('/recipes')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>✓</div>
              <h4>Browse Recipes</h4>
              <p>Discover new dishes to try</p>
              <div className={styles.quickActionArrow}>→</div>
            </button>

            <button
              onClick={() => navigate('/plan')}
              className={styles.quickActionCard}
            >
              <div className={styles.quickActionIcon}>✓</div>
              <h4>Plan Meals</h4>
              <p>Create your weekly meal plan</p>
              <div className={styles.quickActionArrow}>→</div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 