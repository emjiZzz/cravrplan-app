import React, { useState, useEffect } from 'react';
import { searchRecipes } from '../services/apiService';
import styles from './RecipeSearch.module.css';

import type { Recipe } from '../types/recipeTypes';

interface RecipeSearchProps {
  onSearchResults: (recipes: Recipe[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onSearchResults, onLoadingChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [maxReadyTime, setMaxReadyTime] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const cuisines = [
    'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean',
    'French', 'Indian', 'Thai', 'Japanese', 'Greek', 'Spanish'
  ];

  const diets = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Low-Carb', 'Keto', 'Paleo', 'Pescatarian'
  ];

  const readyTimes = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Perform search when filters change
  useEffect(() => {
    if (debouncedSearchTerm || cuisine || diet || maxReadyTime) {
      performSearch();
    }
  }, [debouncedSearchTerm, cuisine, diet, maxReadyTime]);

  const performSearch = async () => {
    onLoadingChange(true);
    try {
      const query = debouncedSearchTerm || 'pasta'; // Default search
      const params = {
        query,
        cuisine: cuisine || undefined,
        diet: diet || undefined,
        maxReadyTime: maxReadyTime ? parseInt(maxReadyTime, 10) : undefined,
        number: 20
      };
      const response = await searchRecipes(params);
      onSearchResults(response.results || []);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      onLoadingChange(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCuisine('');
    setDiet('');
    setMaxReadyTime('');
  };

  const hasActiveFilters = searchTerm || cuisine || diet || maxReadyTime;

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchHeader}>
        <h3>Find Your Perfect Recipe</h3>
        <p>Search and filter recipes to match your preferences</p>
      </div>

      <div className={styles.searchForm}>
        {/* Search Input */}
        <div className={styles.searchInputGroup}>
          <input
            type="text"
            placeholder="Search recipes (e.g., chicken pasta, vegetarian curry)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.searchIcon}>🔍</div>
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label>Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Cuisines</option>
              {cuisines.map(c => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Diet</label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Diets</option>
              {diets.map(d => (
                <option key={d} value={d.toLowerCase()}>{d}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Max Time</label>
            <select
              value={maxReadyTime}
              onChange={(e) => setMaxReadyTime(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Any Time</option>
              {readyTimes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={styles.clearFiltersButton}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Search Tips */}
      <div className={styles.searchTips}>
        <h4>💡 Search Tips:</h4>
        <ul>
          <li>Try ingredients like "chicken", "pasta", "tomatoes"</li>
          <li>Search by dish type: "soup", "salad", "dessert"</li>
          <li>Combine with filters for better results</li>
        </ul>
      </div>
    </div>
  );
};

export default RecipeSearch;
