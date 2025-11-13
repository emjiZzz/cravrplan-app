import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RecipeCard.module.css';
import SafeImage from './SafeImage';

// ===== TYPE DEFINITIONS =====

// Types for nutrition data structure
interface NutritionNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface NutritionData {
  nutrients: NutritionNutrient[];
}

// Type for location state (used for recipe swapping functionality)
interface LocationState {
  swapFor?: string;
  [key: string]: unknown;
}

// Props interface for the RecipeCard component
interface RecipeCardProps {
  recipe: {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    cuisines: string[];
    diets: string[];
    dishTypes?: string[];
    summary?: string;
    nutrition?: NutritionData;
    tags?: string[];
  };
  onFavoriteToggle?: (recipeId: number, isFavorite: boolean) => void;
  isFavorite?: boolean;
}

/**
 * RecipeCard Component
 * 
 * Displays a recipe in a card format with image, title, description, badges,
 * nutrition information, and favorite functionality. Clicking the card navigates
 * to the recipe detail page.
 */
const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavoriteToggle,
  isFavorite = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Handles clicking on the recipe card
   * Navigates to the recipe detail page with recipe data and selected date
   */
  const handleCardClick = () => {
    // Preserve any existing state from the current location
    const prevState = (location.state as LocationState) || {};
    const state = { ...prevState, recipe } as LocationState & { recipe: typeof recipe };

    // Get selected date from URL parameters (for meal planning)
    const urlParams = new URLSearchParams(location.search);
    const selectedDate = urlParams.get('selectedDate');

    // Build navigation URL with optional selected date
    let navigateUrl = `/recipes/${recipe.id}`;
    if (selectedDate) {
      navigateUrl += `?selectedDate=${selectedDate}`;
    }

    navigate(navigateUrl, { state });
  };

  /**
   * Handles clicking the favorite button
   * Prevents card click and toggles favorite status with a small delay
   */
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking favorite button

    try {
      // Small delay for better user experience
      await new Promise(resolve => setTimeout(resolve, 300));
      onFavoriteToggle?.(recipe.id, isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // ===== HELPER FUNCTIONS =====

  /**
   * Gets the first cuisine badge to display
   */
  const getCuisineBadge = () => {
    return recipe.cuisines.length > 0 ? recipe.cuisines[0] : null;
  };

  /**
   * Gets the first diet badge to display
   */
  const getDietBadge = () => {
    return recipe.diets.length > 0 ? recipe.diets[0] : null;
  };

  /**
   * Returns the appropriate emoji icon for different meal types
   */
  const getMealTypeIcon = (dishType: string) => {
    switch (dishType.toLowerCase()) {
      case 'breakfast': return '🌅';
      case 'main course': return '🍽️';
      case 'side dish': return '🥗';
      case 'dessert': return '🍰';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  /**
   * Gets the first meal type badge to display
   */
  const getMealTypeBadge = () => {
    return recipe.dishTypes && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : null;
  };

  /**
   * Extracts nutrition value from nutrition data by nutrient name
   */
  const getNutritionValue = (nutrition: NutritionData | undefined, nutrientName: string): number => {
    if (!nutrition || !nutrition.nutrients) return 0;
    const nutrient = nutrition.nutrients.find((n: NutritionNutrient) =>
      n.name.toLowerCase().includes(nutrientName.toLowerCase())
    );
    return nutrient ? nutrient.amount : 0;
  };

  /**
   * Calculates nutrition color and opacity based on nutrient value
   * Returns color, opacity, and percentage for visual indicators
   */
  const getNutritionColor = (nutrition: NutritionData | undefined, type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (!nutrition) return { backgroundColor: '#ccc', opacity: 0.5, percentage: 0 };

    // Color scheme for different nutrition types
    const colors = {
      calories: '#9C27B0',
      protein: '#4CAF50',
      carbs: '#FFC107',
      fat: '#FF5722'
    };

    // Maximum values for percentage calculation
    const maxValues = {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65
    };

    const value = getNutritionValue(nutrition, type);
    const maxValue = maxValues[type];
    const percentage = Math.min((value / maxValue) * 100, 100);

    return {
      backgroundColor: colors[type],
      opacity: 0.6 + (percentage / 100) * 0.4,
      percentage: Math.round(percentage)
    };
  };

  return (
    <div
      className={`${styles.recipeCard} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Recipe image with overlay */}
      <div className={styles.imageContainer}>
        <SafeImage
          src={recipe.image}
          alt={recipe.title}
          className={styles.recipeImage}
          fallbackText="NO IMAGE"
        />

        {/* Image overlay for visual effects */}
        <div className={styles.imageOverlay}>
        </div>

        {/* Favorite button */}
        <button
          className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className={styles.heartIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>
      </div>

      {/* Recipe content section */}
      <div className={styles.content}>
        {/* Recipe title */}
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>

        {/* Recipe description (if available) */}
        {recipe.summary && (
          <div className={styles.recipeDescription}>
            <p className={styles.descriptionText}>
              {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 150)}
              {recipe.summary.length > 150 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Recipe badges (cuisine, diet, meal type, time) */}
        <div className={styles.recipeBadges}>
          {getCuisineBadge() && (
            <span className={styles.cuisineBadge}>
              {getCuisineBadge()}
            </span>
          )}
          {getDietBadge() && (
            <span className={styles.dietBadge}>
              {getDietBadge()}
            </span>
          )}
          {getMealTypeBadge() && (
            <span className={styles.mealTypeBadge}>
              {getMealTypeIcon(getMealTypeBadge() || '')} {getMealTypeBadge()}
            </span>
          )}
          <span className={styles.timeBadge}>
            ⏱️ {recipe.readyInMinutes} min
          </span>
        </div>

        {/* Nutrition information section */}
        {recipe.nutrition && (
          <div className={styles.nutritionSection}>
            <h4 className={styles.nutritionTitle}>Nutrition (per serving)</h4>
            <div className={styles.nutritionGrid}>
              {/* Calories */}
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'calories').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'calories').opacity
                  }}
                  data-percentage={`${getNutritionColor(recipe.nutrition, 'calories').percentage}%`}
                />
                <span className={styles.nutritionLabel}>Calories</span>
                <span className={styles.nutritionValue}>{Math.round(getNutritionValue(recipe.nutrition, 'calories'))} kcal</span>
              </div>
              {/* Protein */}
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'protein').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'protein').opacity
                  }}
                  data-percentage={`${getNutritionColor(recipe.nutrition, 'protein').percentage}%`}
                />
                <span className={styles.nutritionLabel}>Protein</span>
                <span className={styles.nutritionValue}>{Math.round(getNutritionValue(recipe.nutrition, 'protein'))}g</span>
              </div>
              {/* Carbohydrates */}
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'carbs').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'carbs').opacity
                  }}
                  data-percentage={`${getNutritionColor(recipe.nutrition, 'carbs').percentage}%`}
                />
                <span className={styles.nutritionLabel}>Carbs</span>
                <span className={styles.nutritionValue}>{Math.round(getNutritionValue(recipe.nutrition, 'carbohydrates'))}g</span>
              </div>
              {/* Fat */}
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'fat').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'fat').opacity
                  }}
                  data-percentage={`${getNutritionColor(recipe.nutrition, 'fat').percentage}%`}
                />
                <span className={styles.nutritionLabel}>Fat</span>
                <span className={styles.nutritionValue}>{Math.round(getNutritionValue(recipe.nutrition, 'fat'))}g</span>
              </div>
            </div>
          </div>
        )}

        {/* Recipe tags section */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className={styles.tagsSection}>
            <div className={styles.tagsContainer}>
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.recipeTag}>
                  #{tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className={styles.recipeTag}>
                  +{recipe.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
