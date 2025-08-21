import React from 'react';
import { usePlan } from '../context/PlanContext';
import styles from './NutritionalStats.module.css';

// ===== NUTRITIONAL STATISTICS COMPONENT =====

/**
 * NutritionalStats Component
 * 
 * Displays daily nutritional statistics with visual progress bars and color-coded indicators.
 * Shows total calories, protein, carbs, and fat for a specific date.
 */
interface NutritionalStatsProps {
  date: string;                    // Date to show statistics for (YYYY-MM-DD format)
  className?: string;              // Optional CSS class for styling
}

const NutritionalStats: React.FC<NutritionalStatsProps> = ({ date, className }) => {
  const { getNutritionalStats } = usePlan();

  // Get nutritional statistics for the specified date
  const stats = getNutritionalStats(date);

  // Check if there are any meals planned for this date
  const hasMeals = stats.calories > 0 || stats.protein > 0 || stats.carbs > 0 || stats.fat > 0;

  // Daily recommended values (can be customized based on user preferences)
  const dailyRecommendations = {
    calories: 2000,
    protein: 50,    // grams
    carbs: 275,     // grams
    fat: 55         // grams
  };

  /**
   * Calculate percentage of daily recommendation
   * Returns a value between 0 and 100
   */
  const calculatePercentage = (current: number, recommended: number): number => {
    return Math.min((current / recommended) * 100, 100);
  };

  /**
   * Get color for nutrition type based on percentage
   * Returns appropriate color for visual indicators
   */
  const getNutritionColor = (_type: 'calories' | 'protein' | 'carbs' | 'fat', percentage: number): string => {
    if (percentage >= 100) return '#e74c3c'; // Red for over 100%
    if (percentage >= 80) return '#f39c12';  // Orange for 80-99%
    if (percentage >= 60) return '#f1c40f';  // Yellow for 60-79%
    return '#546A04';                        // Green for under 60% (matches app's primary green)
  };

  /**
   * Format nutrition value with appropriate units
   * Adds units and rounds to appropriate decimal places
   */
  const formatNutritionValue = (value: number, type: 'calories' | 'protein' | 'carbs' | 'fat'): string => {
    if (type === 'calories') {
      return `${Math.round(value)} cal`;
    }
    return `${Math.round(value)}g`;
  };

  return (
    <div className={`${styles.nutritionalStats} ${className || ''}`}>
      <h3 className={styles.statsTitle}>Daily Nutrition Summary</h3>
      <div className={styles.statsDate}>{new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>

      <div className={styles.statsGrid}>
        {/* Calories */}
        <div className={styles.statItem}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Calories</span>
            <span className={styles.statValue}>
              {formatNutritionValue(stats.calories, 'calories')}
            </span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${calculatePercentage(stats.calories, dailyRecommendations.calories)}%`,
                backgroundColor: getNutritionColor('calories', calculatePercentage(stats.calories, dailyRecommendations.calories))
              }}
            />
          </div>
          <div className={styles.statTarget}>
            Target: {formatNutritionValue(dailyRecommendations.calories, 'calories')}
          </div>
        </div>

        {/* Protein */}
        <div className={styles.statItem}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Protein</span>
            <span className={styles.statValue}>
              {formatNutritionValue(stats.protein, 'protein')}
            </span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${calculatePercentage(stats.protein, dailyRecommendations.protein)}%`,
                backgroundColor: getNutritionColor('protein', calculatePercentage(stats.protein, dailyRecommendations.protein))
              }}
            />
          </div>
          <div className={styles.statTarget}>
            Target: {formatNutritionValue(dailyRecommendations.protein, 'protein')}
          </div>
        </div>

        {/* Carbs */}
        <div className={styles.statItem}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Carbs</span>
            <span className={styles.statValue}>
              {formatNutritionValue(stats.carbs, 'carbs')}
            </span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${calculatePercentage(stats.carbs, dailyRecommendations.carbs)}%`,
                backgroundColor: getNutritionColor('carbs', calculatePercentage(stats.carbs, dailyRecommendations.carbs))
              }}
            />
          </div>
          <div className={styles.statTarget}>
            Target: {formatNutritionValue(dailyRecommendations.carbs, 'carbs')}
          </div>
        </div>

        {/* Fat */}
        <div className={styles.statItem}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Fat</span>
            <span className={styles.statValue}>
              {formatNutritionValue(stats.fat, 'fat')}
            </span>
          </div>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${calculatePercentage(stats.fat, dailyRecommendations.fat)}%`,
                backgroundColor: getNutritionColor('fat', calculatePercentage(stats.fat, dailyRecommendations.fat))
              }}
            />
          </div>
          <div className={styles.statTarget}>
            Target: {formatNutritionValue(dailyRecommendations.fat, 'fat')}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Meals:</span>
          <span className={styles.summaryValue}>
            {hasMeals ? 'Planned' : 'No meals planned'}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Daily Goal:</span>
          <span className={styles.summaryValue}>
            {hasMeals ? `${calculatePercentage(stats.calories, dailyRecommendations.calories).toFixed(0)}% met` : '0% met'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NutritionalStats;
