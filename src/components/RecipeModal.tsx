import React from 'react';
import type { PlanEvent } from '../context/PlanContextTypes';
import styles from './RecipeModal.module.css';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: PlanEvent;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  recipe
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'main course': return '🍽️';
      case 'side dish': return '🥗';
      case 'dessert': return '🍰';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#546A04';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Recipe Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {recipe.image && (
            <div className={styles.recipeImageContainer}>
              <img
                src={recipe.image}
                alt={recipe.title}
                className={styles.recipeImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
                }}
              />
            </div>
          )}

          <div className={styles.recipeInfo}>
            <h3 className={styles.recipeTitle}>{recipe.title}</h3>

            <div className={styles.recipeMeta}>
              <div className={styles.mealType}>
                <span className={styles.mealTypeIcon}>
                  {getMealTypeIcon(recipe.mealType)}
                </span>
                <span>{recipe.mealType}</span>
              </div>

              <div className={styles.recipeDate}>
                📅 {formatDate(recipe.date)}
              </div>

              {recipe.difficulty && (
                <div
                  className={styles.difficultyBadge}
                  style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                >
                  {recipe.difficulty}
                </div>
              )}
            </div>

            <div className={styles.recipeDetails}>
              <div className={styles.detailRow}>
                {recipe.prepTime && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Prep Time:</span>
                    <span className={styles.detailValue}>{recipe.prepTime} minutes</span>
                  </div>
                )}

                {recipe.cookTime && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Cook Time:</span>
                    <span className={styles.detailValue}>{recipe.cookTime} minutes</span>
                  </div>
                )}

                {recipe.servings && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Servings:</span>
                    <span className={styles.detailValue}>{recipe.servings}</span>
                  </div>
                )}
              </div>

              {recipe.nutrition && (
                <div className={styles.nutritionSection}>
                  <h4>Nutrition Information</h4>
                  <div className={styles.nutritionGrid}>
                    <div className={styles.nutritionItem}>
                      <span className={styles.nutritionLabel}>Calories</span>
                      <span className={styles.nutritionValue}>{recipe.nutrition.calories}</span>
                    </div>
                    <div className={styles.nutritionItem}>
                      <span className={styles.nutritionLabel}>Protein</span>
                      <span className={styles.nutritionValue}>{recipe.nutrition.protein}g</span>
                    </div>
                    <div className={styles.nutritionItem}>
                      <span className={styles.nutritionLabel}>Carbs</span>
                      <span className={styles.nutritionValue}>{recipe.nutrition.carbs}g</span>
                    </div>
                    <div className={styles.nutritionItem}>
                      <span className={styles.nutritionLabel}>Fat</span>
                      <span className={styles.nutritionValue}>{recipe.nutrition.fat}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
