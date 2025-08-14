
// src/pages/RecipesPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse, ExtendedIngredient } from '../types/recipeTypes';
import { searchRecipes, getFilterOptions, getRecipeDetails, recipeApiService } from '../services/apiService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { mapPreferencesToSearchParams, type UserPreferences } from '../utils/preferenceMapper';
import { sanitizeRecipeForFirestore } from '../utils/recipeSanitizer';
import styles from './RecipesPage.module.css';

import RecipeCard from '../components/RecipeCard';
import {
  ProgressiveLoading,
  Toast
} from '../components/LoadingStates';

// Favorites storage interface
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

const RecipesPage: React.FC = () => {
  const { favorites, favoriteRecipes, toggleFavorite, isFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('All Menus');
  const [selectedDiet, setSelectedDiet] = useState('No Diet Restrictions');
  const [selectedMealType, setSelectedMealType] = useState('All Meal Types');
  const [selectedTimePreference, setSelectedTimePreference] = useState('All Time Ranges');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Search suggestions
  const popularSearches = [
    'chicken', 'pasta', 'salad', 'soup', 'dessert', 'breakfast', 'lunch', 'dinner',
    'vegetarian', 'vegan', 'quick', 'healthy', 'italian', 'mexican', 'asian', 'indian',
    'mediterranean', 'greek', 'french', 'japanese', 'chinese', 'thai', 'korean',
    'pizza', 'burger', 'sushi', 'curry', 'stir fry', 'grilled', 'baked', 'fried',
    'smoothie', 'juice', 'coffee', 'tea', 'bread', 'cake', 'cookie', 'ice cream',
    'low carb', 'keto', 'paleo', 'gluten free', 'dairy free', 'nut free', 'seafood',
    'beef', 'pork', 'lamb', 'fish', 'shrimp', 'salmon', 'tuna', 'tofu', 'quinoa',
    'rice', 'noodles', 'potato', 'sweet potato', 'avocado', 'tomato', 'spinach',
    'kale', 'broccoli', 'cauliflower', 'carrot', 'onion', 'garlic', 'ginger',
    'lemon', 'lime', 'orange', 'apple', 'banana', 'berry', 'strawberry', 'blueberry'
  ];

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
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

  // Load user preferences and restore filters from localStorage
  useEffect(() => {
    const loadUserPreferencesAndFilters = async () => {
      if (isAuthenticated && user) {
        try {
          const preferences = await firestoreService.getUserPreferences(user.id);
          if (preferences) {
            setUserPreferences(preferences);

            // Set initial filter values based on preferences
            if (preferences.cuisinePreferences.length > 0) {
              setSelectedMenu(preferences.cuisinePreferences[0]);
            }
            if (preferences.dietaryRestrictions.length > 0) {
              setSelectedDiet(preferences.dietaryRestrictions[0]);
            }
            if (preferences.timePreferences.length > 0) {
              const timePref = preferences.timePreferences[0];
              if (timePref.includes('15-30')) {
                setSelectedTimePreference('15-30');
              } else if (timePref.includes('30-60')) {
                setSelectedTimePreference('30-60');
              } else if (timePref.includes('60+')) {
                setSelectedTimePreference('60+');
              }
            }
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      } else {
        setUserPreferences(null);

        // Reset filter values to defaults for guest mode
        setSelectedMenu('All Menus');
        setSelectedDiet('No Diet Restrictions');
        setSelectedMealType('All Meal Types');
        setSelectedTimePreference('All Time Ranges');

        // Check for pending preferences from onboarding
        const pendingPreferences = localStorage.getItem('pending_preferences');
        if (pendingPreferences) {
          try {
            const preferences = JSON.parse(pendingPreferences);
            setUserPreferences(preferences);

            // Set initial filter values based on pending preferences
            if (preferences.cuisinePreferences.length > 0) {
              setSelectedMenu(preferences.cuisinePreferences[0]);
            }
            if (preferences.dietaryRestrictions.length > 0) {
              setSelectedDiet(preferences.dietaryRestrictions[0]);
            }
            if (preferences.timePreferences.length > 0) {
              const timePref = preferences.timePreferences[0];
              if (timePref.includes('15-30')) {
                setSelectedTimePreference('15-30');
              } else if (timePref.includes('30-60')) {
                setSelectedTimePreference('30-60');
              } else if (timePref.includes('60+')) {
                setSelectedTimePreference('60+');
              }
            }
          } catch (error) {
            console.error('Error parsing pending preferences:', error);
          }
        }
      }

      // Restore filters from localStorage
      try {
        const savedFilters = recipeApiService.getLastUsedFilters();
        if (savedFilters.query) {
          setSearchQuery(savedFilters.query);
          setDebouncedSearchQuery(savedFilters.query);
        }
        if (savedFilters.cuisine) {
          setSelectedMenu(savedFilters.cuisine);
        }
        if (savedFilters.diet) {
          setSelectedDiet(savedFilters.diet);
        }
        if (savedFilters.type) {
          setSelectedMealType(savedFilters.type);
        }
        if (savedFilters.maxReadyTime) {
          if (savedFilters.maxReadyTime <= 30) {
            setSelectedTimePreference('15-30');
          } else if (savedFilters.maxReadyTime <= 60) {
            setSelectedTimePreference('30-60');
          } else {
            setSelectedTimePreference('60+');
          }
        }
      } catch (error) {
        console.warn('Failed to restore filters from localStorage:', error);
      }
    };

    loadUserPreferencesAndFilters();
  }, [isAuthenticated, user]);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load favorite recipes with enhanced error handling
  const loadFavoriteRecipes = async (favoriteIds: number[]): Promise<Recipe[]> => {
    const loadedRecipes: Recipe[] = [];

    for (const favoriteId of favoriteIds) {
      try {
        // First check if we have the recipe in stored data
        const storedRecipe = favoriteRecipes.find(recipe => recipe.id === favoriteId);
        if (storedRecipe) {
          // Convert stored recipe back to Recipe format
          const recipe: Recipe = {
            id: storedRecipe.id,
            title: storedRecipe.title,
            image: storedRecipe.image,
            imageType: storedRecipe.imageType,
            servings: storedRecipe.servings,
            readyInMinutes: storedRecipe.readyInMinutes,
            aggregateLikes: storedRecipe.aggregateLikes,
            healthScore: storedRecipe.healthScore,
            spoonacularScore: storedRecipe.spoonacularScore,
            pricePerServing: storedRecipe.pricePerServing,
            analyzedInstructions: [],
            cheap: storedRecipe.cheap,
            cuisines: storedRecipe.cuisines,
            dairyFree: storedRecipe.dairyFree,
            diets: storedRecipe.diets,
            gaps: '',
            glutenFree: storedRecipe.glutenFree,
            instructions: '',
            ketogenic: storedRecipe.ketogenic,
            lowFodmap: storedRecipe.lowFodmap,
            occasions: storedRecipe.occasions,
            sustainable: storedRecipe.sustainable,
            vegan: storedRecipe.vegan,
            vegetarian: storedRecipe.vegetarian,
            veryHealthy: storedRecipe.veryHealthy,
            veryPopular: storedRecipe.veryPopular,
            whole30: storedRecipe.whole30,
            weightWatcherSmartPoints: storedRecipe.weightWatcherSmartPoints,
            dishTypes: storedRecipe.dishTypes,
            extendedIngredients: storedRecipe.extendedIngredients as ExtendedIngredient[],
            summary: storedRecipe.summary || '',
            license: '',
            sourceName: '',
            sourceUrl: '',
            spoonacularSourceUrl: '',
            creditsText: ''
          };
          loadedRecipes.push(recipe);
          continue;
        }

        // If not in stored data, try to fetch from API
        const recipeDetail = await getRecipeDetails(favoriteId);
        loadedRecipes.push(recipeDetail);
      } catch (err) {
        console.error(`❌ Error loading favorite recipe ${favoriteId}:`, err);
      }
    }

    return loadedRecipes;
  };

  // Search recipes when filters change or page changes
  useEffect(() => {
    const searchRecipesWithFilters = async () => {
      setError(null);

      const shouldShowLoading = !isInitialLoad || !recipeApiService['useMockData'];
      if (shouldShowLoading) {
        setIsSearching(true);
      }

      try {
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
          const searchParams: RecipeSearchParams = {
            number: 20,
            offset: currentPage * 20
          };

          if (debouncedSearchQuery.trim()) {
            searchParams.query = debouncedSearchQuery.trim();
          }

          // Apply user preferences first
          if (userPreferences) {
            const preferenceParams = mapPreferencesToSearchParams(userPreferences);
            Object.assign(searchParams, preferenceParams);
          }

          // Add manual diet filter if selected
          if (selectedDiet !== 'No Diet Restrictions') {
            searchParams.diet = selectedDiet;
          }

          // Add manual cuisine filter if selected
          if (selectedMenu !== 'All Menus') {
            searchParams.cuisine = selectedMenu;
          }

          // Add meal type filter if selected
          if (selectedMealType !== 'All Meal Types') {
            searchParams.type = selectedMealType;
          }

          // Add time preference filter if selected
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

          const response = await searchRecipes(searchParams);
          setRecipes(response.results);
          setTotalResults(response.totalResults);
          setHasNextPage(response.offset + response.number < response.totalResults);
          setHasPreviousPage(response.offset > 0);
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
        setIsInitialLoad(false);
      }
    };

    searchRecipesWithFilters();
  }, [debouncedSearchQuery, selectedMenu, selectedDiet, selectedMealType, selectedTimePreference, showFavoritesOnly, currentPage, favorites, userPreferences]);

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedMenu(newValue);
    setCurrentPage(0);

    if (isAuthenticated && user && userPreferences) {
      const updatedPreferences: UserPreferences = {
        ...userPreferences,
        cuisinePreferences: newValue !== 'All Menus' ? [newValue] : []
      };
      saveUserPreferences(updatedPreferences);
    }
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedDiet(newValue);
    setCurrentPage(0);

    if (isAuthenticated && user && userPreferences) {
      const updatedPreferences: UserPreferences = {
        ...userPreferences,
        dietaryRestrictions: newValue !== 'No Diet Restrictions' ? [newValue] : []
      };
      saveUserPreferences(updatedPreferences);
    }
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealType(e.target.value);
    setCurrentPage(0);
  };

  const handleTimePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedTimePreference(newValue);
    setCurrentPage(0);

    if (isAuthenticated && user && userPreferences) {
      const updatedPreferences: UserPreferences = {
        ...userPreferences,
        timePreferences: newValue !== 'All Time Ranges' ? [newValue] : []
      };
      saveUserPreferences(updatedPreferences);
    }
  };

  // Function to save user preferences
  const saveUserPreferences = async (preferences: UserPreferences) => {
    if (isAuthenticated && user) {
      try {
        await firestoreService.saveUserPreferences(user.id, preferences);
        setUserPreferences(preferences);
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
  };

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

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(0);
  };

  // Search suggestions with better matching
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

  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      const suggestions = getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }
  };

  const handleSearchInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentPage(0);
  };

  const renderRecipeCard = (recipe: Recipe) => (
    <RecipeCard
      key={recipe.id}
      recipe={{
        ...recipe,
        nutrition: recipe.nutrition
          ? {
            nutrients: recipe.nutrition.nutrients || []
          }
          : undefined,
      }}
      onFavoriteToggle={handleToggleFavorite}
      isFavorite={isFavorite(recipe.id)}
    />
  );

  return (
    <>
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

              <button
                onClick={handleFavoritesToggle}
                className={`${styles.favoritesButton} ${showFavoritesOnly ? styles.active : ''}`}
              >
                My Favorites ({favorites.length})
              </button>
            </div>
          </div>

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
                  🍽️ Explore Recipes
                </button>
              </div>
            </div>
          ) : (
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