
// src/pages/RecipesPage.tsx

import React, { useState, useEffect } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse } from '../types/recipeTypes';
import { searchRecipes, getFilterOptions } from '../services/apiService';
import styles from './RecipesPage.module.css';

import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation

// Import new components
import RecipeCard from '../components/RecipeCard';
import { ErrorMessage, EmptyState, SearchLoading } from '../components/LoadingStates';

const RecipesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('All Menus');
  const [selectedDiet, setSelectedDiet] = useState('No Diet Restrictions');
  const [selectedMealType, setSelectedMealType] = useState('All Meal Types');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate hook
  const location = useLocation(); // Initialize useLocation hook

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipeFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Get search query from URL
  const getSearchQueryFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('search') || '';
  };

  // Initialize search query from URL on component mount
  useEffect(() => {
    const urlSearchQuery = getSearchQueryFromURL();
    setSearchQuery(urlSearchQuery);
  }, [location.search]);

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  // Search recipes when filters change or page changes
  useEffect(() => {
    const searchRecipesWithFilters = async () => {
      setError(null);
      setLoading(true);

      try {
        const searchParams: RecipeSearchParams = {
          number: 20, // 20 recipes per page
          offset: currentPage * 20
        };

        // Add search query if provided
        if (searchQuery.trim()) {
          searchParams.query = searchQuery.trim();
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
          searchParams.type = selectedMealType.toLowerCase();
        }

        const response = await searchRecipes(searchParams);

        let filteredRecipes = response.results;

        // Filter by favorites if showFavoritesOnly is true
        if (showFavoritesOnly) {
          filteredRecipes = response.results.filter(recipe => favorites.includes(recipe.id));
        }

        setRecipes(filteredRecipes);
        setTotalResults(showFavoritesOnly ? filteredRecipes.length : response.totalResults);

        // Update pagination state
        const hasNext = response.offset + response.number < response.totalResults;
        const hasPrev = currentPage > 0;

        setHasNextPage(hasNext);
        setHasPreviousPage(hasPrev);
      } catch (err) {
        setError('Failed to load recipes. Please try again.');
        console.error('Error searching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchRecipesWithFilters, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedMenu, selectedDiet, selectedMealType, currentPage, searchQuery, showFavoritesOnly, favorites]);

  const handleRecipeClick = (recipeId: number) => {
    // Preserve swap state if present when moving into detail
    const state = (location.state as any) || undefined;

    // Preserve selectedDate from URL if present
    const urlParams = new URLSearchParams(location.search);
    const selectedDate = urlParams.get('selectedDate');

    // Build the navigation URL with selectedDate if it exists
    let navigateUrl = `/recipes/${recipeId}`;
    if (selectedDate) {
      navigateUrl += `?selectedDate=${selectedDate}`;
    }

    navigate(navigateUrl, { state });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMenu(e.target.value);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiet(e.target.value);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page when searching
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('search', searchQuery);
    navigate(`${location.pathname}?${urlParams.toString()}`);
  };

  const toggleFavorite = (recipeId: number, isFavorite: boolean) => {
    setFavorites(prev => {
      if (isFavorite) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setCurrentPage(0); // Reset to first page when changing filters
  };



  return (
    <div className={styles.recipesPageContainer}>
      <div className={styles.contentWrapper}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className={styles.searchInput}
          />
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
              onChange={(e) => setSelectedMealType(e.target.value)}
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
              ❤️ My Favorites ({favorites.length})
            </button>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <SearchLoading query={searchQuery || 'recipes'} />
          </div>
        )}

        {/* Enhanced Error State */}
        {error && (
          <ErrorMessage 
            title="Failed to load recipes"
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Enhanced Recipes Grid */}
        {!loading && !error && recipes.length > 0 && (
          <div className={styles.recipesGrid}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavoriteToggle={toggleFavorite}
                isFavorite={favorites.includes(recipe.id)}
              />
            ))}
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && !error && recipes.length === 0 && (
          <EmptyState
            icon="🍽️"
            title="No recipes found"
            message={showFavoritesOnly 
              ? "You haven't added any favorites yet. Start exploring recipes to build your collection!"
              : "No recipes match your current search criteria. Try adjusting your filters or search terms."
            }
            actionText="Explore Recipes"
            onAction={() => {
              setSearchQuery('');
              setSelectedMenu('All Menus');
              setSelectedDiet('No Diet Restrictions');
              setSelectedMealType('All Meal Types');
              setShowFavoritesOnly(false);
            }}
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
  );
};

export default RecipesPage;