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
    veryHealthy: boolean;
    veryPopular: boolean;
    cheap: boolean;
    sustainable: boolean;
    summary?: string;
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
  const [isLoading, setIsLoading] = useState(false);

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

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      onFavoriteToggle?.(recipe.id, !isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isLoading ? (
            <span className={styles.loadingSpinner}>⏳</span>
          ) : (
            <span className={styles.heartIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.recipeTitle}>{recipe.title}</h3>

        <div className={styles.recipeMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>⏱️</span>
            <span>{recipe.readyInMinutes} min</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>👥</span>
            <span>{recipe.servings} servings</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>❤️</span>
            <span>{recipe.aggregateLikes}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>🏥</span>
            <span>{recipe.healthScore}</span>
          </div>
        </div>

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
