/* src/pages/RecipeDetailPage.tsx */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeDetails } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';
import styles from './RecipeDetailPage.module.css';
import AddToPlanModal from '../components/AddToPlanModal';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Use for the back button
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients'); // State for tabs
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

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

  if (loading) return <div className={styles.loading}>Loading recipe...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!recipe) return <div className={styles.error}>No recipe found.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.recipeHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>&larr;</button>
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.imageSection}>
          <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
          <button 
            className={styles.addFavoriteButton}
            onClick={() => setIsModalOpen(true)}
            title="Add to Plan"
          >
            +
          </button>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.active : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'instructions' ? styles.active : ''}`}
              onClick={() => setActiveTab('instructions')}
            >
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