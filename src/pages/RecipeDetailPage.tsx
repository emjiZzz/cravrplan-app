
/* RecipeDetailPage.tsx - Displays detailed recipe information with ingredients, cookware, and cooking instructions */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRecipeDetails } from '../services/filterService';
import type { Recipe } from '../types/recipeTypes';
import styles from './RecipeDetailPage.module.css';
import AddToPlanModal from '../components/AddToPlanModal';
import { getIngredientImageUrl, handleImageError } from '../utils/imageUtils';

// Main component for displaying recipe details
const RecipeDetailPage: React.FC = () => {
  // Get recipe ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // State management for recipe data and UI
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'cookware'>('ingredients');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract selected date from URL parameters for meal planning
  const getSelectedDateFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('selectedDate') || '';
  };

  // Load recipe data when component mounts or recipe ID changes
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          setError('No recipe ID provided.');
          return;
        }

        // Use recipe from route state if available (faster loading)
        const state = location.state as { recipe?: Recipe } | null;
        if (state?.recipe && state.recipe.id === Number(id)) {
          setRecipe(state.recipe);
          setLoading(false);
          return;
        }

        // Load recipe from API service
        const data = await getRecipeDetails(Number(id));
        setRecipe(data);
      } catch (error) {
        console.error('Error loading recipe details:', error);
        setError('Failed to load recipe details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, location.state]);

  // Display loading spinner while fetching data
  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading recipe...</p>
    </div>
  );

  // Display error message if loading failed
  if (error) return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>⚠️</div>
      <p>{error}</p>
    </div>
  );

  // Display error if no recipe found
  if (!recipe) return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>❌</div>
      <p>No recipe found.</p>
    </div>
  );

  // Convert minutes to readable time format (e.g., 90 minutes -> "1h 30m")
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get the primary cuisine type for display
  const getCuisineType = () => {
    if (recipe.cuisines && recipe.cuisines.length > 0) {
      return recipe.cuisines[0];
    }
    if (recipe.dishTypes && recipe.dishTypes.length > 0) {
      return recipe.dishTypes[0];
    }
    return 'International';
  };

  // Determine required cookware based on recipe content analysis
  const getRequiredCookware = () => {
    const cookware = [];
    const recipeText = `${recipe.title} ${recipe.summary || ''} ${recipe.instructions || ''}`.toLowerCase();

    // Essential cookware that's usually needed
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

    // Add cookware based on recipe content analysis
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

    // Remove duplicate cookware items
    return cookware.filter((item, index, self) =>
      index === self.findIndex(t => t.name === item.name)
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Page header with back button and title */}
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
        {/* Recipe image section with overlay information */}
        <div className={styles.imageSection}>
          <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />

          {/* Recipe stats overlay on image */}
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

          {/* Hover overlay to add recipe to meal plan */}
          <div
            className={styles.addToPlanOverlay}
            onClick={() => setIsModalOpen(true)}
            title={location.state && (location.state as { swapFor?: string }).swapFor ? 'Swap this meal' : 'Add to Meal Plan'}
          >
            <div className={styles.addToPlanText}>
              {(location.state && (location.state as { swapFor?: string }).swapFor) ? 'SWAP THIS MEAL?' : 'ADD THIS TO MEAL PLAN?'}
            </div>
          </div>
        </div>

        {/* Recipe details section with tabs */}
        <div className={styles.detailsSection}>
          {/* Recipe information header */}
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

            {/* Recipe description */}
            {recipe.summary && (
              <div className={styles.recipeDescription}>
                {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 200)}...
              </div>
            )}

            {/* Recipe tags */}
            <div className={styles.recipeTags}>
              {recipe.dishTypes && recipe.dishTypes.slice(0, 3).map((type, index) => (
                <span key={index} className={styles.recipeTag}>{type}</span>
              ))}
              {recipe.diets && recipe.diets.slice(0, 2).map((diet, index) => (
                <span key={index} className={styles.recipeTag}>{diet}</span>
              ))}
            </div>
          </div>

          {/* Tab navigation for different content sections */}
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

          {/* Tab content area */}
          <div className={styles.tabContent}>
            {activeTab === 'ingredients' ? (
              // Ingredients tab content
              <div className={styles.instructionsList}>
                {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
                  <div className={styles.ingredientsGrid}>
                    {recipe.extendedIngredients.map((ingredient) => (
                      <div key={ingredient.id} className={styles.ingredientCard}>
                        <div className={styles.ingredientImage}>
                          {ingredient.image ? (
                            <img
                              src={getIngredientImageUrl(ingredient.image)}
                              alt={ingredient.name}
                              className={styles.ingredientImg}
                              onError={(e) => handleImageError(e.nativeEvent)}
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
              // Cookware tab content
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
              // Instructions tab content
              <div className={styles.instructionsList}>
                {(() => {
                  // Prefer structured instructions if present and contain steps
                  const hasStructured = Array.isArray(recipe.analyzedInstructions)
                    && recipe.analyzedInstructions.some(g => Array.isArray(g.steps) && g.steps.length > 0);

                  if (hasStructured) {
                    return recipe.analyzedInstructions
                      .filter(group => Array.isArray(group.steps) && group.steps.length > 0)
                      .map((instructionGroup, groupIndex) => (
                        <div key={groupIndex} className={styles.instructionGroup}>
                          {instructionGroup.name && (
                            <h3 className={styles.instructionGroupTitle}>{instructionGroup.name}</h3>
                          )}
                          <ol className={styles.instructionSteps}>
                            {instructionGroup.steps.map((step, stepIndex) => (
                              <li key={`${groupIndex}-${stepIndex}`} className={styles.instructionStep}>
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
                  const raw = (recipe.instructions || '').trim();
                  if (raw) {
                    // Normalize HTML breaks to newlines before stripping tags
                    const normalized = raw
                      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
                      .replace(/<\/?p>/gi, '\n')
                      .replace(/<\/?li>/gi, '\n');

                    const cleanInstructions = normalized.replace(/<[^>]*>/g, '').trim();

                    // Try a variety of common splitting strategies
                    let steps = cleanInstructions
                      .split(/\r?\n+/)
                      .map(s => s.trim())
                      .filter(Boolean);

                    if (steps.length <= 1) {
                      steps = cleanInstructions
                        .split(/(?:(?:^|\s)(?:step\s*\d+\s*:?)|\d+[\.)]\s+|•\s+|\-\s+)/gi)
                        .map(s => s.trim())
                        .filter(Boolean);
                    }

                    // If we still have a single long paragraph, try sentence based split
                    if (steps.length <= 1) {
                      steps = cleanInstructions
                        .split(/(?<=[\.\!\?])\s+(?=[A-Z])/)
                        .map(s => s.trim())
                        .filter(Boolean);
                    }

                    if (steps.length > 0) {
                      return (
                        <ol className={styles.instructionSteps}>
                          {steps.map((step, index) => (
                            <li key={`fallback-step-${index}`} className={styles.instructionStep}>
                              <div className={styles.stepHeader}>
                                <span className={styles.stepNumber}>{index + 1}</span>
                                <span className={styles.stepText}>{step}</span>
                              </div>
                            </li>
                          ))}
                        </ol>
                      );
                    }
                  }

                  // Last resort: derive simple steps from summary if available
                  if (recipe.summary) {
                    const cleanSummary = recipe.summary
                      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
                      .replace(/<[^>]*>/g, '')
                      .trim();

                    const summarySteps = cleanSummary
                      .split(/(?<=[\.\!\?])\s+(?=[A-Z])/)
                      .map(s => s.trim())
                      .filter(Boolean)
                      .slice(0, 8); // limit to avoid overly long lists from descriptive text

                    if (summarySteps.length > 1) {
                      return (
                        <ol className={styles.instructionSteps}>
                          {summarySteps.map((step, index) => (
                            <li key={`summary-step-${index}`} className={styles.instructionStep}>
                              <div className={styles.stepHeader}>
                                <span className={styles.stepNumber}>{index + 1}</span>
                                <span className={styles.stepText}>{step}</span>
                              </div>
                            </li>
                          ))}
                        </ol>
                      );
                    }
                  }

                  // Final fallback if no instructions available
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

      {/* Modal for adding recipe to meal plan */}
      {recipe && (
        <AddToPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipe={{
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
          }}
          swapFor={(location.state && (location.state as { swapFor?: string }).swapFor) || undefined}
          selectedDate={getSelectedDateFromURL()}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;