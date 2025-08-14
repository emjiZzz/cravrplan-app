import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import styles from './RecipeCard.module.css';

// Types for nutrition data that comes from the API
interface NutritionNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface NutritionData {
  nutrients: NutritionNutrient[];
}

// Type for any extra data that might be passed through navigation
interface LocationState {
  swapFor?: string;
  [key: string]: unknown;
}

// Props that this component needs to display a recipe
interface RecipeCardProps {
  recipe: {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    aggregateLikes: number;
    healthScore: number;
    cuisines: string[];
    diets: string[];
    dishTypes?: string[];
    veryHealthy: boolean;
    veryPopular: boolean;
    cheap: boolean;
    sustainable: boolean;
    summary?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    nutrition?: NutritionData;
    tags?: string[];
  };
  onFavoriteToggle?: (recipeId: number, isFavorite: boolean) => void;
  isFavorite?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavoriteToggle,
  isFavorite = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Handle clicking on the recipe card to go to detail page
  const handleCardClick = () => {
    const state = (location.state as LocationState) || undefined;
    const urlParams = new URLSearchParams(location.search);
    const selectedDate = urlParams.get('selectedDate');

    // Build the URL to navigate to
    let navigateUrl = `/recipes/${recipe.id}`;
    if (selectedDate) {
      navigateUrl += `?selectedDate=${selectedDate}`;
    }

    navigate(navigateUrl, { state });
  };

  // Handle clicking the favorite button (separate from card click)
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click from happening

    try {
      // Small delay to make the interaction feel more natural
      await new Promise(resolve => setTimeout(resolve, 300));
      onFavoriteToggle?.(recipe.id, isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Get the first cuisine type to show as a badge
  const getCuisineBadge = () => {
    return recipe.cuisines.length > 0 ? recipe.cuisines[0] : null;
  };

  // Get the first diet type to show as a badge
  const getDietBadge = () => {
    return recipe.diets.length > 0 ? recipe.diets[0] : null;
  };

  // Get emoji icon for different meal types
  const getMealTypeIcon = (dishType: string) => {
    const icons: { [key: string]: string } = {
      'breakfast': '🌅',
      'main course': '🍽️',
      'side dish': '🥗',
      'dessert': '🍰',
      'snack': '🍎',
      'appetizer': '🥨',
      'salad': '🥗',
      'soup': '🍲',
      'bread': '🍞',
      'drink': '🥤'
    };

    return icons[dishType.toLowerCase()] || '🍽️';
  };

  // Get the first dish type to show as a badge
  const getMealTypeBadge = () => {
    return recipe.dishTypes && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : null;
  };

  // Helper function to get nutrition values from the API data
  const getNutritionValue = (nutrition: NutritionData | undefined, nutrientName: string): number => {
    if (!nutrition || !nutrition.nutrients) return 0;
    const nutrient = nutrition.nutrients.find((n: NutritionNutrient) =>
      n.name.toLowerCase().includes(nutrientName.toLowerCase())
    );
    return nutrient ? nutrient.amount : 0;
  };

  // Calculate color and opacity for nutrition bars based on how much of daily value it represents
  const getNutritionColor = (nutrition: NutritionData | undefined, type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (!nutrition) return { backgroundColor: '#ccc', opacity: 0.5, percentage: 0 };

    // Colors for each nutrition type
    const colors = {
      calories: '#9C27B0',
      protein: '#4CAF50',
      carbs: '#FFC107',
      fat: '#FF5722'
    };

    // Daily recommended values (rough estimates)
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
      opacity: 0.6 + (percentage / 100) * 0.4, // more intense color for higher percentages
      percentage: Math.round(percentage)
    };
  };

  // Render a single nutrition item (calories, protein, etc.)
  const renderNutritionItem = (type: 'calories' | 'protein' | 'carbs' | 'fat', label: string, unit: string) => {
    if (!recipe.nutrition) return null;

    const nutritionColor = getNutritionColor(recipe.nutrition, type);
    const value = getNutritionValue(recipe.nutrition, type);

    return (
      <div className={styles.nutritionItem}>
        <div
          className={styles.nutritionIndicator}
          style={{
            backgroundColor: nutritionColor.backgroundColor,
            opacity: nutritionColor.opacity
          }}
          data-percentage={`${nutritionColor.percentage}%`}
        />
        <span className={styles.nutritionLabel}>{label}</span>
        <span className={styles.nutritionValue}>{Math.round(value)}{unit}</span>
      </div>
    );
  };

  return (
    <div
      className={`${styles.recipeCard} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Recipe image section */}
      <div className={styles.imageContainer}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className={styles.recipeImage}
          loading="lazy" // load image only when it's about to be visible
        />

        <div className={styles.imageOverlay} />

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
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>

        {/* Recipe description/summary */}
        {recipe.summary && (
          <div className={styles.recipeDescription}>
            <p className={styles.descriptionText}>
              {/* Remove HTML tags and limit to 150 characters */}
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
              {renderNutritionItem('calories', 'Calories', ' kcal')}
              {renderNutritionItem('protein', 'Protein', 'g')}
              {renderNutritionItem('carbs', 'Carbs', 'g')}
              {renderNutritionItem('fat', 'Fat', 'g')}
            </div>
          </div>
        )}

        {/* Recipe tags section */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className={styles.tagsSection}>
            <div className={styles.tagsContainer}>
              {/* Show first 3 tags */}
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.recipeTag}>
                  #{tag}
                </span>
              ))}
              {/* Show count of remaining tags if there are more than 3 */}
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
