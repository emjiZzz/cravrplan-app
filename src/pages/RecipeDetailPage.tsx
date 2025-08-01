/* src/pages/RecipeDetailPage.tsx */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeDetails } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';
import styles from './RecipeDetailPage.module.css';
import AddToPlanModal from '../components/AddToPlanModal';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const data = await getRecipeDetails(Number(id));
          setRecipe(data);
        } else {
          setError('No recipe ID provided.');
        }
      } catch (err) {
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading recipe...</p>
    </div>
  );

  if (error) return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>⚠️</div>
      <p>{error}</p>
    </div>
  );

  if (!recipe) return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>❌</div>
      <p>No recipe found.</p>
    </div>
  );

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Helper function to get cuisine type
  const getCuisineType = () => {
    if (recipe.cuisines && recipe.cuisines.length > 0) {
      return recipe.cuisines[0];
    }
    if (recipe.dishTypes && recipe.dishTypes.length > 0) {
      return recipe.dishTypes[0];
    }
    return 'International';
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.recipeHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>&larr;</button>
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.imageSection}>
          <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />

          {/* Image Overlay with Stats */}
          <div className={styles.imageOverlay}>
            <div className={styles.recipeStats}>
              {recipe.readyInMinutes && (
                <div className={styles.statBadge}>
                  ⏱️ {formatTime(recipe.readyInMinutes)}
                </div>
              )}
              {recipe.servings && (
                <div className={styles.statBadge}>
                  👥 {recipe.servings} servings
                </div>
              )}
            </div>
          </div>

          {/* Add to Plan Hover Overlay */}
          <div
            className={styles.addToPlanOverlay}
            onClick={() => setIsModalOpen(true)}
            title="Add to Meal Plan"
          >
            <div className={styles.addToPlanText}>
              ADD THIS TO MEAL PLAN?
            </div>
          </div>
        </div>

        <div className={styles.detailsSection}>
          {/* Recipe Info Header */}
          <div className={styles.recipeInfoHeader}>
            <div className={styles.recipeMeta}>
              {recipe.readyInMinutes && (
                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>⏱️</div>
                  <span>{formatTime(recipe.readyInMinutes)}</span>
                </div>
              )}
              {recipe.servings && (
                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>👥</div>
                  <span>{recipe.servings} servings</span>
                </div>
              )}
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>🍽️</div>
                <span>{getCuisineType()}</span>
              </div>
              {recipe.healthScore && (
                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>❤️</div>
                  <span>Health Score: {recipe.healthScore}</span>
                </div>
              )}
            </div>

            {recipe.summary && (
              <div className={styles.recipeDescription}>
                {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 200)}...
              </div>
            )}

            <div className={styles.recipeTags}>
              {recipe.dishTypes && recipe.dishTypes.slice(0, 3).map((type, index) => (
                <span key={index} className={styles.recipeTag}>{type}</span>
              ))}
              {recipe.diets && recipe.diets.slice(0, 2).map((diet, index) => (
                <span key={index} className={styles.recipeTag}>{diet}</span>
              ))}
            </div>
          </div>

          {/* Modern Tab Design */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.active : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              <span className={styles.tabIcon}>🥬</span>
              Ingredients
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'instructions' ? styles.active : ''}`}
              onClick={() => setActiveTab('instructions')}
            >
              <span className={styles.tabIcon}>👨‍🍳</span>
              Cook & Satisfied!
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'ingredients' ? (
              <div className={styles.instructionsList}>
                {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
                  <ol className={styles.instructionSteps}>
                    {recipe.extendedIngredients.map((ingredient, index) => (
                      <li key={ingredient.id} className={styles.instructionStep}>
                        <span className={styles.stepNumber}>{index + 1}</span>
                        <span className={styles.stepText}>{ingredient.original}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className={styles.noIngredients}>No ingredients information available.</p>
                )}
              </div>
            ) : (
              <div className={styles.instructionsList}>
                {(() => {
                  // Try to use analyzed instructions first
                  if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
                    return recipe.analyzedInstructions.map((instructionGroup, groupIndex) => (
                      <div key={groupIndex} className={styles.instructionGroup}>
                        {instructionGroup.name && (
                          <h3 className={styles.instructionGroupTitle}>{instructionGroup.name}</h3>
                        )}
                        <ol className={styles.instructionSteps}>
                          {instructionGroup.steps.map((step) => (
                            <li key={step.id} className={styles.instructionStep}>
                              <span className={styles.stepNumber}>{step.number}</span>
                              <span className={styles.stepText}>{step.step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ));
                  }

                  // Fallback: parse raw instructions string into steps
                  if (recipe.instructions) {
                    // Remove HTML tags and split by common step indicators
                    const cleanInstructions = recipe.instructions.replace(/<[^>]*>/g, '');
                    const steps = cleanInstructions
                      .split(/(?:\d+\.|step\s+\d+|^\d+\))/i)
                      .filter(step => step.trim().length > 0)
                      .map(step => step.trim());

                    if (steps.length > 0) {
                      return (
                        <ol className={styles.instructionSteps}>
                          {steps.map((step, index) => (
                            <li key={index} className={styles.instructionStep}>
                              <span className={styles.stepNumber}>{index + 1}</span>
                              <span className={styles.stepText}>{step}</span>
                            </li>
                          ))}
                        </ol>
                      );
                    }
                  }

                  // Final fallback
                  return (
                    <div className={styles.fallbackInstructions}>
                      <p>No cooking instructions available for this recipe.</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Plan Modal */}
      {recipe && (
        <AddToPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipe={{
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
          }}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;