
// src/pages/RecipesPage.tsx

import React, { useState, useEffect } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse } from '../types/recipeTypes';
import { searchRecipes, getFilterOptions } from '../services/apiService';
import styles from './RecipesPage.module.css';

import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation


const RecipesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('All Menus');
  const [selectedDiet, setSelectedDiet] = useState('No Diet Restrictions');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      setError(null);

      try {
        const searchParams: RecipeSearchParams = {
          number: 12, // 12 recipes per page
          offset: currentPage * 12
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
    const timeoutId = setTimeout(searchRecipesWithFilters, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedMenu, selectedDiet, currentPage, searchQuery, showFavoritesOnly]);

  const handleRecipeClick = (recipeId: number) => {
    // Preserve swap state if present when moving into detail
    const state = (location.state as any) || undefined;
    navigate(`/recipes/${recipeId}`, { state });
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

  const toggleFavorite = (recipeId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent recipe card click
    setFavorites(prev => {
      if (prev.includes(recipeId)) {
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

            <button
              onClick={handleFavoritesToggle}
              className={`${styles.favoritesButton} ${showFavoritesOnly ? styles.active : ''}`}
            >
              ❤️ My Favorites ({favorites.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Searching recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && !error && (
          <div className={styles.recipesGrid}>
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className={styles.recipeCard}
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <div className={styles.recipeImage}>
                  <img
                    src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwTDIwMCAxMDBMMzAwIDE1MEwyMDAgMjAwTDEwMCAxNTBaIiBmaWxsPSIjRENEQ0RDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                    alt={recipe.title}
                    onError={e => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwTDIwMCAxMDBMMzAwIDE1MEwyMDAgMjAwTDEwMCAxNTBaIiBmaWxsPSIjRENEQ0RDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K'; }}
                  />
                  <div className={styles.recipeOverlay}>
                    <div className={styles.recipeStats}>
                      <span className={styles.readyTime}>{recipe.readyInMinutes} min</span>
                      <span className={styles.servings}>{recipe.servings} servings</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className={`${styles.favoriteButton} ${favorites.includes(recipe.id) ? styles.favorited : ''}`}
                    aria-label={favorites.includes(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.includes(recipe.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className={styles.recipeContent}>
                  <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                  <p className={styles.recipeDescription}>
                    {recipe.summary ?
                      recipe.summary.replace(/<[^>]*>/g, '').substring(0, 120) + '...' :
                      'A delicious recipe to try!'
                    }
                  </p>
                  <div className={styles.recipeTags}>
                    {recipe.diets.slice(0, 2).map((diet) => (
                      <span key={diet} className={styles.recipeTag}>
                        {diet}
                      </span>
                    ))}
                    {recipe.veryHealthy && (
                      <span className={`${styles.recipeTag} ${styles.healthyTag}`}>
                        Healthy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && recipes.length === 0 && (
          <div className={styles.noResults}>
            <p>No recipes to display. You haven't added any favorites or your search returned no results.</p>
          </div>
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
                {Math.ceil(totalResults / 12)} pages
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