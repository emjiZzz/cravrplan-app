// API Service - Handles all communication with the Spoonacular recipe API
// This service manages recipe searches, details, and API error handling
// It includes rate limiting, retry logic, and fallback to mock data when API fails

// Import types for recipe data and API responses
import type {
  Recipe,
  RecipeSearchParams,
  RecipeSearchResponse,
  RecipeDetailResponse,
  FilterOptionsResponse
} from '../types/recipeTypes';
import { mockRecipes } from './mockData';

// API Configuration - Base URL and API key from environment variables
// These values tell the service where to find the recipe API and how to authenticate
const API_BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'your-api-key-here';

// Configuration settings for the API service
// These control how the service behaves when making API calls
const CONFIG = {
  LOG_API_ERRORS: import.meta.env.DEV, // Only log errors in development mode
  USE_MOCK_DATA_FALLBACK: true, // Always use mock data when API fails
  RATE_LIMIT_DELAY: 1000, // Wait 1 second between requests to be respectful to the API
  MAX_RETRIES: 3, // Maximum number of retry attempts for failed requests
  REQUEST_TIMEOUT: 10000, // 10 seconds timeout for requests
  CACHE_DURATION: 5 * 60 * 1000, // Cache data for 5 minutes (300,000 ms)
  CACHE_MAX_SIZE: 100, // Maximum number of cached items to prevent memory issues
};

/**
 * Custom error class for API-related errors
 * This helps distinguish between different types of errors and provides useful information
 */
export class RecipeApiError extends Error {
  public code: string;        // Error code (e.g., 'AUTH_ERROR', 'RATE_LIMIT_ERROR')
  public retryable: boolean;  // Whether this error can be retried
  public details?: unknown;   // Additional error details

  constructor(message: string, code: string, retryable: boolean = false, details?: unknown) {
    super(message);
    this.name = 'RecipeApiError';
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

/**
 * Helper function to convert parameters object to URL query string
 * @param params - Object containing search parameters
 * @returns URL-encoded query string
 * 
 * This function takes an object of search parameters and converts it into
 * a query string that can be added to a URL for API requests.
 */
const buildQueryParams = (params: Record<string, string | number | boolean | string[]>): string => {
  const searchParams = new URLSearchParams();

  // Loop through each parameter and add it to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // If the value is an array, join it with commas
        searchParams.append(key, value.join(','));
      } else {
        // If the value is a single item, convert it to string
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Cache interface for storing API responses
// This helps us avoid making the same API calls repeatedly
interface CacheItem {
  data: any;           // The actual response data
  timestamp: number;   // When this data was cached
  expiresAt: number;   // When this cache item expires
}

// Main API Service Class - Handles all recipe-related API calls
// This class manages the communication with the Spoonacular API
class RecipeApiService {
  private requestCount: number = 0;      // Track number of requests made
  private lastRequestTime: number = 0;   // Track when the last request was made
  private cache: Map<string, CacheItem> = new Map(); // Cache for storing API responses
  private isApiBlocked: boolean = false; // Track if API is blocked due to 402 errors
  private apiBlockedUntil: number = 0;   // When the API block expires

  constructor() {
    if (CONFIG.LOG_API_ERRORS) {
      console.log('API Service initialized with caching enabled');
    }
  }

  /**
   * Generate a cache key from URL and parameters
   * This creates a unique identifier for each API request
   * @param url - The API endpoint URL
   * @param params - Request parameters
   * @returns A unique cache key string
   */
  private generateCacheKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  /**
   * Get data from cache if it exists and hasn't expired
   * This prevents unnecessary API calls by reusing cached data
   * @param cacheKey - The unique key for the cached data
   * @returns Cached data if available and valid, null otherwise
   */
  private getFromCache(cacheKey: string): any | null {
    const cachedItem = this.cache.get(cacheKey);

    if (!cachedItem) {
      return null; // No cached data
    }

    const now = Date.now();

    // Check if cache has expired
    if (now > cachedItem.expiresAt) {
      this.cache.delete(cacheKey); // Remove expired cache
      if (CONFIG.LOG_API_ERRORS) {
        console.log('Cache expired for key:', cacheKey);
      }
      return null;
    }

    if (CONFIG.LOG_API_ERRORS) {
      console.log('Using cached data for key:', cacheKey);
    }
    return cachedItem.data;
  }

  /**
   * Store data in cache with expiration time
   * This saves API responses so we can reuse them later
   * @param cacheKey - The unique key for the data
   * @param data - The data to cache
   */
  private setCache(cacheKey: string, data: any): void {
    const now = Date.now();
    const expiresAt = now + CONFIG.CACHE_DURATION;

    // If cache is getting too large, remove oldest items
    if (this.cache.size >= CONFIG.CACHE_MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt
    });

    if (CONFIG.LOG_API_ERRORS) {
      console.log('Cached data for key:', cacheKey, 'expires at:', new Date(expiresAt));
    }
  }

  /**
   * Check if API is currently blocked due to 402 errors
   * This prevents making API calls when we know they will fail
   * @returns True if API is blocked, false otherwise
   */
  private isApiCurrentlyBlocked(): boolean {
    if (!this.isApiBlocked) {
      return false;
    }

    const now = Date.now();
    if (now >= this.apiBlockedUntil) {
      // Block period has expired, unblock the API
      this.isApiBlocked = false;
      this.apiBlockedUntil = 0;
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API block period expired, API is now available');
      }
      return false;
    }

    if (CONFIG.LOG_API_ERRORS) {
      const remainingTime = Math.ceil((this.apiBlockedUntil - now) / 1000);
      console.log(`API is blocked for ${remainingTime} more seconds due to 402 errors`);
    }
    return true;
  }

  /**
   * Block API calls for a specified duration after 402 error
   * This prevents wasting API quota on calls that will fail
   * @param durationMs - How long to block API calls in milliseconds
   */
  private blockApi(durationMs: number = 5 * 60 * 1000): void {
    this.isApiBlocked = true;
    this.apiBlockedUntil = Date.now() + durationMs;

    if (CONFIG.LOG_API_ERRORS) {
      console.log(`API blocked for ${durationMs / 1000} seconds due to 402 error`);
    }
  }

  /**
   * Rate limiting function to prevent too many API calls
   * This ensures we don't exceed the API's rate limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // If we've made 10 requests in the last minute, wait
    // This prevents hitting the API's rate limits
    if (this.requestCount >= 10 && timeSinceLastRequest < 60000) {
      const waitTime = 60000 - timeSinceLastRequest;
      console.warn(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    // Reset counter if more than a minute has passed
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }

    this.requestCount++;
    this.lastRequestTime = now;
  }

  /**
   * Main function to make HTTP requests with error handling and retry logic
   * @param url - The URL to make the request to
   * @param options - Request options (method, headers, body, etc.)
   * @param retryCount - Current retry attempt number
   * @returns The response data
   * 
   * This function handles all HTTP requests to the API. It includes:
   * - Rate limiting to prevent too many requests
   * - Timeout handling to prevent hanging requests
   * - Error handling for different HTTP status codes
   * - Retry logic for certain types of errors
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}, retryCount: number = 0): Promise<T> {
    try {
      // Add delay between requests to respect rate limits
      if (this.lastRequestTime > 0) {
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest));
        }
      }

      // Set up timeout for the request
      // This prevents requests from hanging indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      // Make the actual HTTP request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Handle different HTTP error status codes
      // Each status code gets a specific error message and handling
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new RecipeApiError(
            'Invalid API key. Please check your configuration.',
            'AUTH_ERROR',
            false,
            errorData
          );
        } else if (response.status === 402) {
          // 402 Payment Required - API quota exceeded or payment required
          // Block API calls for 5 minutes to prevent wasting quota
          this.blockApi(5 * 60 * 1000); // Block for 5 minutes
          throw new RecipeApiError(
            'API quota exceeded. Please try again later or upgrade your plan.',
            'QUOTA_EXCEEDED_ERROR',
            false,
            errorData
          );
        } else if (response.status === 429) {
          throw new RecipeApiError(
            'API rate limit exceeded. Please try again later.',
            'RATE_LIMIT_ERROR',
            true,
            errorData
          );
        } else if (response.status >= 500) {
          throw new RecipeApiError(
            'Server error. Please try again later.',
            'SERVER_ERROR',
            true,
            errorData
          );
        } else {
          throw new RecipeApiError(
            `API request failed: ${response.status} ${response.statusText}`,
            'REQUEST_ERROR',
            false,
            errorData
          );
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof RecipeApiError) {
        throw error;
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RecipeApiError(
          'Request timeout. Please try again.',
          'TIMEOUT_ERROR',
          true
        );
      }

      // Retry logic for certain types of errors
      // This automatically retries requests that might succeed on a second attempt
      if (retryCount < CONFIG.MAX_RETRIES && this.isRetryableError(error as { code?: string; name?: string })) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(url, options, retryCount + 1);
      }

      throw new RecipeApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        false,
        error
      );
    }
  }

  /**
   * Check if an error is retryable
   * @param error - The error to check
   * @returns True if the error can be retried, false otherwise
   * 
   * This function determines whether a failed request should be retried.
   * Some errors (like rate limits or server errors) can be retried,
   * while others (like authentication errors) cannot.
   */
  private isRetryableError(error: { code?: string; name?: string }): boolean {
    return error.code === 'RATE_LIMIT_ERROR' ||
      error.code === 'SERVER_ERROR' ||
      error.code === 'TIMEOUT_ERROR' ||
      error.name === 'AbortError';
  }

  /**
   * Search for recipes using the API with fallback to mock data
   * @param params - Search parameters (query, cuisine, diet, etc.)
   * @returns Search results with recipes and metadata
   * 
   * This is the main function for searching recipes. It first checks the cache,
   * then tries the API if not cached, and falls back to mock data if API fails.
   * This reduces API calls and costs by reusing cached data.
   */
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    const mockResult = this.getMockSearchResults(params);

    // Generate cache key for this search
    const cacheKey = this.generateCacheKey('/complexSearch', params);

    // Check if we have cached data first
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData; // Return cached data instead of making API call
    }

    // Check if API is blocked due to 402 errors
    if (this.isApiCurrentlyBlocked()) {
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API is blocked due to 402 errors, using mock data');
      }
      return {
        results: mockResult.results,
        offset: mockResult.offset,
        number: mockResult.number,
        totalResults: mockResult.totalResults
      };
    }

    try {
      await this.checkRateLimit();

      // Build query parameters for the API request
      const queryParams = buildQueryParams({
        ...params,
        apiKey: API_KEY,
        addRecipeInformation: true,
        fillIngredients: true,
        number: params.number || 20
      });

      // Make API request
      const apiResult = await this.makeRequest<RecipeSearchResponse>(`${API_BASE_URL}/complexSearch?${queryParams}`);

      // Cache the successful API response
      this.setCache(cacheKey, apiResult);

      return apiResult;
    } catch (error) {
      // If API fails, use mock data
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API call failed, using mock data:', error);
      }
      return {
        results: mockResult.results,
        offset: mockResult.offset,
        number: mockResult.number,
        totalResults: mockResult.totalResults
      };
    }
  }

  /**
   * Search for recipes by ingredients with API fallback
   * @param ingredients - Array of ingredient names to search for
   * @param maxMissingIngredients - Maximum number of missing ingredients allowed
   * @returns Array of recipes that can be made with the given ingredients
   * 
   * This function finds recipes that can be made with the ingredients the user has.
   * It first checks the cache, then tries the API, and falls back to mock data.
   * Caching helps reduce API calls for the same ingredient combinations.
   */
  async searchRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Promise<Recipe[]> {
    const mockResults = this.getMockRecipesByIngredients(ingredients, maxMissingIngredients);

    // Generate cache key for this ingredient search
    const cacheKey = this.generateCacheKey('/findByIngredients', { ingredients, maxMissingIngredients });

    // Check if we have cached data first
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData; // Return cached data instead of making API call
    }

    // Check if API is blocked due to 402 errors
    if (this.isApiCurrentlyBlocked()) {
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API is blocked due to 402 errors, using mock data for ingredient search');
      }
      return mockResults;
    }

    try {
      await this.checkRateLimit();

      // Build query parameters for ingredient search
      const ingredientParams = buildQueryParams({
        ingredients: ingredients.join(','),
        ranking: 2,
        ignorePantry: true,
        number: 20,
        apiKey: API_KEY,
        addRecipeInformation: true,
        fillIngredients: true
      });

      const result = await this.makeRequest<{ results: Recipe[] }>(`${API_BASE_URL}/findByIngredients?${ingredientParams}`);

      // Cache the successful API response
      this.setCache(cacheKey, result.results || []);

      return result.results || [];
    } catch (error) {
      // If API fails, use mock data
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API call failed, using mock data:', error);
      }
      return mockResults;
    }
  }

  /**
   * Get detailed information about a specific recipe
   * @param recipeId - The unique ID of the recipe
   * @returns Detailed recipe information including nutrition and instructions
   * 
   * This function gets comprehensive information about a specific recipe.
   * It first checks the cache, then tries the API, and falls back to mock data.
   * Caching recipe details helps reduce API calls for the same recipes.
   */
  async getRecipeDetails(recipeId: number): Promise<RecipeDetailResponse> {
    // Generate cache key for this recipe detail request
    const cacheKey = this.generateCacheKey(`/${recipeId}/information`, { recipeId });

    // Check if we have cached data first
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      return cachedData; // Return cached data instead of making API call
    }

    // Check if API is blocked due to 402 errors
    if (this.isApiCurrentlyBlocked()) {
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API is blocked due to 402 errors, using mock data for recipe details');
      }
      return this.getMockRecipeDetails(recipeId);
    }

    try {
      await this.checkRateLimit();

      const detailParams = buildQueryParams({ apiKey: API_KEY });
      const result = await this.makeRequest<RecipeDetailResponse>(`${API_BASE_URL}/${recipeId}/information?${detailParams}`);

      // Cache the successful API response
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      // If API fails, use mock data
      if (CONFIG.LOG_API_ERRORS) {
        console.log('API call failed, using mock data:', error);
      }
      return this.getMockRecipeDetails(recipeId);
    }
  }

  /**
   * Get available filter options (uses mock data since API doesn't provide this)
   * @returns Object containing all available filter options
   * 
   * This function returns all the available options for filtering recipes.
   * Since the API doesn't provide this data, we use predefined mock options.
   */
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return this.getMockFilterOptions();
  }

  // ===== MOCK DATA METHODS FOR FALLBACK =====

  /**
   * Filter mock recipes based on search parameters
   * @param params - Search parameters to filter by
   * @returns Filtered recipe results using mock data
   * 
   * This function filters the local mock recipes based on the search parameters.
   * It's used as a fallback when the API is unavailable.
   */
  private getMockSearchResults(params: RecipeSearchParams): RecipeSearchResponse {
    let filteredRecipes = [...mockRecipes];

    // Filter by search query
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredRecipes = filteredRecipes.filter((recipe: any) =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.summary?.toLowerCase().includes(query) ||
        recipe.extendedIngredients.some((ingredient: any) =>
          ingredient.name.toLowerCase().includes(query)
        )
      );
    }

    // Filter by diet
    if (params.diet) {
      filteredRecipes = filteredRecipes.filter((recipe: any) =>
        recipe.diets.includes(params.diet!)
      );
    }

    // Filter by cuisine
    if (params.cuisine) {
      filteredRecipes = filteredRecipes.filter((recipe: any) =>
        recipe.cuisines.includes(params.cuisine!)
      );
    }

    // Filter by meal type
    if (params.type) {
      const mealType = params.type.toLowerCase();
      filteredRecipes = filteredRecipes.filter((recipe: any) => {
        if (recipe.dishTypes.some((dishType: any) =>
          dishType.toLowerCase().includes(mealType)
        )) {
          return true;
        }

        if (recipe.occasions.some((occasion: any) =>
          occasion.toLowerCase().includes(mealType)
        )) {
          return true;
        }

        const title = recipe.title.toLowerCase();
        if (mealType === 'breakfast' && title.includes('breakfast')) return true;
        if (mealType === 'lunch' && title.includes('lunch')) return true;
        if (mealType === 'dinner' && title.includes('dinner')) return true;
        if (mealType === 'snack' && title.includes('snack')) return true;
        if (mealType === 'dessert' && title.includes('dessert')) return true;
        if (mealType === 'appetizer' && title.includes('appetizer')) return true;

        return false;
      });
    }

    // Filter by cooking time
    if (params.maxReadyTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.readyInMinutes <= params.maxReadyTime!
      );
    }

    // Filter by food intolerances
    if (params.intolerances && params.intolerances.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const intolerances = params.intolerances!;
        return !intolerances.some(intolerance => {
          const lowerIntolerance = intolerance.toLowerCase();
          return (
            (lowerIntolerance.includes('dairy') && recipe.dairyFree === false) ||
            (lowerIntolerance.includes('gluten') && recipe.glutenFree === false) ||
            (lowerIntolerance.includes('vegan') && recipe.vegan === false) ||
            (lowerIntolerance.includes('vegetarian') && recipe.vegetarian === false)
          );
        });
      });
    }

    // Apply pagination
    const offset = params.offset || 0;
    const number = params.number || 20;
    const paginatedRecipes = filteredRecipes.slice(offset, offset + number);

    return {
      results: paginatedRecipes,
      offset: offset,
      number: number,
      totalResults: filteredRecipes.length
    };
  }

  /**
   * Get mock recipe details with nutrition information
   * @param recipeId - The unique ID of the recipe
   * @returns Detailed recipe information with mock nutrition data
   * 
   * This function provides detailed recipe information when the API is unavailable.
   * It includes mock nutrition data to make the recipe details look complete.
   */
  private getMockRecipeDetails(recipeId: number): RecipeDetailResponse {
    const recipe = mockRecipes.find(r => r.id === recipeId);
    if (!recipe) {
      throw new Error(`Recipe with id ${recipeId} not found`);
    }

    return {
      ...recipe,
      nutrition: {
        nutrients: [
          { name: "Calories", amount: 450, unit: "kcal", percentOfDailyNeeds: 22.5 },
          { name: "Protein", amount: 25, unit: "g", percentOfDailyNeeds: 50 },
          { name: "Fat", amount: 18, unit: "g", percentOfDailyNeeds: 27.7 },
          { name: "Carbohydrates", amount: 35, unit: "g", percentOfDailyNeeds: 11.7 },
          { name: "Fiber", amount: 8, unit: "g", percentOfDailyNeeds: 32 },
          { name: "Sugar", amount: 12, unit: "g", percentOfDailyNeeds: 13.3 },
          { name: "Sodium", amount: 680, unit: "mg", percentOfDailyNeeds: 28.3 },
          { name: "Potassium", amount: 420, unit: "mg", percentOfDailyNeeds: 8.9 },
          { name: "Vitamin C", amount: 15, unit: "mg", percentOfDailyNeeds: 16.7 },
          { name: "Iron", amount: 3.2, unit: "mg", percentOfDailyNeeds: 17.8 },
          { name: "Calcium", amount: 180, unit: "mg", percentOfDailyNeeds: 18 }
        ],
        properties: [
          { name: "Glycemic Index", amount: 45, unit: "" },
          { name: "Glycemic Load", amount: 8, unit: "" }
        ],
        flavonoids: [
          { name: "Quercetin", amount: 2.5, unit: "mg" },
          { name: "Kaempferol", amount: 1.2, unit: "mg" }
        ],
        ingredients: [
          {
            id: 1,
            name: "corn tortillas",
            amount: 2,
            unit: "pieces",
            nutrients: [
              { name: "Calories", amount: 120, unit: "kcal", percentOfDailyNeeds: 6 },
              { name: "Carbohydrates", amount: 24, unit: "g", percentOfDailyNeeds: 8 }
            ]
          }
        ],
        caloricBreakdown: {
          percentProtein: 22.2,
          percentFat: 36,
          percentCarbs: 31.1
        },
        weightPerServing: {
          amount: 250,
          unit: "g"
        }
      },
      winePairing: {
        pairedWines: ["Chardonnay", "Pinot Noir"],
        pairingText: "This dish pairs well with a light Chardonnay or a medium-bodied Pinot Noir.",
        productMatches: []
      },
      taste: {
        sweetness: 0.3,
        saltiness: 0.7,
        sourness: 0.2,
        bitterness: 0.1,
        savoriness: 0.8,
        fattiness: 0.6,
        spiciness: 0.4
      }
    };
  }

  /**
   * Get mock filter options for the recipe search
   * @returns Object containing all available filter options
   * 
   * This function returns predefined filter options that users can choose from
   * when searching for recipes. These options cover common dietary and cuisine preferences.
   */
  private getMockFilterOptions(): FilterOptionsResponse {
    return {
      cuisines: [
        { name: "American", value: "American" },
        { name: "Italian", value: "Italian" },
        { name: "Mexican", value: "Mexican" },
        { name: "Asian", value: "Asian" },
        { name: "Mediterranean", value: "Mediterranean" },
        { name: "Greek", value: "Greek" },
        { name: "French", value: "French" },
        { name: "Japanese", value: "Japanese" },
        { name: "Chinese", value: "Chinese" },
        { name: "Thai", value: "Thai" },
        { name: "Indian", value: "Indian" },
        { name: "Middle Eastern", value: "Middle Eastern" }
      ],
      diets: [
        { name: "Vegetarian", value: "Vegetarian" },
        { name: "Vegan", value: "Vegan" },
        { name: "Gluten-Free", value: "Gluten-Free" },
        { name: "Dairy-Free", value: "Dairy-Free" },
        { name: "Keto", value: "Keto" },
        { name: "Paleo", value: "Paleo" },
        { name: "Low-Carb", value: "Low-Carb" },
        { name: "High-Protein", value: "High-Protein" }
      ],
      intolerances: [
        { name: "Nuts", value: "Nuts" },
        { name: "Dairy", value: "Dairy" },
        { name: "Shellfish", value: "Shellfish" },
        { name: "Eggs", value: "Eggs" },
        { name: "Soy", value: "Soy" },
        { name: "Wheat", value: "Wheat" },
        { name: "Fish", value: "Fish" },
        { name: "Sesame", value: "Sesame" }
      ],
      mealTypes: [
        { name: "Main Course", value: "main course" },
        { name: "Breakfast", value: "breakfast" },
        { name: "Side Dish", value: "side dish" },
        { name: "Dessert", value: "dessert" },
        { name: "Snack", value: "snack" }
      ],
      timePreferences: [
        { name: "Quick (15-30 min)", value: "15-30" },
        { name: "Medium (30-60 min)", value: "30-60" },
        { name: "Long (60+ min)", value: "60+" }
      ]
    };
  }

  /**
   * Filter mock recipes by ingredients
   * @param ingredients - Array of ingredient names to search for
   * @param maxMissingIngredients - Maximum number of missing ingredients allowed
   * @returns Array of recipes that can be made with the given ingredients
   * 
   * This function finds recipes that can be made with the ingredients the user has.
   * It counts how many ingredients are missing and only returns recipes that
   * are missing fewer than maxMissingIngredients.
   */
  private getMockRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Recipe[] {

    console.log('APIService: getMockRecipesByIngredients called with:', ingredients, 'maxMissing:', maxMissingIngredients);
    console.log('APIService: Total mock recipes available:', mockRecipes.length);

    // Enhanced ingredient synonyms for better matching
    const ingredientSynonyms: { [key: string]: string[] } = {
      'tomato': ['tomatoes', 'cherry tomato', 'roma tomato', 'tomato'],
      'onion': ['onions', 'red onion', 'white onion', 'yellow onion', 'onion'],
      'garlic': ['garlic cloves', 'garlic powder', 'garlic'],
      'olive oil': ['extra virgin olive oil', 'evoo', 'olive oil'],
      'salt': ['sea salt', 'kosher salt', 'table salt', 'salt'],
      'pepper': ['black pepper', 'white pepper', 'ground pepper', 'pepper'],
      'chicken': ['chicken breast', 'chicken thigh', 'chicken meat', 'chicken'],
      'beef': ['ground beef', 'beef steak', 'beef meat', 'beef'],
      'rice': ['white rice', 'brown rice', 'jasmine rice', 'basmati rice', 'rice'],
      'pasta': ['spaghetti', 'penne', 'fettuccine', 'linguine', 'pasta'],
      'cheese': ['cheddar', 'mozzarella', 'parmesan', 'gouda', 'cheese'],
      'milk': ['whole milk', 'skim milk', 'almond milk', 'soy milk', 'milk'],
      'egg': ['eggs', 'large eggs', 'egg whites', 'egg'],
      'flour': ['all purpose flour', 'bread flour', 'cake flour', 'flour'],
      'sugar': ['white sugar', 'brown sugar', 'granulated sugar', 'sugar'],
      'butter': ['unsalted butter', 'salted butter', 'margarine', 'butter'],
      'lemon': ['lemons', 'lemon juice', 'lemon zest', 'lemon'],
      'lime': ['limes', 'lime juice', 'lime zest', 'lime'],
      'bell pepper': ['bell peppers', 'red pepper', 'green pepper', 'yellow pepper', 'bell pepper'],
      'carrot': ['carrots', 'baby carrots', 'carrot'],
      'potato': ['potatoes', 'russet potato', 'red potato', 'potato'],
      'spinach': ['baby spinach', 'fresh spinach', 'spinach'],
      'mushroom': ['mushrooms', 'button mushrooms', 'portobello', 'mushroom'],
      'basil': ['fresh basil', 'basil leaves', 'basil'],
      'oregano': ['dried oregano', 'fresh oregano', 'oregano'],
      'thyme': ['fresh thyme', 'dried thyme', 'thyme'],
      'rosemary': ['fresh rosemary', 'dried rosemary', 'rosemary'],
      'parsley': ['fresh parsley', 'dried parsley', 'parsley'],
      'cilantro': ['fresh cilantro', 'coriander', 'cilantro'],
      'ginger': ['fresh ginger', 'ginger powder', 'ginger root', 'ginger'],
      'cumin': ['ground cumin', 'cumin seeds', 'cumin'],
      'paprika': ['smoked paprika', 'sweet paprika', 'paprika'],
      'cinnamon': ['ground cinnamon', 'cinnamon stick', 'cinnamon'],
      'nutmeg': ['ground nutmeg', 'whole nutmeg', 'nutmeg'],
      'vanilla': ['vanilla extract', 'vanilla bean', 'vanilla'],
      'honey': ['raw honey', 'clover honey', 'honey'],
      'maple syrup': ['pure maple syrup', 'maple syrup'],
      'soy sauce': ['light soy sauce', 'dark soy sauce', 'tamari', 'soy sauce'],
      'vinegar': ['apple cider vinegar', 'balsamic vinegar', 'white vinegar', 'vinegar'],
      'mustard': ['dijon mustard', 'yellow mustard', 'whole grain mustard', 'mustard'],
      'mayonnaise': ['mayo', 'light mayonnaise', 'mayonnaise'],
      'ketchup': ['tomato ketchup', 'catsup', 'ketchup'],
      'hot sauce': ['sriracha', 'tabasco', 'chili sauce', 'hot sauce'],
      'worcestershire': ['worcestershire sauce'],
      'fish sauce': ['fish sauce'],
      'oyster sauce': ['oyster sauce'],
      'sesame oil': ['toasted sesame oil', 'sesame oil'],
      'coconut oil': ['virgin coconut oil', 'refined coconut oil', 'coconut oil'],
      'avocado': ['avocados', 'avocado oil', 'avocado'],
      // Add more common ingredient variations
      'berries': ['mixed berries', 'strawberries', 'blueberries', 'raspberries', 'blackberries', 'berries'],
      'yogurt': ['greek yogurt', 'plain yogurt', 'vanilla yogurt', 'yogurt'],
      'bread': ['whole grain bread', 'white bread', 'sourdough bread', 'bread'],
      'oat': ['oats', 'rolled oats', 'steel cut oats', 'oat'],
      'almond': ['almonds', 'almond milk', 'almond flour', 'almond'],
      'coconut': ['coconut milk', 'coconut oil', 'shredded coconut', 'coconut'],
      'chocolate': ['dark chocolate', 'milk chocolate', 'chocolate chips', 'chocolate'],
      'cream': ['heavy cream', 'whipping cream', 'sour cream', 'cream'],
      'sauce': ['tomato sauce', 'pasta sauce', 'marinara sauce', 'sauce'],
      'broth': ['chicken broth', 'beef broth', 'vegetable broth', 'broth'],
      'stock': ['chicken stock', 'beef stock', 'vegetable stock', 'stock']
    };

    // Helper function to check if ingredients match (including synonyms)
    const ingredientsMatch = (userIngredient: string, recipeIngredient: string): boolean => {
      const userLower = userIngredient.toLowerCase().trim();
      const recipeLower = recipeIngredient.toLowerCase().trim();

      // Direct match
      if (userLower === recipeLower) {
        return true;
      }

      // Check synonyms
      const synonyms = ingredientSynonyms[userLower];
      if (synonyms && synonyms.some(synonym => synonym.toLowerCase() === recipeLower)) {
        return true;
      }

      // Check if recipe ingredient contains user ingredient (for partial matches)
      if (recipeLower.includes(userLower) || userLower.includes(recipeLower)) {
        return true;
      }

      // Check if recipe ingredient contains user ingredient (for plural/singular)
      if (userLower.endsWith('s') && recipeLower === userLower.slice(0, -1)) {
        return true;
      }
      if (recipeLower.endsWith('s') && userLower === recipeLower.slice(0, -1)) {
        return true;
      }

      // Check for common word variations (e.g., "fresh", "dried", "ground")
      const commonPrefixes = ['fresh', 'dried', 'ground', 'whole', 'extra virgin', 'virgin', 'pure', 'organic'];
      const commonSuffixes = ['powder', 'extract', 'oil', 'milk', 'flour', 'sauce', 'broth', 'stock'];

      // Remove common prefixes and suffixes for comparison
      let cleanUser = userLower;
      let cleanRecipe = recipeLower;

      commonPrefixes.forEach(prefix => {
        if (cleanUser.startsWith(prefix + ' ')) cleanUser = cleanUser.substring(prefix.length + 1);
        if (cleanRecipe.startsWith(prefix + ' ')) cleanRecipe = cleanRecipe.substring(prefix.length + 1);
      });

      commonSuffixes.forEach(suffix => {
        if (cleanUser.endsWith(' ' + suffix)) cleanUser = cleanUser.substring(0, cleanUser.length - suffix.length - 1);
        if (cleanRecipe.endsWith(' ' + suffix)) cleanRecipe = cleanRecipe.substring(0, cleanRecipe.length - suffix.length - 1);
      });

      if (cleanUser === cleanRecipe) {
        return true;
      }

      // Check if cleaned versions contain each other
      if (cleanRecipe.includes(cleanUser) || cleanUser.includes(cleanRecipe)) {
        return true;
      }

      return false;
    };

    const results = mockRecipes.filter(recipe => {
      const recipeIngredients = recipe.extendedIngredients.map((ing: any) => ing.name.toLowerCase());
      console.log(`APIService: Recipe "${recipe.title}" has ingredients:`, recipeIngredients);

      // Count how many user ingredients match with recipe ingredients
      const matchedCount = ingredients.filter((userIng: string) => {
        const userLower = userIng.toLowerCase().trim();
        const hasMatch = recipeIngredients.some(recipeIng => {
          const match = ingredientsMatch(userLower, recipeIng);
          if (match) {
            console.log(`APIService: ✓ "${userLower}" matches "${recipeIng}" in recipe "${recipe.title}"`);
          }
          return match;
        });
        if (!hasMatch) {
          console.log(`APIService: ✗ "${userLower}" has no match in recipe "${recipe.title}"`);
        }
        return hasMatch;
      }).length;

      const missingCount = ingredients.length - matchedCount;
      console.log(`APIService: Recipe "${recipe.title}" matched: ${matchedCount}, missing: ${missingCount}, max allowed: ${maxMissingIngredients}`);

      const shouldInclude = missingCount <= maxMissingIngredients;
      console.log(`APIService: Recipe "${recipe.title}" included:`, shouldInclude);

      return shouldInclude;
    });

    console.log('APIService: Final results count:', results.length);
    return results;
  }
}

// Create and export a single instance of the API service
// This ensures we only have one API service throughout the app
export const recipeApiService = new RecipeApiService();

// Export individual functions for easy use in other parts of the app
// These functions provide a simple interface to the API service
export const searchRecipes = (params: RecipeSearchParams) => recipeApiService.searchRecipes(params);
export const getRecipeDetails = (recipeId: number) => recipeApiService.getRecipeDetails(recipeId);
export const getFilterOptions = () => recipeApiService.getFilterOptions();
export const searchRecipesByIngredients = (ingredients: string[], maxMissingIngredients: number = 3) => recipeApiService.searchRecipesByIngredients(ingredients, maxMissingIngredients);

