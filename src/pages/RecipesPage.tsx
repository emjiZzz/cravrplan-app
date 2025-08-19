/* RecipesPage.tsx - Main page for browsing and searching recipes with filters */

import React, { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse } from '../types/recipeTypes';
import { filterRecipes as localFilterRecipes, getFilterOptions as localGetFilterOptions, getRecipeDetails as localGetRecipeDetails } from '../services/filterService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { mapPreferencesToSearchParams, type UserPreferences } from '../utils/preferenceMapper';
import { sanitizeRecipeForFirestore } from '../utils/recipeSanitizer';
import styles from './RecipesPage.module.css';
import RecipeCard from '../components/RecipeCard';
import { ProgressiveLoading, Toast } from '../components/LoadingStates';

// Interface for favorite recipe data structure
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
  addedAt: number;
}

// Main component for browsing and searching recipes
const RecipesPage: React.FC = () => {
  // Get favorites context and authentication state
  const { favorites, favoriteRecipes, toggleFavorite, isFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();

  // Search and filter state management
  const [searchQuery, setSearchQuery] = useState('');
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

  // Recipe data and pagination state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Search suggestions and UI state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // User preferences state
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

  // Load user preferences when authentication state changes
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (isAuthenticated && user) {
        try {
          const preferences = await firestoreService.getUserPreferences(user.id);
          if (preferences) {
            setUserPreferences(preferences);
            console.log('Loaded user preferences from Firestore:', preferences);
            applyPreferencesToFilters(preferences);
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      } else {
        setUserPreferences(null);
        console.log('Cleared user preferences for guest mode');
        resetFiltersToDefaults();
        console.log('Reset filters to defaults for guest mode');
      }
    };

    loadUserPreferences();
  }, [isAuthenticated, user]);

  // Apply user preferences to filter settings
  const applyPreferencesToFilters = (preferences: UserPreferences) => {
    console.log('Applying preferences to filters:', preferences);

    if (preferences.cuisinePreferences.length > 0) {
      const cuisine = preferences.cuisinePreferences[0];
      if (filterOptions?.cuisines.some(c => c.value === cuisine)) {
        setSelectedMenu(cuisine);
        localStorage.setItem('cravrplan_filter_cuisine', cuisine);
        console.log('Set cuisine filter to:', cuisine);
      }
    }

    if (preferences.dietaryRestrictions.length > 0) {
      const diet = preferences.dietaryRestrictions[0];
      if (filterOptions?.diets.some(d => d.value === diet)) {
        setSelectedDiet(diet);
        localStorage.setItem('cravrplan_filter_diet', diet);
        console.log('Set diet filter to:', diet);
      }
    }

    if (preferences.timePreferences.length > 0) {
      const timePref = preferences.timePreferences[0];
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

  // Reset all filters to default values
  const resetFiltersToDefaults = () => {
    setSelectedMenu('All Menus');
    setSelectedDiet('No Diet Restrictions');
    setSelectedMealType('All Meal Types');
    setSelectedTimePreference('All Time Ranges');

    localStorage.removeItem('cravrplan_filter_cuisine');
    localStorage.removeItem('cravrplan_filter_diet');
    localStorage.removeItem('cravrplan_filter_mealType');
    localStorage.removeItem('cravrplan_filter_time');
  };

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load favorite recipes from stored data or API
  const loadFavoriteRecipes = async (favoriteIds: number[]): Promise<Recipe[]> => {
    const loadedRecipes: Recipe[] = [];

    for (const favoriteId of favoriteIds) {
      try {
        // Check if recipe is already stored in favorites
        const storedRecipe = favoriteRecipes.find(recipe => recipe.id === favoriteId);
        if (storedRecipe) {
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

        // Load recipe from API if not stored
        const recipeDetail = await localGetRecipeDetails(favoriteId);
        if (recipeDetail) {
          loadedRecipes.push(recipeDetail);
        }
      } catch (err) {
        console.error(`Error loading favorite recipe ${favoriteId}:`, err);
      }
    }

    return loadedRecipes;
  };

  // Main search effect - triggered when filters or search query changes
  useEffect(() => {
    if (!filterOptions) return;

    const searchRecipesWithFilters = async () => {
      setError(null);

      const shouldShowLoading = recipes.length === 0;
      if (shouldShowLoading) {
        setIsSearching(true);
      }

      try {
        if (showFavoritesOnly) {
          // Show only favorite recipes
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
          // Search recipes with filters
          const searchParams: RecipeSearchParams = {
            number: 20,
            offset: currentPage * 20
          };

          if (debouncedSearchQuery.trim()) {
            searchParams.query = debouncedSearchQuery.trim();
          }

          if (userPreferences) {
            const preferenceParams = mapPreferencesToSearchParams(userPreferences);
            Object.assign(searchParams, preferenceParams);
          }

          if (selectedDiet !== 'No Diet Restrictions') {
            searchParams.diet = selectedDiet;
          }

          if (selectedMenu !== 'All Menus') {
            searchParams.cuisine = selectedMenu;
          }

          if (selectedMealType !== 'All Meal Types') {
            searchParams.type = selectedMealType;
          }

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

          console.log('Search params being applied:', searchParams);
          const response = await localFilterRecipes(searchParams);
          console.log('Filter response:', response);
          setRecipes(response.recipes);
          setTotalResults(response.totalResults);
          setHasNextPage(response.offset + response.number < response.totalResults);
          setHasPreviousPage(response.offset > 0);

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

  // Navigation handlers for pagination
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  // Filter change handlers
  const handleMenuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedMenu(newValue);
    localStorage.setItem('cravrplan_filter_cuisine', newValue);
    setCurrentPage(0);
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedDiet(newValue);
    localStorage.setItem('cravrplan_filter_diet', newValue);
    setCurrentPage(0);
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedMealType(newValue);
    localStorage.setItem('cravrplan_filter_mealType', newValue);
    setCurrentPage(0);
  };

  const handleTimePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedTimePreference(newValue);
    localStorage.setItem('cravrplan_filter_time', newValue);
    setCurrentPage(0);
  };

  // Clear all filters and reset to defaults
  const clearAllFilters = () => {
    setSelectedMenu('All Menus');
    setSelectedDiet('No Diet Restrictions');
    setSelectedMealType('All Meal Types');
    setSelectedTimePreference('All Time Ranges');
    setSearchQuery('');
    setCurrentPage(0);
    setUserPreferences(null);

    localStorage.removeItem('cravrplan_filter_cuisine');
    localStorage.removeItem('cravrplan_filter_diet');
    localStorage.removeItem('cravrplan_filter_mealType');
    localStorage.removeItem('cravrplan_filter_time');
    localStorage.removeItem('pending_preferences');

    console.log('Cleared all filters and localStorage to show all recipes');
  };

  // Search suggestion handlers
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
  };

  // Toggle favorite status for a recipe
  const handleToggleFavorite = async (recipeId: number, isCurrentlyFavorite: boolean) => {
    try {
      if (isCurrentlyFavorite) {
        await toggleFavorite(recipeId);
        setToastMessage('Removed from favorites');
        setToastType('info');
      } else {
        const recipeToAdd = recipes.find(recipe => recipe.id === recipeId);
        if (recipeToAdd) {
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

  // Generate search suggestions based on popular searches
  const getSearchSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();

    const exactMatches = popularSearches.filter(search =>
      search.toLowerCase() === queryLower
    );

    const startsWithMatches = popularSearches.filter(search =>
      search.toLowerCase().startsWith(queryLower) && search.toLowerCase() !== queryLower
    );

    const containsMatches = popularSearches.filter(search =>
      search.toLowerCase().includes(queryLower) &&
      !search.toLowerCase().startsWith(queryLower) &&
      search.toLowerCase() !== queryLower
    );

    const suggestions = [...exactMatches, ...startsWithMatches, ...containsMatches];
    return suggestions.slice(0, 8);
  }, []);

  // Search input change handler
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

  // Search input focus handler
  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      const suggestions = getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }
  };

  // Search input blur handler
  const handleSearchInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Keyboard event handler for search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Retry loading recipes when error occurs
  const handleRetry = () => {
    setError(null);
    setCurrentPage(0);
  };

  // Render individual recipe card
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
      {/* Toast notification component */}
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
          {/* Search bar with suggestions */}
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

          {/* Filter controls */}
          <div className={styles.filters}>
            <div className={styles.basicFilters}>
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

              <button
                onClick={handleFavoritesToggle}
                className={`${styles.favoritesButton} ${showFavoritesOnly ? styles.active : ''}`}
              >
                My Favorites ({favorites.length})
              </button>

              <button
                onClick={clearAllFilters}
                className={styles.clearFiltersButton}
                title="Clear all filters and show all recipes"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Empty state for favorites */}
          {showFavoritesOnly && recipes.length === 0 ? (
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
            /* Recipe grid with loading states */
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

          {/* Pagination controls */}
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