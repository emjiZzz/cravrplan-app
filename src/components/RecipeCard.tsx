import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RecipeCard.module.css';

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
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
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
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    // Preserve swap state if present when moving into detail
    const state = (location.state as any) || undefined;

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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#546A04';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getCookingTimeBadge = () => {
    if (recipe.readyInMinutes <= 15) {
      return { text: 'Quick', icon: '⚡', color: '#4CAF50' };
    } else if (recipe.readyInMinutes <= 30) {
      return { text: 'Fast', icon: '🏃', color: '#FF9800' };
    } else if (recipe.readyInMinutes <= 60) {
      return { text: 'Medium', icon: '⏰', color: '#FF5722' };
    } else {
      return { text: 'Slow', icon: '🐌', color: '#9C27B0' };
    }
  };

  const getNutritionColor = (nutrition: any, type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    if (!nutrition) return { backgroundColor: '#ccc', opacity: 0.5, percentage: 0 };

    const maxValues = {
      calories: 800,
      protein: 50,
      carbs: 100,
      fat: 40
    };

    const value = nutrition[type];
    const maxValue = maxValues[type];
    const percentage = Math.min((value / maxValue) * 100, 100);

    let backgroundColor = '#4CAF50';
    if (percentage > 80) backgroundColor = '#F44336';
    else if (percentage > 60) backgroundColor = '#FF9800';
    else if (percentage > 40) backgroundColor = '#FFC107';

    return {
      backgroundColor,
      opacity: 0.7 + (percentage / 100) * 0.3,
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

        {/* Overlay with badges */}
        <div className={styles.imageOverlay}>
          <div className={styles.badges}>
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
          </div>

          {/* Special indicators */}
          <div className={styles.indicators}>
            {recipe.veryHealthy && (
              <span className={styles.healthyIndicator} title="Very Healthy">
                🌿
              </span>
            )}
            {recipe.veryPopular && (
              <span className={styles.popularIndicator} title="Very Popular">
                ⭐
              </span>
            )}
            {recipe.cheap && (
              <span className={styles.cheapIndicator} title="Budget Friendly">
                💰
              </span>
            )}
            {recipe.sustainable && (
              <span className={styles.sustainableIndicator} title="Sustainable">
                🌱
              </span>
            )}
          </div>
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
        <h3 className={styles.recipeTitle}>{recipe.title}</h3>

        <div className={styles.recipeBadges}>
          <span className={styles.recipeBadge}>
            ⏱️ {recipe.readyInMinutes} min
          </span>
          <span className={styles.recipeBadge}>
            👥 {recipe.servings} servings
          </span>
          {recipe.difficulty && (
            <span
              className={styles.recipeBadge}
              style={{
                backgroundColor: getDifficultyColor(recipe.difficulty),
                color: 'white'
              }}
            >
              {getDifficultyIcon(recipe.difficulty)} {recipe.difficulty}
            </span>
          )}
          {(() => {
            const timeBadge = getCookingTimeBadge();
            return (
              <span
                className={styles.recipeBadge}
                style={{
                  backgroundColor: timeBadge.color,
                  color: 'white'
                }}
              >
                {timeBadge.icon} {timeBadge.text}
              </span>
            );
          })()}
          <span className={styles.recipeBadge}>
            ❤️ {recipe.aggregateLikes}
          </span>
          <span className={styles.recipeBadge}>
            🏥 {recipe.healthScore}
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
                />
                <span className={styles.nutritionLabel}>Calories</span>
                <span className={styles.nutritionValue}>{Math.round(recipe.nutrition.calories)}</span>
              </div>
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'protein').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'protein').opacity
                  }}
                />
                <span className={styles.nutritionLabel}>Protein</span>
                <span className={styles.nutritionValue}>{Math.round(recipe.nutrition.protein)}g</span>
              </div>
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'carbs').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'carbs').opacity
                  }}
                />
                <span className={styles.nutritionLabel}>Carbs</span>
                <span className={styles.nutritionValue}>{Math.round(recipe.nutrition.carbs)}g</span>
              </div>
              <div className={styles.nutritionItem}>
                <div
                  className={styles.nutritionIndicator}
                  style={{
                    backgroundColor: getNutritionColor(recipe.nutrition, 'fat').backgroundColor,
                    opacity: getNutritionColor(recipe.nutrition, 'fat').opacity
                  }}
                />
                <span className={styles.nutritionLabel}>Fat</span>
                <span className={styles.nutritionValue}>{Math.round(recipe.nutrition.fat)}g</span>
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

        {/* Action Button */}
        <button
          className={styles.viewRecipeButton}
          onClick={handleCardClick}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
