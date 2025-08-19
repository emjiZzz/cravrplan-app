import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FridgePage.module.css';
// API-First filter service with seamless mock data fallback
import { searchByIngredients as localSearchByIngredients } from '../services/filterService';
import type { Recipe } from '../types/recipeTypes';
import { useAuth } from '../context/AuthContext';
import { useGuest } from '../context/GuestContext';

/**
 * Extended Recipe interface for fridge functionality
 * Adds ingredient matching information to the base Recipe type
 */
interface FridgeRecipe extends Recipe {
  missedIngredientCount: number;    // Number of ingredients missing from user's fridge
  usedIngredientCount: number;      // Number of ingredients available in user's fridge
  missedIngredients: Array<{ name: string }>;  // List of missing ingredients
  usedIngredients: Array<{ name: string }>;    // List of available ingredients
  matchScore?: number;              // Ingredient matching score (0-1)
}

/**
 * Enhanced nutrition interface with direct calorie access
 */
interface EnhancedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Simple ingredient interface for fridge ingredients
 */
interface Ingredient {
  name: string;  // Name of the ingredient
}

/**
 * FridgePage Component
 * 
 * Allows users to add ingredients from their fridge and find recipes they can make.
 * Supports both authenticated users (with localStorage) and guest users (with context).
 * Features ingredient search, custom ingredient addition, and recipe discovery.
 */
const FridgePage: React.FC = () => {
  // ===== HOOKS AND CONTEXT =====

  const navigate = useNavigate();                                    // Hook for programmatic navigation
  const { user } = useAuth();                                        // Authentication context
  const { isGuestMode, guestData, addGuestFridgeIngredient, removeGuestFridgeIngredient } = useGuest();  // Guest mode context

  // ===== STATE MANAGEMENT =====

  const [customIngredient, setCustomIngredient] = useState('');     // Custom ingredient input value
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);  // User's selected ingredients
  const [recipes, setRecipes] = useState<FridgeRecipe[]>([]);       // Search results from recipe API
  const [loading, setLoading] = useState(false);                    // Loading state for recipe search
  const [maxMissing, setMaxMissing] = useState(3);                  // Maximum missing ingredients allowed
  const [searchQuery, setSearchQuery] = useState('');               // Search query for filtering ingredients
  const [matchingTolerance, setMatchingTolerance] = useState(0.8);  // Ingredient matching tolerance (0-1)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false); // Advanced filtering options
  const [maxReadyTime, setMaxReadyTime] = useState(60);             // Maximum cooking time filter
  const [cuisineFilter, setCuisineFilter] = useState('');           // Cuisine type filter
  const [dietFilter, setDietFilter] = useState('');                 // Diet restriction filter
  const [sortBy, setSortBy] = useState<'relevance' | 'missing' | 'time' | 'calories'>('relevance'); // Sort order

  // ===== UTILITY FUNCTIONS =====

  /**
   * Generate user-specific localStorage key
   * Creates unique storage keys for different users to prevent data conflicts
   */
  const getStorageKey = React.useCallback((key: string) => {
    return user ? `fridgeIngredients_${user.id}_${key}` : `fridgeIngredients_guest_${key}`;
  }, [user]);



  // ===== EFFECTS =====

  /**
   * Load ingredients when user changes or guest mode changes
   * Handles data migration from legacy storage and ensures data consistency
   */
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
  }, [user, getStorageKey, isGuestMode]);

  /**
   * Save ingredients based on user mode
   * Persists ingredient data to localStorage for authenticated users
   */
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

  // ===== CONSTANTS =====

  /**
   * Predefined ingredient categories for easy selection
   * Organized by food type for better user experience
   */
  const ingredientCategories = {
    'Vegetables': ['tomato', 'onion', 'garlic', 'bell pepper', 'carrot', 'potato', 'spinach', 'lettuce', 'cucumber', 'mushroom'],
    'Proteins': ['chicken', 'beef', 'fish', 'eggs', 'pork', 'shrimp', 'tofu'],
    'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream'],
    'Grains': ['rice', 'pasta', 'bread', 'flour', 'quinoa'],
    'Fruits': ['apple', 'banana', 'lemon', 'orange', 'strawberry'],
    'Herbs & Spices': ['basil', 'oregano', 'thyme', 'salt', 'pepper', 'cumin', 'paprika']
  };

  // ===== EVENT HANDLERS =====

  /**
   * Add a custom ingredient to the user's fridge
   * Validates input and prevents duplicates
   */
  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.find(ing => ing.name.toLowerCase() === customIngredient.toLowerCase())) {
      const newIngredient = { name: customIngredient.trim() };
      setSelectedIngredients([...selectedIngredients, newIngredient]);

      // Add to guest context if in guest mode
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

  /**
   * Handle Enter key press in custom ingredient input
   * Allows users to add ingredients by pressing Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomIngredient();
    }
  };

  /**
   * Toggle ingredient selection (add/remove)
   * Handles both adding and removing ingredients from the selection
   */
  const toggleIngredient = (ingredientName: string) => {
    const isSelected = selectedIngredients.find(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
    if (isSelected) {
      // Remove ingredient if already selected
      setSelectedIngredients(selectedIngredients.filter(ing => ing.name.toLowerCase() !== ingredientName.toLowerCase()));

      // Remove from guest context if in guest mode
      if (isGuestMode) {
        const ingredientToRemove = guestData.fridgeIngredients.find(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
        if (ingredientToRemove) {
          removeGuestFridgeIngredient(ingredientToRemove.id);
        }
      }
    } else {
      // Add ingredient if not selected
      const newIngredient = { name: ingredientName };
      setSelectedIngredients([...selectedIngredients, newIngredient]);

      // Add to guest context if in guest mode
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

  /**
   * Remove a specific ingredient from the selection
   * Removes ingredient by exact name match
   */
  const removeIngredient = (ingredientName: string) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing.name !== ingredientName));

    // Remove from guest context if in guest mode
    if (isGuestMode) {
      const ingredientToRemove = guestData.fridgeIngredients.find(ing => ing.name === ingredientName);
      if (ingredientToRemove) {
        removeGuestFridgeIngredient(ingredientToRemove.id);
      }
    }
  };

  /**
   * Clear all selected ingredients
   * Removes all ingredients from the selection and storage
   */
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

  /**
   * Enhanced ingredient matching with configurable tolerance
   * Uses fuzzy matching and synonym detection for better recipe discovery
   */
  const searchRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    // Minimal loading state - only show loading if no recipes exist
    const shouldShowLoading = recipes.length === 0;
    if (shouldShowLoading) {
      setLoading(true);
    }

    try {
      const ingredientNames = selectedIngredients.map(ing => ing.name);
      // API-first approach - tries API, falls back to mock data seamlessly
      const response = await localSearchByIngredients(ingredientNames, maxMissing);
      const recipes = response as FridgeRecipe[];

      // Enhanced recipe processing with ingredient matching analysis
      const enhancedRecipes: FridgeRecipe[] = recipes.map((recipe: any) => {
        const recipeIngredients = recipe.extendedIngredients?.map((ing: any) =>
          ing.name.toLowerCase().trim()
        ) || [];

        const userIngredients = ingredientNames.map(ing => ing.toLowerCase().trim());

        // Calculate ingredient matching with tolerance
        const { usedIngredients, missedIngredients, matchScore } = calculateIngredientMatch(
          userIngredients,
          recipeIngredients,
          matchingTolerance
        );

        return {
          ...recipe,
          usedIngredientCount: usedIngredients.length,
          missedIngredientCount: missedIngredients.length,
          usedIngredients: usedIngredients.map(name => ({ name })),
          missedIngredients: missedIngredients.map(name => ({ name })),
          matchScore
        };
      });

      // Apply advanced filtering
      const filteredRecipes = applyAdvancedFilters(enhancedRecipes);

      // Sort recipes based on user preference
      const sortedRecipes = sortRecipes(filteredRecipes, sortBy);

      setRecipes(sortedRecipes);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate ingredient matching with configurable tolerance
   * Uses fuzzy matching and synonym detection for better accuracy
   */
  const calculateIngredientMatch = (
    userIngredients: string[],
    recipeIngredients: string[],
    tolerance: number
  ) => {
    const usedIngredients: string[] = [];
    const missedIngredients: string[] = [];
    let totalScore = 0;

    // Ingredient synonyms for better matching
    const ingredientSynonyms: { [key: string]: string[] } = {
      'tomato': ['tomatoes', 'cherry tomato', 'roma tomato'],
      'onion': ['onions', 'red onion', 'white onion', 'yellow onion'],
      'garlic': ['garlic cloves', 'garlic powder'],
      'olive oil': ['extra virgin olive oil', 'evoo'],
      'salt': ['sea salt', 'kosher salt', 'table salt'],
      'pepper': ['black pepper', 'white pepper', 'ground pepper'],
      'chicken': ['chicken breast', 'chicken thigh', 'chicken meat'],
      'beef': ['ground beef', 'beef steak', 'beef meat'],
      'rice': ['white rice', 'brown rice', 'jasmine rice', 'basmati rice'],
      'pasta': ['spaghetti', 'penne', 'fettuccine', 'linguine'],
      'cheese': ['cheddar', 'mozzarella', 'parmesan', 'gouda'],
      'milk': ['whole milk', 'skim milk', 'almond milk', 'soy milk'],
      'egg': ['eggs', 'large eggs', 'egg whites'],
      'flour': ['all purpose flour', 'bread flour', 'cake flour'],
      'sugar': ['white sugar', 'brown sugar', 'granulated sugar'],
      'butter': ['unsalted butter', 'salted butter', 'margarine'],
      'lemon': ['lemons', 'lemon juice', 'lemon zest'],
      'lime': ['limes', 'lime juice', 'lime zest'],
      'bell pepper': ['bell peppers', 'red pepper', 'green pepper', 'yellow pepper'],
      'carrot': ['carrots', 'baby carrots'],
      'potato': ['potatoes', 'russet potato', 'red potato'],
      'spinach': ['baby spinach', 'fresh spinach'],
      'mushroom': ['mushrooms', 'button mushrooms', 'portobello'],
      'basil': ['fresh basil', 'basil leaves'],
      'oregano': ['dried oregano', 'fresh oregano'],
      'thyme': ['fresh thyme', 'dried thyme'],
      'rosemary': ['fresh rosemary', 'dried rosemary'],
      'parsley': ['fresh parsley', 'dried parsley'],
      'cilantro': ['fresh cilantro', 'coriander'],
      'ginger': ['fresh ginger', 'ginger powder', 'ginger root'],
      'cumin': ['ground cumin', 'cumin seeds'],
      'paprika': ['smoked paprika', 'sweet paprika'],
      'cinnamon': ['ground cinnamon', 'cinnamon stick'],
      'nutmeg': ['ground nutmeg', 'whole nutmeg'],
      'vanilla': ['vanilla extract', 'vanilla bean'],
      'honey': ['raw honey', 'clover honey'],
      'maple syrup': ['pure maple syrup', 'maple syrup'],
      'soy sauce': ['light soy sauce', 'dark soy sauce', 'tamari'],
      'vinegar': ['apple cider vinegar', 'balsamic vinegar', 'white vinegar'],
      'mustard': ['dijon mustard', 'yellow mustard', 'whole grain mustard'],
      'mayonnaise': ['mayo', 'light mayonnaise'],
      'ketchup': ['tomato ketchup', 'catsup'],
      'hot sauce': ['sriracha', 'tabasco', 'chili sauce'],
      'worcestershire': ['worcestershire sauce'],
      'fish sauce': ['fish sauce'],
      'oyster sauce': ['oyster sauce'],
      'sesame oil': ['toasted sesame oil', 'sesame oil'],
      'coconut oil': ['virgin coconut oil', 'refined coconut oil'],
      'avocado': ['avocados', 'avocado oil'],
      'almond': ['almonds', 'almond flour', 'almond milk'],
      'walnut': ['walnuts', 'walnut pieces'],
      'pecan': ['pecans', 'pecan pieces'],
      'cashew': ['cashews', 'cashew pieces'],
      'peanut': ['peanuts', 'peanut butter'],
      'sunflower seed': ['sunflower seeds'],
      'pumpkin seed': ['pumpkin seeds', 'pepitas'],
      'chia seed': ['chia seeds'],
      'flax seed': ['flax seeds', 'flax meal'],
      'quinoa': ['quinoa'],
      'oat': ['oats', 'rolled oats', 'steel cut oats'],
      'barley': ['pearl barley', 'barley'],
      'lentil': ['lentils', 'red lentils', 'green lentils'],
      'chickpea': ['chickpeas', 'garbanzo beans'],
      'black bean': ['black beans'],
      'kidney bean': ['kidney beans'],
      'pinto bean': ['pinto beans'],
      'cannellini bean': ['cannellini beans', 'white beans'],
      'salmon': ['salmon fillet', 'salmon steak'],
      'tuna': ['tuna steak', 'canned tuna'],
      'shrimp': ['shrimp', 'prawns'],
      'tilapia': ['tilapia fillet'],
      'cod': ['cod fillet'],
      'halibut': ['halibut fillet'],
      'scallop': ['scallops', 'sea scallops'],
      'mussel': ['mussels'],
      'clam': ['clams'],
      'oyster': ['oysters'],
      'crab': ['crab meat', 'crab legs'],
      'lobster': ['lobster tail', 'lobster meat'],
      'turkey': ['turkey breast', 'ground turkey'],
      'pork': ['pork chop', 'pork tenderloin', 'ground pork'],
      'lamb': ['lamb chop', 'ground lamb'],
      'duck': ['duck breast', 'duck meat'],
      'goose': ['goose meat'],
      'quail': ['quail meat'],
      'pheasant': ['pheasant meat'],
      'venison': ['venison meat'],
      'bison': ['bison meat'],
      'elk': ['elk meat'],
      'rabbit': ['rabbit meat'],
      'squab': ['squab meat'],
      'pigeon': ['pigeon meat'],
      'partridge': ['partridge meat'],
      'grouse': ['grouse meat'],
      'woodcock': ['woodcock meat'],
      'snipe': ['snipe meat'],
      'teal': ['teal meat'],
      'mallard': ['mallard meat'],
      'canvasback': ['canvasback meat'],
      'redhead': ['redhead meat'],
      'scaup': ['scaup meat'],
      'goldeneye': ['goldeneye meat'],
      'bufflehead': ['bufflehead meat'],
      'merganser': ['merganser meat'],
      'eider': ['eider meat'],
      'scoter': ['scoter meat'],
      'old squaw': ['old squaw meat'],
      'harlequin': ['harlequin meat'],
      'surf scoter': ['surf scoter meat'],
      'white winged scoter': ['white winged scoter meat'],
      'black scoter': ['black scoter meat'],
      'common eider': ['common eider meat'],
      'king eider': ['king eider meat'],
      'spectacled eider': ['spectacled eider meat'],
      'steller eider': ['steller eider meat'],
      'labrador duck': ['labrador duck meat'],
      'great auk': ['great auk meat'],
      'passenger pigeon': ['passenger pigeon meat'],
      'carolina parakeet': ['carolina parakeet meat'],
      'ivory billed woodpecker': ['ivory billed woodpecker meat'],
      'bachman warbler': ['bachman warbler meat'],
      'eskimo curlew': ['eskimo curlew meat'],
      'heath hen': ['heath hen meat']
    };

    // Check each recipe ingredient against user ingredients
    recipeIngredients.forEach(recipeIngredient => {
      let bestMatch = '';
      let bestScore = 0;

      userIngredients.forEach(userIngredient => {
        // Direct match
        if (recipeIngredient === userIngredient) {
          bestMatch = userIngredient;
          bestScore = 1.0;
          return;
        }

        // Synonym match
        const synonyms = ingredientSynonyms[userIngredient] || [];
        if (synonyms.includes(recipeIngredient)) {
          bestMatch = userIngredient;
          bestScore = 0.95;
          return;
        }

        // Partial match (contains)
        if (recipeIngredient.includes(userIngredient) || userIngredient.includes(recipeIngredient)) {
          const score = Math.min(recipeIngredient.length, userIngredient.length) /
            Math.max(recipeIngredient.length, userIngredient.length);
          if (score > bestScore && score >= tolerance) {
            bestMatch = userIngredient;
            bestScore = score;
          }
        }

        // Fuzzy match using simple similarity
        const similarity = calculateSimilarity(recipeIngredient, userIngredient);
        if (similarity > bestScore && similarity >= tolerance) {
          bestMatch = userIngredient;
          bestScore = similarity;
        }
      });

      if (bestScore >= tolerance) {
        usedIngredients.push(bestMatch);
        totalScore += bestScore;
      } else {
        missedIngredients.push(recipeIngredient);
      }
    });

    const matchScore = recipeIngredients.length > 0 ? totalScore / recipeIngredients.length : 0;

    return { usedIngredients, missedIngredients, matchScore };
  };

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  const calculateSimilarity = (str1: string, str2: string): number => {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLength = Math.max(len1, len2);
    return maxLength > 0 ? 1 - (distance / maxLength) : 1;
  };

  /**
   * Apply advanced filters to recipes
   */
  const applyAdvancedFilters = (recipes: FridgeRecipe[]): FridgeRecipe[] => {
    return recipes.filter(recipe => {
      // Time filter
      if (maxReadyTime > 0 && recipe.readyInMinutes > maxReadyTime) {
        return false;
      }

      // Cuisine filter
      if (cuisineFilter && recipe.cuisines && !recipe.cuisines.includes(cuisineFilter)) {
        return false;
      }

      // Diet filter
      if (dietFilter && recipe.diets && !recipe.diets.includes(dietFilter)) {
        return false;
      }

      return true;
    });
  };

  /**
   * Sort recipes based on user preference
   */
  const sortRecipes = (recipes: FridgeRecipe[], sortBy: string): FridgeRecipe[] => {
    const sorted = [...recipes];

    switch (sortBy) {
      case 'missing':
        return sorted.sort((a, b) => a.missedIngredientCount - b.missedIngredientCount);
      case 'time':
        return sorted.sort((a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
      case 'calories':
        return sorted.sort((a, b) => {
          const aCalories = a.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;
          const bCalories = b.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;
          return aCalories - bCalories;
        });
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
  };

  // ===== COMPUTED VALUES =====

  /**
   * Filter recipes based on search query
   * Allows users to search within recipe results
   */
  const filteredRecipes = recipes.filter(recipe =>
    !searchQuery || recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== RENDER =====

  return (
    <div className={styles.fridgePageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>My Fridge</h1>
          <p className={styles.pageSubtitle}>Add ingredients from your fridge and discover delicious recipes you can make</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Ingredient Selection Section */}
        <div className={styles.ingredientSection}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleIcon}>🥬</span>
              Add Ingredients
            </h2>

            {/* Ingredient Search Bar */}
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Custom Ingredient Input */}
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

            {/* Ingredient Categories */}
            <div className={styles.categoriesContainer}>
              {Object.entries(ingredientCategories).map(([category, ingredients]) => {
                // Filter ingredients based on search query
                const filteredIngredients = ingredients.filter(ingredient =>
                  !searchQuery || ingredient.toLowerCase().includes(searchQuery.toLowerCase())
                );

                // Don't render category if no ingredients match search
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

        {/* Results Section */}
        <div className={styles.resultsSection}>
          <div className={styles.sectionCard}>
            {/* Selected Ingredients Header */}
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

            {/* Selected Ingredients List */}
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

                {/* Search Controls */}
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
              /* Empty State */
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🥘</div>
                <p>No ingredients selected yet</p>
                <p className={styles.emptySubtext}>Add ingredients from your fridge to discover recipes!</p>
              </div>
            )}
          </div>

          {/* Recipe Results */}
          {recipes.length > 0 && (
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleIcon}>🍽️</span>
                Recipe Results ({filteredRecipes.length})
              </h2>

              {/* Recipe Grid */}
              <div className={styles.recipesGrid}>
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    {/* Recipe Image with Overlay */}
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
                    {/* Recipe Content */}
                    <div className={styles.recipeContent}>
                      <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                      {recipe.readyInMinutes && (
                        <div className={styles.recipeTime}>
                          ⏱️ {recipe.readyInMinutes} minutes
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/recipes/${recipe.id}`, { state: { recipe } })}
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