
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
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'cookware'>('ingredients');
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
      } catch {
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

  // Helper function to determine cookware based on recipe
  const getRequiredCookware = () => {
    const cookware = [];
    const recipeText = `${recipe.title} ${recipe.summary || ''} ${recipe.instructions || ''}`.toLowerCase();

    // Basic cookware that's usually needed
    cookware.push({
      name: 'Chef\'s Knife',
      description: 'Sharp cutting knife for chopping ingredients',
      icon: '🔪',
      priority: 'essential'
    });

    cookware.push({
      name: 'Cutting Board',
      description: 'Safe surface for chopping and preparing ingredients',
      icon: '🪵',
      priority: 'essential'
    });

    // Determine cookware based on recipe content
    if (recipeText.includes('fry') || recipeText.includes('pan') || recipeText.includes('sauté')) {
      cookware.push({
        name: 'Frying Pan',
        description: 'Large non-stick pan for frying and sautéing',
        icon: '🍳',
        priority: 'essential'
      });
    }

    if (recipeText.includes('boil') || recipeText.includes('simmer') || recipeText.includes('sauce')) {
      cookware.push({
        name: 'Saucepan',
        description: 'Medium-sized pot for boiling and simmering',
        icon: '🥘',
        priority: 'essential'
      });
    }

    if (recipeText.includes('bake') || recipeText.includes('oven') || recipeText.includes('roast')) {
      cookware.push({
        name: 'Baking Sheet',
        description: 'Flat pan for baking and roasting',
        icon: '🍪',
        priority: 'essential'
      });
    }

    if (recipeText.includes('mix') || recipeText.includes('whisk') || recipeText.includes('beat')) {
      cookware.push({
        name: 'Mixing Bowl',
        description: 'Large bowl for combining ingredients',
        icon: '🥣',
        priority: 'essential'
      });
    }

    if (recipeText.includes('stir') || recipeText.includes('spoon')) {
      cookware.push({
        name: 'Wooden Spoon',
        description: 'Stirring utensil for cooking',
        icon: '🥄',
        priority: 'essential'
      });
    }

    if (recipeText.includes('measure') || recipeText.includes('cup') || recipeText.includes('tablespoon')) {
      cookware.push({
        name: 'Measuring Cups & Spoons',
        description: 'For accurate ingredient measurements',
        icon: '🧂',
        priority: 'essential'
      });
    }

    if (recipeText.includes('grill') || recipeText.includes('bbq')) {
      cookware.push({
        name: 'Grill Pan',
        description: 'Pan with ridges for grilling indoors',
        icon: '🔥',
        priority: 'essential'
      });
    }

    if (recipeText.includes('blend') || recipeText.includes('puree') || recipeText.includes('smoothie')) {
      cookware.push({
        name: 'Blender',
        description: 'For blending and pureeing ingredients',
        icon: '⚡',
        priority: 'essential'
      });
    }

    if (recipeText.includes('strain') || recipeText.includes('drain')) {
      cookware.push({
        name: 'Colander',
        description: 'For draining pasta and vegetables',
        icon: '🕳️',
        priority: 'essential'
      });
    }

    // Remove duplicates based on name
    return cookware.filter((item, index, self) =>
      index === self.findIndex(t => t.name === item.name)
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Enhanced Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          &larr;
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{recipe.title}</h1>
          <p className={styles.pageSubtitle}>Discover ingredients, cooking instructions, and add to your meal plan</p>
        </div>
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
              className={`${styles.tabButton} ${activeTab === 'cookware' ? styles.active : ''}`}
              onClick={() => setActiveTab('cookware')}
            >
              <span className={styles.tabIcon}>🍳</span>
              Find Cookware
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
                  <div className={styles.ingredientsGrid}>
                    {recipe.extendedIngredients.map((ingredient) => (
                      <div key={ingredient.id} className={styles.ingredientCard}>
                        <div className={styles.ingredientImage}>
                          {ingredient.image ? (
                            <img
                              src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                              alt={ingredient.name}
                              className={styles.ingredientImg}
                            />
                          ) : (
                            <div className={styles.ingredientPlaceholder}>
                              🥬
                            </div>
                          )}
                        </div>
                        <div className={styles.ingredientInfo}>
                          <span className={styles.ingredientName}>{ingredient.name}</span>
                          <span className={styles.ingredientAmount}>{ingredient.original}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noIngredients}>No ingredients information available.</p>
                )}
              </div>
            ) : activeTab === 'cookware' ? (
              <div className={styles.instructionsList}>
                <div className={styles.ingredientsGrid}>
                  {getRequiredCookware().map((item, index) => (
                    <div key={index} className={styles.ingredientCard}>
                      <div className={styles.ingredientImage}>
                        <div className={styles.ingredientPlaceholder}>
                          {item.icon}
                        </div>
                      </div>
                      <div className={styles.ingredientInfo}>
                        <span className={styles.ingredientName}>{item.name}</span>
                        <span className={styles.ingredientAmount}>{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                              <div className={styles.stepHeader}>
                                <span className={styles.stepNumber}>{step.number}</span>
                                <span className={styles.stepText}>{step.step}</span>
                              </div>




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
                            <li key={`fallback-step-${index}`} className={styles.instructionStep}>
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