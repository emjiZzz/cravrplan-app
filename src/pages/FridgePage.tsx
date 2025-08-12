import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FridgePage.module.css';
import { searchRecipesByIngredients } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';

interface FridgeRecipe extends Recipe {
  missedIngredientCount: number;
  usedIngredientCount: number;
  missedIngredients: Array<{ name: string }>;
  usedIngredients: Array<{ name: string }>;
}

interface Ingredient {
  name: string;
}

const FridgePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isGuestMode, guestData, addGuestFridgeIngredient, removeGuestFridgeIngredient } = useGuest();
  const [customIngredient, setCustomIngredient] = useState('');

  // Generate user-specific localStorage key
  const getStorageKey = React.useCallback((key: string) => {
    return user ? `fridgeIngredients_${user.id}_${key}` : `fridgeIngredients_guest_${key}`;
  }, [user]);

  // Initialize selectedIngredients based on user mode
  const getInitialIngredients = (): Ingredient[] => {
    if (isGuestMode) {
      // Use guest context data for guest mode
      return guestData.fridgeIngredients.map(ing => ({ name: ing.name }));
    } else {
      // Use localStorage for authenticated users
      try {
        const savedIngredients = localStorage.getItem(getStorageKey('ingredients'));
        console.log('Loading ingredients from localStorage:', savedIngredients);
        if (savedIngredients) {
          const parsed = JSON.parse(savedIngredients);
          console.log('Parsed ingredients:', parsed);
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing saved ingredients:', error);
        localStorage.removeItem(getStorageKey('ingredients'));
      }
      return [];
    }
  };

  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(getInitialIngredients);
  const [recipes, setRecipes] = useState<FridgeRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxMissing, setMaxMissing] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  // Load ingredients when user changes or guest mode changes
  useEffect(() => {
    if (isGuestMode) {
      // Use guest context data for guest mode
      setSelectedIngredients(guestData.fridgeIngredients.map(ing => ({ name: ing.name })));
    } else {
      // Use localStorage for authenticated users
      try {
        const savedIngredients = localStorage.getItem(getStorageKey('ingredients'));
        if (savedIngredients) {
          const parsed = JSON.parse(savedIngredients);
          if (Array.isArray(parsed)) {
            setSelectedIngredients(parsed);
          }
        } else {
          setSelectedIngredients([]);
        }

        // Migration: If no user-specific data exists but legacy data does, migrate it
        if (!savedIngredients && user) {
          const legacyIngredients = localStorage.getItem('fridgeIngredients');
          if (legacyIngredients) {
            try {
              const parsedLegacyIngredients = JSON.parse(legacyIngredients);
              if (Array.isArray(parsedLegacyIngredients)) {
                setSelectedIngredients(parsedLegacyIngredients);
                // Save to user-specific storage
                localStorage.setItem(getStorageKey('ingredients'), legacyIngredients);
                // Clear legacy data
                localStorage.removeItem('fridgeIngredients');
              }
            } catch (error) {
              console.error('Error migrating legacy fridge ingredients:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading ingredients from localStorage:', error);
        localStorage.removeItem(getStorageKey('ingredients'));
      }
    }
  }, [user, getStorageKey, isGuestMode, guestData.fridgeIngredients]);

  // Save ingredients based on user mode
  useEffect(() => {
    if (isGuestMode) {
      // Guest mode data is managed by guest context, no need to save here
      return;
    } else {
      // Save to localStorage for authenticated users
      console.log('Saving ingredients to localStorage:', selectedIngredients);
      localStorage.setItem(getStorageKey('ingredients'), JSON.stringify(selectedIngredients));
    }
  }, [selectedIngredients, getStorageKey, isGuestMode]);

  const ingredientCategories = {
    'Vegetables': ['tomato', 'onion', 'garlic', 'bell pepper', 'carrot', 'potato', 'spinach', 'lettuce', 'cucumber', 'mushroom'],
    'Proteins': ['chicken', 'beef', 'fish', 'eggs', 'pork', 'shrimp', 'tofu'],
    'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream'],
    'Grains': ['rice', 'pasta', 'bread', 'flour', 'quinoa'],
    'Fruits': ['apple', 'banana', 'lemon', 'orange', 'strawberry'],
    'Herbs & Spices': ['basil', 'oregano', 'thyme', 'salt', 'pepper', 'cumin', 'paprika']
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.find(ing => ing.name.toLowerCase() === customIngredient.toLowerCase())) {
      const newIngredient = { name: customIngredient.trim() };
      setSelectedIngredients([...selectedIngredients, newIngredient]);

      if (isGuestMode) {
        addGuestFridgeIngredient({
          id: `guest-ingredient-${Date.now()}`,
          name: newIngredient.name,
          quantity: 1,
          unit: 'piece'
        });
      }

      setCustomIngredient('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomIngredient();
    }
  };

  const toggleIngredient = (ingredientName: string) => {
    const isSelected = selectedIngredients.find(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
    if (isSelected) {
      setSelectedIngredients(selectedIngredients.filter(ing => ing.name.toLowerCase() !== ingredientName.toLowerCase()));

      if (isGuestMode) {
        const ingredientToRemove = guestData.fridgeIngredients.find(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
        if (ingredientToRemove) {
          removeGuestFridgeIngredient(ingredientToRemove.id);
        }
      }
    } else {
      const newIngredient = { name: ingredientName };
      setSelectedIngredients([...selectedIngredients, newIngredient]);

      if (isGuestMode) {
        addGuestFridgeIngredient({
          id: `guest-ingredient-${Date.now()}`,
          name: newIngredient.name,
          quantity: 1,
          unit: 'piece'
        });
      }
    }
  };

  const removeIngredient = (ingredientName: string) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.name !== ingredientName));

    if (isGuestMode) {
      const ingredientToRemove = guestData.fridgeIngredients.find(ing => ing.name === ingredientName);
      if (ingredientToRemove) {
        removeGuestFridgeIngredient(ingredientToRemove.id);
      }
    }
  };

  const clearAllIngredients = () => {
    console.log('Clearing all ingredients');
    setSelectedIngredients([]);

    if (isGuestMode) {
      // Clear all guest ingredients
      guestData.fridgeIngredients.forEach(ingredient => {
        removeGuestFridgeIngredient(ingredient.id);
      });
    } else {
      localStorage.removeItem(getStorageKey('ingredients'));
    }
  };


  const searchRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    setLoading(true);
    try {
      const ingredientNames = selectedIngredients.map(ing => ing.name);
      const response = await searchRecipesByIngredients(ingredientNames, maxMissing);
      setRecipes(response as FridgeRecipe[]);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    !searchQuery || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.fridgePageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>My Fridge</h1>
          <p className={styles.pageSubtitle}>Add ingredients from your fridge and discover delicious recipes you can make</p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.ingredientSection}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>🥬</span>
              Add Ingredients
            </h2>

            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.customInputSection}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Add custom ingredient..."
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={styles.customInput}
                />
                <button onClick={addCustomIngredient} className={styles.addButton}>
                  Add
                </button>
              </div>
            </div>

            <div className={styles.categoriesContainer}>
              {Object.entries(ingredientCategories).map(([category, ingredients]) => {
                const filteredIngredients = ingredients.filter(ingredient =>
                  !searchQuery || ingredient.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredIngredients.length === 0) return null;

                return (
                  <div key={category} className={styles.categoryCard}>
                    <h3 className={styles.categoryTitle}>{category}</h3>
                    <div className={styles.ingredientsGrid}>
                      {filteredIngredients.map((ingredient) => {
                        const isSelected = selectedIngredients.find(ing =>
                          ing.name.toLowerCase() === ingredient.toLowerCase()
                        );
                        return (
                          <button
                            key={ingredient}
                            onClick={() => toggleIngredient(ingredient)}
                            className={`${styles.ingredientChip} ${isSelected ? styles.selected : ''}`}
                          >
                            {ingredient}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.resultsSection}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>📋</span>
                Selected Ingredients ({selectedIngredients.length})
              </h2>
              <button
                onClick={clearAllIngredients}
                className={styles.clearAllButton}
                title="Clear all ingredients"
              >
                Clear All
              </button>
            </div>

            {selectedIngredients.length > 0 ? (
              <>
                <div className={styles.selectedIngredientsList}>
                  {selectedIngredients.map((ingredient, index) => (
                    <div key={index} className={styles.selectedIngredientItem}>
                      <div className={styles.ingredientDetails}>
                        <span className={styles.ingredientName}>{ingredient.name}</span>
                      </div>
                      <button
                        onClick={() => removeIngredient(ingredient.name)}
                        className={styles.removeButton}
                        title="Remove ingredient"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.searchControls}>
                  <div className={styles.controlGroup}>
                    <label htmlFor="maxMissing" className={styles.controlLabel}>
                      Max missing ingredients:
                    </label>
                    <select
                      id="maxMissing"
                      value={maxMissing}
                      onChange={(e) => setMaxMissing(Number(e.target.value))}
                      className={styles.controlSelect}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={searchRecipes}
                    disabled={loading}
                    className={styles.searchButton}
                  >
                    {loading ? (
                      <>
                        <span className={styles.loadingSpinner}></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <span className={styles.searchIcon}>🔍</span>
                        Find Recipes
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🥘</div>
                <p>No ingredients selected yet</p>
                <p className={styles.emptySubtext}>Add ingredients from your fridge to discover recipes!</p>
              </div>
            )}
          </div>

          {recipes.length > 0 && (
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>🍽️</span>
                Recipe Results ({filteredRecipes.length})
              </h2>

              <div className={styles.recipesGrid}>
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <div className={styles.recipeImageContainer}>
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className={styles.recipeImage}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className={styles.recipeOverlay}>
                        <div className={styles.recipeStats}>
                          <span
                            className={styles.usedCount}
                            title={recipe.usedIngredients?.map(ing => ing.name).join(', ') || 'No ingredients used'}
                          >
                            ✓ {recipe.usedIngredientCount} used
                          </span>
                          <span
                            className={styles.missedCount}
                            title={recipe.missedIngredients?.map(ing => ing.name).join(', ') || 'No missing ingredients'}
                          >
                            ✗ {recipe.missedIngredientCount} missing
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.recipeContent}>
                      <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                      {recipe.readyInMinutes && (
                        <div className={styles.recipeTime}>
                          ⏱️ {recipe.readyInMinutes} minutes
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        className={styles.viewRecipeButton}
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FridgePage; 