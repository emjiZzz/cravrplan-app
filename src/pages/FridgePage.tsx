import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FridgePage.module.css';
import { searchRecipesByIngredients } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';

interface FridgeRecipe extends Recipe {
  missedIngredientCount: number;
  usedIngredientCount: number;
  missedIngredients: Array<{ name: string }>;
  usedIngredients: Array<{ name: string }>;
}

interface Ingredient {
  name: string;
  quantity?: string;
}

const FridgePage: React.FC = () => {
  const navigate = useNavigate();
  const [customIngredient, setCustomIngredient] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<FridgeRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxMissing, setMaxMissing] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

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
      setSelectedIngredients([...selectedIngredients, { name: customIngredient.trim() }]);
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
    } else {
      setSelectedIngredients([...selectedIngredients, { name: ingredientName }]);
    }
  };

  const removeIngredient = (ingredientName: string) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.name !== ingredientName));
  };

  const updateIngredientQuantity = (ingredientName: string, quantity: string) => {
    setSelectedIngredients(selectedIngredients.map(ing =>
      ing.name === ingredientName ? { ...ing, quantity } : ing
    ));
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
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          &larr;
        </button>
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
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>📋</span>
              Selected Ingredients ({selectedIngredients.length})
            </h2>

            {selectedIngredients.length > 0 ? (
              <>
                <div className={styles.selectedIngredientsList}>
                  {selectedIngredients.map((ingredient, index) => (
                    <div key={index} className={styles.selectedIngredientItem}>
                      <div className={styles.ingredientDetails}>
                        <span className={styles.ingredientName}>{ingredient.name}</span>
                        <input
                          type="text"
                          placeholder="Qty"
                          value={ingredient.quantity || ''}
                          onChange={(e) => updateIngredientQuantity(ingredient.name, e.target.value)}
                          className={styles.quantityInput}
                        />
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
                          <span className={styles.usedCount}>
                            ✓ {recipe.usedIngredientCount} used
                          </span>
                          <span className={styles.missedCount}>
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