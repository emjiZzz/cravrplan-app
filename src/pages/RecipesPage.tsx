
// src/pages/RecipesPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse } from '../types/recipeTypes';
import { searchRecipes, getFilterOptions, getRecipeDetails } from '../services/apiService';
import { useFavorites } from '../context/FavoritesContext';
import styles from './RecipesPage.module.css';

// Import enhanced loading components
import RecipeCard from '../components/RecipeCard';
import {
  ProgressiveLoading,
  Toast
} from '../components/LoadingStates';

// Enhanced favorites storage interface
interface FavoriteRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: any;
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
  extendedIngredients: any[];
  summary?: string;
  // Store timestamp for potential cleanup
  addedAt: number;
}

const RecipesPage: React.FC = () => {
  const { favorites, favoriteRecipes, toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('All Menus');
  const [selectedDiet, setSelectedDiet] = useState('No Diet Restrictions');
  const [selectedMealType, setSelectedMealType] = useState('All Meal Types');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
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



  // Enhanced search suggestions with more comprehensive data
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

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Function to load favorite recipes with fallback to stored data
  const loadFavoriteRecipes = async (favoriteIds: number[]): Promise<Recipe[]> => {
    const loadedRecipes: Recipe[] = [];

    for (const favoriteId of favoriteIds) {
      try {
        // First try to get from stored favorite recipes
        const storedRecipe = favoriteRecipes.find(recipe => recipe.id === favoriteId);
        if (storedRecipe) {
          // Convert FavoriteRecipe to Recipe format
          const recipe: Recipe = {
            id: storedRecipe.id,
            title: storedRecipe.title,
            image: storedRecipe.image,
            imageType: storedRecipe.imageType,
            readyInMinutes: storedRecipe.readyInMinutes,
            servings: storedRecipe.servings,
            nutrition: storedRecipe.nutrition,
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
            extendedIngredients: storedRecipe.extendedIngredients,
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
          console.log(`✅ Loaded favorite recipe ${favoriteId} from stored data`);
          continue;
        }

        // If not in stored data, try to fetch from API
        const recipeDetail = await getRecipeDetails(favoriteId);
        loadedRecipes.push(recipeDetail);
        console.log(`✅ Loaded favorite recipe ${favoriteId} from API`);
      } catch (err) {
        console.error(`❌ Error loading favorite recipe ${favoriteId}:`, err);
        // Continue loading other recipes even if one fails
      }
    }

    return loadedRecipes;
  };

  // Search recipes when filters change or page changes
  useEffect(() => {
    const searchRecipesWithFilters = async () => {
      setError(null);
      setLoading(true);
      setIsSearching(true);

      try {
        // Filter favorites if showFavoritesOnly is true
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
            number: 20, // 20 recipes per page
            offset: currentPage * 20
          };

          // Add search query if provided
          if (debouncedSearchQuery.trim()) {
            searchParams.query = debouncedSearchQuery.trim();
          }

          // Add diet filter if selected
          if (selectedDiet !== 'No Diet Restrictions') {
            searchParams.diet = selectedDiet;
          }

          // Add cuisine filter if selected (convert menu to cuisine)
          if (selectedMenu !== 'All Menus') {
            searchParams.cuisine = selectedMenu;
          }

          // Add meal type filter if selected
          if (selectedMealType !== 'All Meal Types') {
            searchParams.type = selectedMealType;
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
        setLoading(false);
        setIsSearching(false);
      }
    };

    searchRecipesWithFilters();
  }, [debouncedSearchQuery, selectedMenu, selectedDiet, selectedMealType, showFavoritesOnly, currentPage, favorites]);



  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMenu(e.target.value);
    setCurrentPage(0);
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiet(e.target.value);
    setCurrentPage(0);
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealType(e.target.value);
    setCurrentPage(0);
  };



  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedMenu('All Menus');
    setSelectedDiet('No Diet Restrictions');
    setSelectedMealType('All Meal Types');
    setCurrentPage(0);
  };

  const handleToggleFavorite = (recipeId: number, isCurrentlyFavorite: boolean) => {
    if (isCurrentlyFavorite) {
      toggleFavorite(recipeId);
      setToastMessage('Removed from favorites');
      setToastType('info');
    } else {
      // Find the recipe in current recipes and add to favorites
      const recipeToAdd = recipes.find(recipe => recipe.id === recipeId);
      if (recipeToAdd) {
        const favoriteRecipe: FavoriteRecipe = {
          id: recipeToAdd.id,
          title: recipeToAdd.title,
          image: recipeToAdd.image,
          imageType: recipeToAdd.imageType,
          readyInMinutes: recipeToAdd.readyInMinutes,
          servings: recipeToAdd.servings,
          nutrition: recipeToAdd.nutrition,
          cuisines: recipeToAdd.cuisines,
          dishTypes: recipeToAdd.dishTypes,
          diets: recipeToAdd.diets,
          aggregateLikes: recipeToAdd.aggregateLikes,
          healthScore: recipeToAdd.healthScore,
          spoonacularScore: recipeToAdd.spoonacularScore,
          pricePerServing: recipeToAdd.pricePerServing,
          cheap: recipeToAdd.cheap,
          dairyFree: recipeToAdd.dairyFree,
          glutenFree: recipeToAdd.glutenFree,
          ketogenic: recipeToAdd.ketogenic,
          lowFodmap: recipeToAdd.lowFodmap,
          sustainable: recipeToAdd.sustainable,
          vegan: recipeToAdd.vegan,
          vegetarian: recipeToAdd.vegetarian,
          veryHealthy: recipeToAdd.veryHealthy,
          veryPopular: recipeToAdd.veryPopular,
          whole30: recipeToAdd.whole30,
          weightWatcherSmartPoints: recipeToAdd.weightWatcherSmartPoints,
          occasions: recipeToAdd.occasions,
          extendedIngredients: recipeToAdd.extendedIngredients,
          summary: recipeToAdd.summary,
          addedAt: Date.now()
        };
        toggleFavorite(recipeId, favoriteRecipe);
      } else {
        toggleFavorite(recipeId);
      }
      setToastMessage('Added to favorites');
      setToastType('success');
    }
    setShowToast(true);
  };

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(0);
  };

  // Enhanced search suggestions with better matching
  const getSearchSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();

    // First, find exact matches
    const exactMatches = popularSearches.filter(search =>
      search.toLowerCase() === queryLower
    );

    // Then, find starts with matches
    const startsWithMatches = popularSearches.filter(search =>
      search.toLowerCase().startsWith(queryLower) && search.toLowerCase() !== queryLower
    );

    // Finally, find contains matches
    const containsMatches = popularSearches.filter(search =>
      search.toLowerCase().includes(queryLower) &&
      !search.toLowerCase().startsWith(queryLower) &&
      search.toLowerCase() !== queryLower
    );

    // Combine and limit results
    const suggestions = [...exactMatches, ...startsWithMatches, ...containsMatches];
    return suggestions.slice(0, 8); // Show up to 8 suggestions
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
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      // The search will be triggered by the debounced search query
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentPage(0);
    // This will trigger the useEffect to retry the search
  };

  // Debug function - you can call this in the browser console
  const debugFavorites = () => {
    console.log('=== DEBUG FAVORITES ===');
    console.log('Current favorites state:', favorites);
    console.log('localStorage raw:', localStorage.getItem('recipeFavorites'));
    console.log('localStorage parsed:', JSON.parse(localStorage.getItem('recipeFavorites') || 'null'));
    console.log('Component mounted at:', new Date().toISOString());
  };

  // Expose debug function to window for console access
  React.useEffect(() => {
    (window as any).debugFavorites = debugFavorites;
    return () => {
      delete (window as any).debugFavorites;
    };
  }, [favorites]);

  const renderRecipeCard = (recipe: Recipe) => (
    <RecipeCard
      key={recipe.id}
      recipe={{
        ...recipe,
        nutrition: recipe.nutrition
          ? {
            calories: (recipe.nutrition as any).calories ?? 0,
            protein: (recipe.nutrition as any).protein ?? 0,
            carbs: (recipe.nutrition as any).carbs ?? 0,
            fat: (recipe.nutrition as any).fat ?? 0,
          }
          : undefined,
      }}
      onFavoriteToggle={handleToggleFavorite}
      isFavorite={isFavorite(recipe.id)}
    />
  );

  return (
    <>
      {/* Toast Notification */}
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
          {/* Enhanced Search Bar */}
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

          {/* Filter Dropdowns */}
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

              <button
                onClick={handleFavoritesToggle}
                className={`${styles.favoritesButton} ${showFavoritesOnly ? styles.active : ''}`}
              >
                My Favorites ({favorites.length})
              </button>
            </div>
          </div>

          {/* Enhanced Progressive Loading */}
          {!loading && !error && showFavoritesOnly && recipes.length === 0 ? (
            // Custom empty state for favorites
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
                <button
                  onClick={handleClearFilters}
                  className={styles.exploreRecipesButton}
                >
                  🧹 Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <ProgressiveLoading
              items={recipes}
              renderItem={renderRecipeCard}
              loading={loading}
              error={error}
              onRetry={handleRetry}
              skeletonCount={6}
              skeletonVariant="recipe"
              onClearFilters={handleClearFilters}
            />
          )}

          {/* Pagination */}
          {!loading && !error && recipes.length > 0 && (
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