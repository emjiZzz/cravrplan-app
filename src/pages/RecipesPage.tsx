// src/pages/RecipesPage.tsx

import React, { useState, useEffect } from 'react';
import type { Recipe, RecipeSearchParams, FilterOptionsResponse } from '../types/recipeTypes';
import { searchRecipes, getFilterOptions } from '../services/apiService';
import styles from './RecipesPage.module.css';

import { useNavigate } from 'react-router-dom'; // Import useNavigate


const RecipesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('All Menus');
  const [selectedDiet, setSelectedDiet] = useState('No Diet Restrictions');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate hook

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
          number: 15, // 3 columns × 5 rows = 15 recipes per page
          offset: currentPage * 15
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

        setRecipes(response.results);
        setTotalResults(response.totalResults);

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
  }, [searchQuery, selectedMenu, selectedDiet, currentPage]);

  const handleRecipeClick = (recipeId: number) => {
    // Navigate to recipe detail page using React Router's navigate function
    navigate(`/recipes/${recipeId}`);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMenu(e.target.value);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiet(e.target.value);
    setCurrentPage(0); // Reset to first page when changing filters
  };

  return (
    <div className={styles.recipesPageContainer}>
      <div className={styles.contentWrapper}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search recipes"
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className={styles.filters}>
          <select
            className={styles.filterDropdown}
            value={selectedMenu}
            onChange={handleMenuChange}
          >
            <option value="All Menus">All Menus</option>
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
            <option value="No Diet Restrictions">No Diet Restrictions</option>
            {filterOptions?.diets.map((diet) => (
              <option key={diet.value} value={diet.value}>
                {diet.name}
              </option>
            ))}
          </select>
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
                    src={recipe.image || '/placeholder.png'}
                    alt={recipe.title}
                    onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                  />
                  <div className={styles.recipeOverlay}>
                    <div className={styles.recipeStats}>
                      <span className={styles.readyTime}>{recipe.readyInMinutes} min</span>
                      <span className={styles.servings}>{recipe.servings} servings</span>
                    </div>
                  </div>
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
            <p>No recipes found. Try adjusting your search criteria.</p>
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
                {Math.ceil(totalResults / 15)} pages
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