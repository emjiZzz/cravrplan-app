import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FridgePage.module.css';
import { RecipeApiService } from '../services/apiService';

interface Recipe {
  id: number;
  title: string;
  image: string;
  missedIngredientCount: number;
  usedIngredientCount: number;
  missedIngredients: Array<{ name: string }>;
  usedIngredients: Array<{ name: string }>;
}

interface Ingredient {
  name: string;
  quantity?: string;
  category?: string;
}

const FridgePage: React.FC = () => {
  const navigate = useNavigate();
  const [customIngredient, setCustomIngredient] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxMissing, setMaxMissing] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  // Organized common ingredients by category
  const commonIngredients = {
    'Vegetables': [
      'tomato', 'onion', 'garlic', 'bell pepper', 'carrot', 'potato',
      'spinach', 'lettuce', 'cucumber', 'mushroom', 'broccoli', 'cauliflower'
    ],
    'Fruits': [
      'apple', 'banana', 'orange', 'lemon', 'lime', 'strawberry',
      'blueberry', 'avocado', 'mango', 'pineapple'
    ],
    'Proteins': [
      'chicken', 'beef', 'pork', 'fish', 'shrimp', 'eggs',
      'tofu', 'beans', 'lentils', 'chickpeas'
    ],
    'Dairy & Eggs': [
      'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream'
    ],
    'Grains & Pasta': [
      'rice', 'pasta', 'bread', 'flour', 'quinoa', 'oats'
    ],
    'Herbs & Spices': [
      'basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro',
      'salt', 'pepper', 'cumin', 'paprika', 'chili powder'
    ]
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
      const ingredientNames = selectedIngredients.map(ing => ing.name).join(',');
      const response = await RecipeApiService.searchRecipesByIngredients(ingredientNames, maxMissing);
      setRecipes(response);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = Object.entries(commonIngredients).filter(([category, ingredients]) => {
    if (!searchQuery) return true;
    return category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.fridgePageContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className={styles.title}>My Fridge</h1>
      </div>

      <div className={styles.content}>
        {/* Left Panel - Ingredient Selection */}
        <div className={styles.leftPanel}>
          <div className={styles.ingredientSection}>
            <h2 className={styles.sectionTitle}>Add Ingredients</h2>

            {/* Search Ingredients */}
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Custom Ingredient Input */}
            <div className={styles.customInputContainer}>
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

            {/* Organized Common Ingredients */}
            <div className={styles.ingredientsGrid}>
              {filteredIngredients.map(([category, ingredients]) => (
                <div key={category} className={styles.categorySection}>
                  <h3 className={styles.categoryTitle}>{category}</h3>
                  <div className={styles.ingredientsList}>
                    {ingredients.map((ingredient) => {
                      const isSelected = selectedIngredients.find(ing =>
                        ing.name.toLowerCase() === ingredient.toLowerCase()
                      );
                      return (
                        <button
                          key={ingredient}
                          onClick={() => toggleIngredient(ingredient)}
                          className={`${styles.ingredientButton} ${isSelected ? styles.selected : ''}`}
                        >
                          {ingredient}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Selected Ingredients & Recipes */}
        <div className={styles.rightPanel}>
          {/* Selected Ingredients */}
          <div className={styles.selectedSection}>
            <h2 className={styles.sectionTitle}>
              Selected Ingredients ({selectedIngredients.length})
            </h2>

            {selectedIngredients.length > 0 && (
              <div className={styles.selectedIngredients}>
                {selectedIngredients.map((ingredient, index) => (
                  <div key={index} className={styles.selectedIngredient}>
                    <div className={styles.ingredientInfo}>
                      <span className={styles.ingredientName}>{ingredient.name}</span>
                      <input
                        type="text"
                        placeholder="Qty (optional)"
                        value={ingredient.quantity || ''}
                        onChange={(e) => updateIngredientQuantity(ingredient.name, e.target.value)}
                        className={styles.quantityInput}
                      />
                    </div>
                    <button
                      onClick={() => removeIngredient(ingredient.name)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Controls */}
            {selectedIngredients.length > 0 && (
              <div className={styles.searchControls}>
                <div className={styles.maxMissingControl}>
                  <label htmlFor="maxMissing">Max missing ingredients:</label>
                  <select
                    id="maxMissing"
                    value={maxMissing}
                    onChange={(e) => setMaxMissing(Number(e.target.value))}
                    className={styles.maxMissingSelect}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={searchRecipes}
                  disabled={loading}
                  className={styles.searchButton}
                >
                  {loading ? 'Searching...' : 'Find Recipes'}
                </button>
              </div>
            )}
          </div>

          {/* Recipe Results */}
          {recipes.length > 0 && (
            <div className={styles.recipesSection}>
              <h2 className={styles.sectionTitle}>
                Recipe Results ({filteredRecipes.length})
              </h2>

              {/* Recipe Search Filter */}
              <div className={styles.recipeSearchContainer}>
                <input
                  type="text"
                  placeholder="Filter recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.recipeSearchInput}
                />
              </div>

              <div className={styles.recipesGrid}>
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className={styles.recipeImage}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className={styles.recipeInfo}>
                      <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                      <div className={styles.recipeStats}>
                        <span className={styles.usedCount}>
                          Used: {recipe.usedIngredientCount}
                        </span>
                        <span className={styles.missedCount}>
                          Missing: {recipe.missedIngredientCount}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
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