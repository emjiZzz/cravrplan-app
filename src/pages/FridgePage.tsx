import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRecipesByIngredients } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';
import styles from './FridgePage.module.css';

const FridgePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingRecipes, setMatchingRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxMissingIngredients, setMaxMissingIngredients] = useState(3);

  // Common ingredients for quick selection
  const commonIngredients = [
    'tomato', 'onion', 'garlic', 'olive oil', 'salt', 'pepper', 'chicken', 'beef',
    'pork', 'fish', 'shrimp', 'eggs', 'milk', 'cheese', 'butter', 'flour', 'rice',
    'pasta', 'potato', 'carrot', 'broccoli', 'spinach', 'lettuce', 'cucumber',
    'bell pepper', 'mushroom', 'lemon', 'lime', 'basil', 'oregano', 'thyme',
    'parsley', 'cilantro', 'ginger', 'chili', 'soy sauce', 'vinegar', 'honey',
    'sugar', 'brown sugar', 'vanilla', 'cinnamon', 'nutmeg', 'paprika', 'cumin'
  ];

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddCustomIngredient = () => {
    if (searchQuery.trim() && !selectedIngredients.includes(searchQuery.trim().toLowerCase())) {
      setSelectedIngredients(prev => [...prev, searchQuery.trim().toLowerCase()]);
      setSearchQuery('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(item => item !== ingredient));
  };

  const handleFindRecipes = async () => {
    if (selectedIngredients.length === 0) {
      alert('Please select at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      const recipes = await searchRecipesByIngredients(selectedIngredients, maxMissingIngredients);
      setMatchingRecipes(recipes);
    } catch (error) {
      console.error('Error finding recipes:', error);
      alert('Failed to find recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          &larr;
        </button>
        <h1 className={styles.title}>What's in my fridge?</h1>
      </div>
      <p className={styles.subtitle}>
        Find recipes using what you have available
      </p>

      <div className={styles.content}>
        {/* Ingredient Selection Section */}
        <div className={styles.ingredientSection}>
          <h2 className={styles.sectionTitle}>Select Your Ingredients</h2>

          {/* Custom Ingredient Input */}
          <div className={styles.customIngredientInput}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Add custom ingredient..."
              className={styles.ingredientInput}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
            />
            <button
              onClick={handleAddCustomIngredient}
              className={styles.addButton}
              disabled={!searchQuery.trim()}
            >
              Add
            </button>
          </div>

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <div className={styles.selectedIngredients}>
              <h3>Selected Ingredients:</h3>
              <div className={styles.ingredientTags}>
                {selectedIngredients.map((ingredient) => (
                  <span key={ingredient} className={styles.ingredientTag}>
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Ingredients Grid */}
          <div className={styles.commonIngredients}>
            <h3>Common Ingredients:</h3>
            <div className={styles.ingredientsGrid}>
              {commonIngredients.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => handleIngredientToggle(ingredient)}
                  className={`${styles.ingredientButton} ${selectedIngredients.includes(ingredient) ? styles.selected : ''
                    }`}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          {/* Search Settings */}
          <div className={styles.searchSettings}>
            <label className={styles.settingLabel}>
              Max missing ingredients:
              <select
                value={maxMissingIngredients}
                onChange={(e) => setMaxMissingIngredients(Number(e.target.value))}
                className={styles.settingSelect}
              >
                <option value={1}>1 ingredient</option>
                <option value={2}>2 ingredients</option>
                <option value={3}>3 ingredients</option>
                <option value={5}>5 ingredients</option>
                <option value={10}>10 ingredients</option>
              </select>
            </label>
          </div>

          {/* Find Recipes Button */}
          <button
            onClick={handleFindRecipes}
            disabled={selectedIngredients.length === 0 || loading}
            className={styles.findRecipesButton}
          >
            {loading ? 'Finding Recipes...' : 'Find Recipes'}
          </button>
        </div>

        {/* Results Section */}
        {matchingRecipes.length > 0 && (
          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>
              Found {matchingRecipes.length} Recipe{matchingRecipes.length !== 1 ? 's' : ''}
            </h2>
            <div className={styles.recipesGrid}>
              {matchingRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={styles.recipeCard}
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  <div className={styles.recipeImage}>
                    <img src={recipe.image} alt={recipe.title} />
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                    <div className={styles.recipeMeta}>
                      <span className={styles.recipeTime}>
                        ⏱️ {recipe.readyInMinutes}m
                      </span>
                      <span className={styles.recipeServings}>
                        👥 {recipe.servings} servings
                      </span>
                    </div>
                    <div className={styles.matchInfo}>
                      <span className={styles.matchPercentage}>
                        {Math.round((selectedIngredients.length / (selectedIngredients.length + maxMissingIngredients)) * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && matchingRecipes.length === 0 && selectedIngredients.length > 0 && (
          <div className={styles.noResults}>
            <p>No recipes found with your selected ingredients.</p>
            <p>Try adding more ingredients or increasing the max missing ingredients limit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FridgePage; 