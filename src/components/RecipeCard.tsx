import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import styles from './RecipeCard.module.css';

interface NutritionNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface NutritionData {
  nutrients: NutritionNutrient[];
}

interface LocationState {
  swapFor?: string;
  [key: string]: unknown;
}

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

  const handleCardClick = () => {
    // Preserve swap state if present when moving into detail
    const state = (location.state as LocationState) || undefined;

    // Preserve selectedDate from URL if present
    const urlParams = new URLSearchParams(location.search);
    const selectedDate = urlParams.get('selectedDate');

    // Build the navigation URL with selectedDate if it exists
    let navigateUrl = `/recipes/${recipe.id}`;
    if (selectedDate) {
      navigateUrl += `?selectedDate=${selectedDate}`;
    }

    navigate(navigateUrl, { state });
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      onFavoriteToggle?.(recipe.id, isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getCuisineBadge = () => {
    if (recipe.cuisines.length > 0) {
      return recipe.cuisines[0];
    }
    return null;
  };

  const getDietBadge = () => {
    if (recipe.diets.length > 0) {
      return recipe.diets[0];
    }
    return null;
  };

  const getMealTypeIcon = (dishType: string) => {
    switch (dishType.toLowerCase()) {
      case 'breakfast': return '🌅';
      case 'main course': return '🍽️';
      case 'side dish': return '🥗';
      case 'dessert': return '🍰';
      case 'snack': return '🍎';
      case 'appetizer': return '🥨';
      case 'salad': return '🥗';
      case 'soup': return '🍲';
      case 'bread': return '🍞';
      case 'drink': return '🥤';
      default: return '🍽️';
    }
  };

  const getMealTypeBadge = () => {
    if (recipe.dishTypes && recipe.dishTypes.length > 0) {
      return recipe.dishTypes[0];
    }
    return null;
  };



  const getNutritionValue = (nutrition: NutritionData | undefined, nutrientName: string): number => {
    if (!nutrition || !nutrition.nutrients) return 0;
    const nutrient = nutrition.nutrients.find((n: NutritionNutrient) =>
      n.name.toLowerCase().includes(nutrientName.toLowerCase())
    );
    return nutrient ? nutrient.amount : 0;
  };

  const getNutritionColor = (nutrition: NutritionData | undefined, type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (!nutrition) return { backgroundColor: '#ccc', opacity: 0.5, percentage: 0 };

    // Match the color scheme from PlanPage
    const colors = {
      calories: '#9C27B0', // Purple
      protein: '#4CAF50',  // Green
      carbs: '#FFC107',    // Yellow
      fat: '#FF5722'       // Orange/Red
    };

    const maxValues = {
      calories: 2000, // Daily recommended calories
      protein: 50,    // Daily recommended protein (g)
      carbs: 300,     // Daily recommended carbs (g)
      fat: 65         // Daily recommended fat (g)
    };

    const value = getNutritionValue(nutrition, type);
    const maxValue = maxValues[type];
    const percentage = Math.min((value / maxValue) * 100, 100);

    return {
      backgroundColor: colors[type],
      opacity: 0.6 + (percentage / 100) * 0.4, // Opacity between 0.6 and 1.0
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
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className={styles.recipeImage}
          loading="lazy"
        />

        {/* Overlay with special indicators only */}
        <div className={styles.imageOverlay}>
        </div>

        {/* Favorite Button */}
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

      {/* Content */}
      <div className={styles.content}>
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>

        {/* Recipe Description */}
        {recipe.summary && (
          <div className={styles.recipeDescription}>
            <p className={styles.descriptionText}>
              {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 150)}
              {recipe.summary.length > 150 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Recipe Badges */}
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

        {/* Nutritional Information */}
        {recipe.nutrition && (
          <div className={styles.nutritionSection}>
            <h4 className={styles.nutritionTitle}>Nutrition (per serving)</h4>
            <div className={styles.nutritionGrid}>
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

        {/* Recipe Tags */}
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
