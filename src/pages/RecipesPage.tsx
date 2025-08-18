
// Recipes page - shows all recipes with search and filtering
// 
// PREFERENCE FLOW: OnboardingPage → basicFilters
// 1. User selects preferences in OnboardingPage (cuisine, diet, time)
// 2. Preferences are saved to Firestore after login
// 3. RecipesPage loads preferences and automatically sets basicFilters as defaults
// 4. User can manually change filters anytime - changes are saved to localStorage
// 5. On page refresh/login, filters remember the last user choice (localStorage) OR onboarding defaults (Firestore)
//
import React, { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse } from '../types/recipeTypes';
// Using local filter service for instant results instead of API calls
import { filterRecipes as localFilterRecipes, getFilterOptions as localGetFilterOptions, getRecipeDetails as localGetRecipeDetails } from '../services/filterService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { mapPreferencesToSearchParams, type UserPreferences } from '../utils/preferenceMapper';
import { sanitizeRecipeForFirestore } from '../utils/recipeSanitizer';
import styles from './RecipesPage.module.css';

// Import components
import RecipeCard from '../components/RecipeCard';
import {
  ProgressiveLoading,
  Toast
} from '../components/LoadingStates';

// Type for favorite recipes stored in the database
interface FavoriteRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: import('../types/recipeTypes').Nutrition;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  aggregateLikes: number;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  cheap: boolean;
  dairyFree: boolean;
  glutenFree: boolean;
  ketogenic: boolean;
  lowFodmap: boolean;
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  occasions: string[];
  extendedIngredients: import('../types/recipeTypes').ExtendedIngredient[];
  summary?: string;
  // When the recipe was added to favorites
  addedAt: number;
}

// Main recipes page component
const RecipesPage: React.FC = () => {
  // Get favorites and auth data
  const { favorites, favoriteRecipes, toggleFavorite, isFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states with localStorage persistence
  // These remember the user's last filter choices across sessions
  const [selectedMenu, setSelectedMenu] = useState(() => {
    return localStorage.getItem('cravrplan_filter_cuisine') || 'All Menus';
  });
  const [selectedDiet, setSelectedDiet] = useState(() => {
    return localStorage.getItem('cravrplan_filter_diet') || 'No Diet Restrictions';
  });
  const [selectedMealType, setSelectedMealType] = useState(() => {
    return localStorage.getItem('cravrplan_filter_mealType') || 'All Meal Types';
  });
  const [selectedTimePreference, setSelectedTimePreference] = useState(() => {
    return localStorage.getItem('cravrplan_filter_time') || 'All Time Ranges';
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // State for recipes and loading
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // State for search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // State for notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // State for user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Popular search terms for suggestions
  const popularSearches = [
    'chicken', 'pasta', 'salad', 'soup', 'dessert', 'breakfast', 'lunch', 'dinner',
    'vegetarian', 'vegan', 'quick', 'healthy', 'italian', 'mexican', 'asian', 'indian',
    'mediterranean', 'greek', 'french', 'japanese', 'chinese', 'thai',
    'pizza', 'burger', 'sushi', 'curry', 'stir fry', 'grilled', 'baked', 'fried',
    'smoothie', 'juice', 'coffee', 'tea', 'bread', 'cake', 'cookie', 'ice cream',
    'low carb', 'keto', 'paleo', 'gluten free', 'dairy free', 'nut free', 'seafood',
    'beef', 'pork', 'lamb', 'fish', 'shrimp', 'salmon', 'tuna', 'tofu', 'quinoa',
    'rice', 'noodles', 'potato', 'sweet potato', 'avocado', 'tomato', 'spinach',
    'kale', 'broccoli', 'cauliflower', 'carrot', 'onion', 'garlic', 'ginger',
    'lemon', 'lime', 'orange', 'apple', 'banana', 'berry', 'strawberry', 'blueberry'
  ];





  // Load filter options when component mounts
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Get filter options from local service
        const options = localGetFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
        setToastMessage('Failed to load filter options');
        setToastType('warning');
        setShowToast(true);
      }
    };

    loadFilterOptions();
  }, []);

  // Load user preferences when user logs in or out
  // This function syncs preferences from OnboardingPage → basicFilters automatically
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (isAuthenticated && user) {
        try {
          // Step 1: Load saved preferences from Firestore (saved after onboarding)
          const preferences = await firestoreService.getUserPreferences(user.id);
          if (preferences) {
            setUserPreferences(preferences);
            console.log('Loaded user preferences from Firestore:', preferences);

            // Step 2: Apply preferences to basicFilters as defaults
            // This ensures the filters show the user's onboarding choices automatically
            applyPreferencesToFilters(preferences);
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      } else {
        // Clear preferences when in guest mode
        setUserPreferences(null);
        console.log('Cleared user preferences for guest mode');

        // Reset filters to show all recipes
        resetFiltersToDefaults();
        console.log('Reset filters to defaults for guest mode');
      }
    };

    loadUserPreferences();
  }, [isAuthenticated, user]);

  // Helper function to apply user preferences to basicFilters
  // This maps onboarding choices to the correct filter values and saves them to localStorage
  const applyPreferencesToFilters = (preferences: UserPreferences) => {
    console.log('Applying preferences to filters:', preferences);

    // Map cuisine preferences to selectedMenu filter
    if (preferences.cuisinePreferences.length > 0) {
      const cuisine = preferences.cuisinePreferences[0];
      // Ensure the cuisine exists in our filter options
      if (filterOptions?.cuisines.some(c => c.value === cuisine)) {
        setSelectedMenu(cuisine);
        // Save to localStorage so the preference persists
        localStorage.setItem('cravrplan_filter_cuisine', cuisine);
        console.log('Set cuisine filter to:', cuisine);
      }
    }

    // Map dietary restrictions to selectedDiet filter
    if (preferences.dietaryRestrictions.length > 0) {
      const diet = preferences.dietaryRestrictions[0];
      // Ensure the diet exists in our filter options
      if (filterOptions?.diets.some(d => d.value === diet)) {
        setSelectedDiet(diet);
        // Save to localStorage so the preference persists
        localStorage.setItem('cravrplan_filter_diet', diet);
        console.log('Set diet filter to:', diet);
      }
    }

    // Map time preferences to selectedTimePreference filter
    if (preferences.timePreferences.length > 0) {
      const timePref = preferences.timePreferences[0];
      // Map time preference strings to filter values
      if (timePref.includes('15-30')) {
        setSelectedTimePreference('15-30');
        localStorage.setItem('cravrplan_filter_time', '15-30');
        console.log('Set time filter to: 15-30');
      } else if (timePref.includes('30-60')) {
        setSelectedTimePreference('30-60');
        localStorage.setItem('cravrplan_filter_time', '30-60');
        console.log('Set time filter to: 30-60');
      } else if (timePref.includes('60+')) {
        setSelectedTimePreference('60+');
        localStorage.setItem('cravrplan_filter_time', '60+');
        console.log('Set time filter to: 60+');
      }
    }
  };

  // Helper function to reset filters to default "show all" values
  const resetFiltersToDefaults = () => {
    setSelectedMenu('All Menus');
    setSelectedDiet('No Diet Restrictions');
    setSelectedMealType('All Meal Types');
    setSelectedTimePreference('All Time Ranges');

    // Clear localStorage to reset persistent filter choices
    localStorage.removeItem('cravrplan_filter_cuisine');
    localStorage.removeItem('cravrplan_filter_diet');
    localStorage.removeItem('cravrplan_filter_mealType');
    localStorage.removeItem('cravrplan_filter_time');
  };



  // Wait a bit before searching to avoid too many calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load favorite recipes from stored data or fetch them
  const loadFavoriteRecipes = async (favoriteIds: number[]): Promise<Recipe[]> => {
    const loadedRecipes: Recipe[] = [];

    for (const favoriteId of favoriteIds) {
      try {
        // First try to get from stored favorite recipes
        const storedRecipe = favoriteRecipes.find(recipe => recipe.id === favoriteId);
        if (storedRecipe) {
          // Convert stored recipe to Recipe format
          const recipe: Recipe = {
            id: storedRecipe.id,
            title: storedRecipe.title,
            image: storedRecipe.image,
            imageType: storedRecipe.imageType,
            readyInMinutes: storedRecipe.readyInMinutes,
            servings: storedRecipe.servings,
            nutrition: storedRecipe.nutrition ? {
              nutrients: (storedRecipe.nutrition.nutrients || []).map(n => ({
                ...n,
                percentOfDailyNeeds: 0
              })),
              properties: [],
              flavonoids: [],
              ingredients: [],
              caloricBreakdown: { percentProtein: 0, percentFat: 0, percentCarbs: 0 },
              weightPerServing: { amount: 0, unit: 'g' }
            } : undefined,
            cuisines: storedRecipe.cuisines,
            dishTypes: storedRecipe.dishTypes,
            diets: storedRecipe.diets,
            aggregateLikes: storedRecipe.aggregateLikes,
            healthScore: storedRecipe.healthScore,
            spoonacularScore: storedRecipe.spoonacularScore,
            pricePerServing: storedRecipe.pricePerServing,
            cheap: storedRecipe.cheap,
            dairyFree: storedRecipe.dairyFree,
            glutenFree: storedRecipe.glutenFree,
            ketogenic: storedRecipe.ketogenic,
            lowFodmap: storedRecipe.lowFodmap,
            sustainable: storedRecipe.sustainable,
            vegan: storedRecipe.vegan,
            vegetarian: storedRecipe.vegetarian,
            veryHealthy: storedRecipe.veryHealthy,
            veryPopular: storedRecipe.veryPopular,
            whole30: storedRecipe.whole30,
            weightWatcherSmartPoints: storedRecipe.weightWatcherSmartPoints,
            occasions: storedRecipe.occasions,
            extendedIngredients: storedRecipe.extendedIngredients.map(ing => ({
              id: ing.id,
              aisle: 'Unknown',
              amount: ing.amount,
              unit: ing.unit,
              name: ing.name,
              original: ing.original,
              originalName: ing.name,
              meta: [],
              image: ''
            })),
            // Add other required fields with defaults
            analyzedInstructions: [],
            instructions: '',
            summary: storedRecipe.summary || '',
            sourceUrl: '',
            sourceName: '',
            creditsText: '',
            license: '',
            gaps: ''
          };
          loadedRecipes.push(recipe);
          continue;
        }

        // If not in stored data, try to fetch from local service
        const recipeDetail = await localGetRecipeDetails(favoriteId);
        if (recipeDetail) {
          loadedRecipes.push(recipeDetail);
        }
      } catch (err) {
        console.error(`Error loading favorite recipe ${favoriteId}:`, err);
        // Keep loading other recipes even if one fails
      }
    }

    return loadedRecipes;
  };

  // Main search effect - runs when filters or search query changes
  useEffect(() => {
    // Only search if filter options are loaded
    if (!filterOptions) return;

    const searchRecipesWithFilters = async () => {
      setError(null);

      // Show loading only if we don't have any recipes yet
      const shouldShowLoading = recipes.length === 0;
      if (shouldShowLoading) {
        setIsSearching(true);
      }

      try {
        // Show favorites only if that filter is selected
        if (showFavoritesOnly) {
          if (favorites.length === 0) {
            setRecipes([]);
            setTotalResults(0);
            setHasNextPage(false);
            setHasPreviousPage(false);
          } else {
            const favoriteRecipes = await loadFavoriteRecipes(favorites);
            setRecipes(favoriteRecipes);
            setTotalResults(favoriteRecipes.length);
            setHasNextPage(false);
            setHasPreviousPage(false);
          }
        } else {
          // Build search parameters
          const searchParams: RecipeSearchParams = {
            number: 20, // 20 recipes per page
            offset: currentPage * 20
          };

          // Add search query if user typed something
          if (debouncedSearchQuery.trim()) {
            searchParams.query = debouncedSearchQuery.trim();
          }

          // Apply user preferences first (these take priority)
          if (userPreferences) {
            const preferenceParams = mapPreferencesToSearchParams(userPreferences);
            Object.assign(searchParams, preferenceParams);
          }

          // Add manual diet filter if selected (overrides preferences)
          if (selectedDiet !== 'No Diet Restrictions') {
            searchParams.diet = selectedDiet;
          }

          // Add manual cuisine filter if selected (overrides preferences)
          if (selectedMenu !== 'All Menus') {
            searchParams.cuisine = selectedMenu;
          }

          // Add meal type filter if selected
          if (selectedMealType !== 'All Meal Types') {
            searchParams.type = selectedMealType;
          }

          // Add time preference filter if selected (overrides preferences)
          if (selectedTimePreference !== 'All Time Ranges') {
            const timeValue = selectedTimePreference;
            if (timeValue === '15-30') {
              searchParams.maxReadyTime = 30;
            } else if (timeValue === '30-60') {
              searchParams.maxReadyTime = 60;
            } else if (timeValue === '60+') {
              searchParams.maxReadyTime = 120;
            }
          }

          // Use local filter service for instant results
          console.log('Search params being applied:', searchParams);
          const response = localFilterRecipes(searchParams);
          console.log('Filter response:', response);
          setRecipes(response.recipes);
          setTotalResults(response.totalResults);
          setHasNextPage(response.offset + response.number < response.totalResults);
          setHasPreviousPage(response.offset > 0);

          // Show error if no recipes found
          if (response.recipes.length === 0) {
            setError('No recipes found. Try adjusting your search or filters.');
          } else {
            setError(null);
          }
        }
      } catch (err) {
        console.error('Error searching recipes:', err);
        setError('Failed to load recipes. Please try again.');
        setRecipes([]);
        setTotalResults(0);
        setHasNextPage(false);
        setHasPreviousPage(false);

        setToastMessage('Failed to load recipes. Please try again.');
        setToastType('error');
        setShowToast(true);
      } finally {
        setIsSearching(false);
      }
    };

    searchRecipesWithFilters();
  }, [debouncedSearchQuery, selectedMenu, selectedDiet, selectedMealType, selectedTimePreference, showFavoritesOnly, currentPage, favorites, userPreferences, filterOptions]);



  // Handle pagination
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  // Handle filter changes - these save user choices to localStorage for persistence
  const handleMenuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedMenu(newValue);
    // Save to localStorage so filter choice persists across sessions
    localStorage.setItem('cravrplan_filter_cuisine', newValue);
    setCurrentPage(0); // Go back to first page when filter changes
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedDiet(newValue);
    // Save to localStorage so filter choice persists across sessions
    localStorage.setItem('cravrplan_filter_diet', newValue);
    setCurrentPage(0);
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedMealType(newValue);
    // Save to localStorage so filter choice persists across sessions
    localStorage.setItem('cravrplan_filter_mealType', newValue);
    setCurrentPage(0);
  };

  const handleTimePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedTimePreference(newValue);
    // Save to localStorage so filter choice persists across sessions
    localStorage.setItem('cravrplan_filter_time', newValue);
    setCurrentPage(0);
  };

  // Clear all filters and show all recipes
  const clearAllFilters = () => {
    setSelectedMenu('All Menus');
    setSelectedDiet('No Diet Restrictions');
    setSelectedMealType('All Meal Types');
    setSelectedTimePreference('All Time Ranges');
    setSearchQuery('');
    setCurrentPage(0);
    setUserPreferences(null);

    // Clear localStorage to reset persistent filter choices
    localStorage.removeItem('cravrplan_filter_cuisine');
    localStorage.removeItem('cravrplan_filter_diet');
    localStorage.removeItem('cravrplan_filter_mealType');
    localStorage.removeItem('cravrplan_filter_time');
    localStorage.removeItem('pending_preferences');

    console.log('Cleared all filters and localStorage to show all recipes');
  };



  // Handle clicking on a search suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
  };

  // Handle adding/removing recipes from favorites
  const handleToggleFavorite = async (recipeId: number, isCurrentlyFavorite: boolean) => {
    try {
      if (isCurrentlyFavorite) {
        await toggleFavorite(recipeId);
        setToastMessage('Removed from favorites');
        setToastType('info');
      } else {
        // Find the recipe and add it to favorites
        const recipeToAdd = recipes.find(recipe => recipe.id === recipeId);
        if (recipeToAdd) {
          // Clean up the recipe data before saving
          const sanitizedRecipe = sanitizeRecipeForFirestore(recipeToAdd);
          const favoriteRecipe: FavoriteRecipe = {
            ...sanitizedRecipe,
            addedAt: Date.now()
          };
          await toggleFavorite(recipeId, favoriteRecipe);
        } else {
          await toggleFavorite(recipeId);
        }
        setToastMessage('Added to favorites');
        setToastType('success');
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setToastMessage('Failed to update favorites. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Toggle between showing all recipes and favorites only
  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(0);
  };

  // Get search suggestions based on what user types
  const getSearchSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();

    // Find exact matches first
    const exactMatches = popularSearches.filter(search =>
      search.toLowerCase() === queryLower
    );

    // Then find things that start with the query
    const startsWithMatches = popularSearches.filter(search =>
      search.toLowerCase().startsWith(queryLower) && search.toLowerCase() !== queryLower
    );

    // Finally find things that contain the query
    const containsMatches = popularSearches.filter(search =>
      search.toLowerCase().includes(queryLower) &&
      !search.toLowerCase().startsWith(queryLower) &&
      search.toLowerCase() !== queryLower
    );

    // Combine all matches and limit to 8 suggestions
    const suggestions = [...exactMatches, ...startsWithMatches, ...containsMatches];
    return suggestions.slice(0, 8);
  }, []);

  // Handle typing in search box
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      const suggestions = getSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  // Handle focusing on search box
  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      const suggestions = getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }
  };

  // Handle leaving search box
  const handleSearchInputBlur = () => {
    // Wait a bit before hiding suggestions so user can click them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle keyboard events in search box
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      // Search will happen automatically from the debounced query
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Retry loading recipes if there was an error
  const handleRetry = () => {
    setError(null);
    setCurrentPage(0);
    // This will trigger the search effect to try again
  };



  // Function to render each recipe card
  const renderRecipeCard = (recipe: Recipe) => (
    <RecipeCard
      key={recipe.id}
      recipe={recipe}
      onFavoriteToggle={handleToggleFavorite}
      isFavorite={isFavorite(recipe.id)}
    />
  );

  return (
    <>
      {/* Show toast notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={4000}
        />
      )}

      <div className={styles.recipesPageContainer}>
        <div className={styles.contentWrapper}>
          {/* Search bar */}
          <div className={styles.searchBar}>
            <div className={styles.searchInputContainer}>
              <input
                type="text"
                placeholder="Search for recipes, ingredients, cuisines..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                onBlur={handleSearchInputBlur}
                onKeyDown={handleKeyDown}
                className={styles.searchInput}
              />
              {isSearching && (
                <div className={styles.searchLoading}>
                  <div className={styles.searchSpinner}></div>
                </div>
              )}
              {!isSearching && (
                <button
                  className={styles.searchIconButton}
                  onClick={searchQuery ? () => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                    setSearchSuggestions([]);
                  } : undefined}
                  type="button"
                >
                  {searchQuery ? '✕' : '🔍'}
                </button>
              )}
              {/* Search suggestions dropdown */}
              {showSuggestions && (
                <div className={styles.searchSuggestions}>
                  <div className={styles.suggestionsHeader}>
                    <span>Popular searches</span>
                  </div>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className={styles.suggestionIcon}>🔍</span>
                      <span className={styles.suggestionText}>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>



          {/* Filter dropdowns */}
          <div className={styles.filters}>
            <div className={styles.basicFilters}>
              {/* Cuisine filter */}
              <select
                className={styles.filterDropdown}
                value={selectedMenu}
                onChange={handleMenuChange}
              >
                <option value="All Menus">All Cuisines</option>
                {filterOptions?.cuisines.map((cuisine) => (
                  <option key={cuisine.value} value={cuisine.value}>
                    {cuisine.name}
                  </option>
                ))}
              </select>

              {/* Diet filter */}
              <select
                className={styles.filterDropdown}
                value={selectedDiet}
                onChange={handleDietChange}
              >
                <option value="No Diet Restrictions">All Diets</option>
                {filterOptions?.diets.map((diet) => (
                  <option key={diet.value} value={diet.value}>
                    {diet.name}
                  </option>
                ))}
              </select>

              {/* Meal type filter */}
              <select
                className={styles.filterDropdown}
                value={selectedMealType}
                onChange={handleMealTypeChange}
              >
                <option value="All Meal Types">All Meal Types</option>
                {filterOptions?.mealTypes.map((mealType) => (
                  <option key={mealType.value} value={mealType.value}>
                    {mealType.name}
                  </option>
                ))}
              </select>

              {/* Time preference filter */}
              <select
                className={styles.filterDropdown}
                value={selectedTimePreference}
                onChange={handleTimePreferenceChange}
              >
                <option value="All Time Ranges">All Time Ranges</option>
                {filterOptions?.timePreferences.map((timePref) => (
                  <option key={timePref.value} value={timePref.value}>
                    {timePref.name}
                  </option>
                ))}
              </select>

              {/* Favorites toggle button */}
              <button
                onClick={handleFavoritesToggle}
                className={`${styles.favoritesButton} ${showFavoritesOnly ? styles.active : ''}`}
              >
                My Favorites ({favorites.length})
              </button>

              {/* Clear all filters button */}
              <button
                onClick={clearAllFilters}
                className={styles.clearFiltersButton}
                title="Clear all filters and show all recipes"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Show recipes or loading state */}
          {showFavoritesOnly && recipes.length === 0 ? (
            // Show message when no favorites
            <div className={styles.favoritesEmptyState}>
              <div className={styles.favoritesEmptyIcon}>❤️</div>
              <h3 className={styles.favoritesEmptyTitle}>No Favorite Recipes Yet</h3>
              <p className={styles.favoritesEmptyMessage}>
                Start exploring recipes and add them to your favorites to see them here!
              </p>
              <div className={styles.favoritesEmptyActions}>
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className={styles.exploreRecipesButton}
                >
                  Explore Recipes
                </button>
              </div>
            </div>
          ) : (
            // Show recipes with loading states
            <ProgressiveLoading
              items={recipes}
              renderItem={renderRecipeCard}
              loading={isSearching}
              error={error}
              onRetry={handleRetry}
              skeletonCount={6}
              skeletonVariant="recipe"
            />
          )}

          {/* Page navigation */}
          {!error && recipes.length > 0 && (
            <div className={styles.pagination}>
              <button
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage}
                className={`${styles.paginationButton} ${!hasPreviousPage ? styles.disabled : ''}`}
              >
                ← Prev
              </button>

              <div className={styles.pageInfo}>
                <span>Page {currentPage + 1}</span>
                <span className={styles.totalPages}>
                  {Math.ceil(totalResults / 20)} pages
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className={`${styles.paginationButton} ${!hasNextPage ? styles.disabled : ''}`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipesPage;