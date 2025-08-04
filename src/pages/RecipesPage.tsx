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
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('All Meal Types');
  const [maxReadyTime, setMaxReadyTime] = useState<number | undefined>(undefined);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [minProtein, setMinProtein] = useState<number | undefined>(undefined);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

        // Add intolerances filter if selected
        if (selectedIntolerances.length > 0) {
          searchParams.intolerances = selectedIntolerances;
        }

        // Add max ready time filter if selected
        if (maxReadyTime && maxReadyTime > 0) {
          searchParams.maxReadyTime = maxReadyTime;
        }

        // Add max calories filter if selected
        if (maxCalories && maxCalories > 0) {
          searchParams.maxCalories = maxCalories;
        }

        // Add min protein filter if selected
        if (minProtein && minProtein > 0) {
          searchParams.minProtein = minProtein;
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
  }, [searchQuery, selectedMenu, selectedDiet, selectedIntolerances, selectedMealType, maxReadyTime, maxCalories, minProtein, currentPage]);

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

  const handleIntoleranceChange = (intolerance: string) => {
    setSelectedIntolerances(prev => {
      if (prev.includes(intolerance)) {
        return prev.filter(item => item !== intolerance);
      } else {
        return [...prev, intolerance];
      }
    });
    setCurrentPage(0);
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealType(e.target.value);
    setCurrentPage(0);
  };

  const handleMaxReadyTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMaxReadyTime(value === 'No Limit' ? undefined : parseInt(value));
    setCurrentPage(0);
  };

  const handleMaxCaloriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMaxCalories(value === 'No Limit' ? undefined : parseInt(value));
    setCurrentPage(0);
  };

  const handleMinProteinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMinProtein(value === 'No Minimum' ? undefined : parseInt(value));
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedMenu('All Menus');
    setSelectedDiet('No Diet Restrictions');
    setSelectedIntolerances([]);
    setSelectedMealType('All Meal Types');
    setMaxReadyTime(undefined);
    setMaxCalories(undefined);
    setMinProtein(undefined);
    setCurrentPage(0);
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
              className={styles.advancedFilterToggle}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>

            <button
              className={styles.clearFiltersButton}
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className={styles.advancedFilters}>
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Cooking Time</h4>
                <select
                  className={styles.filterDropdown}
                  value={maxReadyTime || 'No Limit'}
                  onChange={handleMaxReadyTimeChange}
                >
                  <option value="No Limit">No Time Limit</option>
                  <option value="15">15 minutes or less</option>
                  <option value="30">30 minutes or less</option>
                  <option value="45">45 minutes or less</option>
                  <option value="60">1 hour or less</option>
                  <option value="90">1.5 hours or less</option>
                  <option value="120">2 hours or less</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Calories</h4>
                <select
                  className={styles.filterDropdown}
                  value={maxCalories || 'No Limit'}
                  onChange={handleMaxCaloriesChange}
                >
                  <option value="No Limit">No Calorie Limit</option>
                  <option value="200">200 calories or less</option>
                  <option value="300">300 calories or less</option>
                  <option value="400">400 calories or less</option>
                  <option value="500">500 calories or less</option>
                  <option value="600">600 calories or less</option>
                  <option value="800">800 calories or less</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Protein</h4>
                <select
                  className={styles.filterDropdown}
                  value={minProtein || 'No Minimum'}
                  onChange={handleMinProteinChange}
                >
                  <option value="No Minimum">No Protein Minimum</option>
                  <option value="10">At least 10g protein</option>
                  <option value="15">At least 15g protein</option>
                  <option value="20">At least 20g protein</option>
                  <option value="25">At least 25g protein</option>
                  <option value="30">At least 30g protein</option>
                  <option value="40">At least 40g protein</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Food Intolerances</h4>
                <div className={styles.intoleranceTags}>
                  {filterOptions?.intolerances.map((intolerance) => (
                    <button
                      key={intolerance.value}
                      className={`${styles.intoleranceTag} ${selectedIntolerances.includes(intolerance.value) ? styles.selected : ''
                        }`}
                      onClick={() => handleIntoleranceChange(intolerance.value)}
                    >
                      {intolerance.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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