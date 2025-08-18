import type {
  Recipe,
  RecipeSearchParams,
  RecipeSearchResponse,
  RecipeDetailResponse,
  FilterOptionsResponse
} from '../types/recipeTypes';
import { mockRecipes } from './mockData';

// API Configuration
const API_BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'your-api-key-here';

// Configuration options
const CONFIG = {
  LOG_API_ERRORS: import.meta.env.DEV, // Only log errors in development
  USE_MOCK_DATA_FALLBACK: true, // Always fallback to mock data on API errors
  RATE_LIMIT_DELAY: 1000, // 1 second between requests
  MAX_RETRIES: 3, // Maximum retry attempts for failed requests
  REQUEST_TIMEOUT: 10000, // 10 seconds timeout
  FORCE_MOCK_DATA: !import.meta.env.VITE_SPOONACULAR_API_KEY || import.meta.env.VITE_SPOONACULAR_API_KEY === 'your-api-key-here', // Use mock data if no valid API key
};

// Enhanced error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}

export class RecipeApiError extends Error {
  public code: string;
  public retryable: boolean;
  public details?: unknown;

  constructor(message: string, code: string, retryable: boolean = false, details?: unknown) {
    super(message);
    this.name = 'RecipeApiError';
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, string | number | boolean | string[]>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// API Service Class - Simplified version with mock data fallback
class RecipeApiService {
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor() {
    if (CONFIG.LOG_API_ERRORS) {
      console.log('API Service initialized');
    }
  }

  // Rate limiting helper
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (this.requestCount >= 10 && timeSinceLastRequest < 60000) {
      const waitTime = 60000 - timeSinceLastRequest;
      console.warn(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }

    this.requestCount++;
    this.lastRequestTime = now;
  }

  // Enhanced error handling with retry logic
  private async makeRequest<T>(url: string, options: RequestInit = {}, retryCount: number = 0): Promise<T> {
    try {
      if (this.lastRequestTime > 0) {
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < CONFIG.RATE_LIMIT_DELAY) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest));
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new RecipeApiError(
            'Invalid API key. Please check your configuration.',
            'AUTH_ERROR',
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

      if (error instanceof Error && error.name === 'AbortError') {
        throw new RecipeApiError(
          'Request timeout. Please try again.',
          'TIMEOUT_ERROR',
          true
        );
      }

      if (retryCount < CONFIG.MAX_RETRIES && this.isRetryableError(error as { code?: string; name?: string })) {
        const delay = Math.pow(2, retryCount) * 1000;
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

  private isRetryableError(error: { code?: string; name?: string }): boolean {
    return error.code === 'RATE_LIMIT_ERROR' ||
      error.code === 'SERVER_ERROR' ||
      error.code === 'TIMEOUT_ERROR' ||
      error.name === 'AbortError';
  }

  // Search recipes with mock data fallback
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    const result = this.getMockSearchResults(params);

    // Skip API call if no valid API key is configured
    if (CONFIG.FORCE_MOCK_DATA) {
      if (CONFIG.LOG_API_ERRORS) {
        console.log('No valid API key configured, using mock data');
      }
      return {
        results: result.results,
        offset: result.offset,
        number: result.number,
        totalResults: result.totalResults
      };
    }

    try {
      await this.checkRateLimit();

      const queryParams = buildQueryParams({
        ...params,
        apiKey: API_KEY,
        addRecipeInformation: true,
        fillIngredients: true,
        number: params.number || 20
      });

      const apiResult = await this.makeRequest<RecipeSearchResponse>(`${API_BASE_URL}/complexSearch?${queryParams}`);
      return apiResult;
    } catch (error) {
      console.log('API call failed, using mock data:', error);
      return {
        results: result.results,
        offset: result.offset,
        number: result.number,
        totalResults: result.totalResults
      };
    }
  }

  // Search recipes by ingredients with mock data fallback
  async searchRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Promise<Recipe[]> {
    const mockResults = this.getMockRecipesByIngredients(ingredients, maxMissingIngredients);

    // Skip API call if no valid API key is configured
    if (CONFIG.FORCE_MOCK_DATA) {
      if (CONFIG.LOG_API_ERRORS) {
        console.log('No valid API key configured, using mock data for ingredient search');
      }
      return mockResults;
    }

    try {
      await this.checkRateLimit();

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
      return result.results || [];
    } catch (error) {
      console.log('API call failed, using mock data:', error);
      return mockResults;
    }
  }

  // Get detailed recipe information with mock data fallback
  async getRecipeDetails(recipeId: number): Promise<RecipeDetailResponse> {
    const mockRecipe = mockRecipes.find(recipe => recipe.id === recipeId);

    if (!mockRecipe) {
      throw new Error(`Recipe with id ${recipeId} not found`);
    }

    // Skip API call if no valid API key is configured
    if (CONFIG.FORCE_MOCK_DATA) {
      if (CONFIG.LOG_API_ERRORS) {
        console.log('No valid API key configured, using mock data for recipe details');
      }
      return this.getMockRecipeDetails(recipeId);
    }

    try {
      await this.checkRateLimit();

      const detailParams = buildQueryParams({ apiKey: API_KEY });
      const result = await this.makeRequest<RecipeDetailResponse>(`${API_BASE_URL}/${recipeId}/information?${detailParams}`);
      return result;
    } catch (error) {
      console.log('API call failed, using mock data:', error);
      return this.getMockRecipeDetails(recipeId);
    }
  }

  // Get available filter options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return this.getMockFilterOptions();
  }

  // Mock data methods
  private getMockSearchResults(params: RecipeSearchParams): RecipeSearchResponse {
    let filteredRecipes = [...mockRecipes];

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

    if (params.diet) {
      filteredRecipes = filteredRecipes.filter((recipe: any) =>
        recipe.diets.includes(params.diet!)
      );
    }

    if (params.cuisine) {
      filteredRecipes = filteredRecipes.filter((recipe: any) =>
        recipe.cuisines.includes(params.cuisine!)
      );
    }

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

    if (params.maxReadyTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.readyInMinutes <= params.maxReadyTime!
      );
    }

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

  private getMockRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Recipe[] {
    return mockRecipes.filter(recipe => {
      const recipeIngredients = recipe.extendedIngredients.map((ing: any) => ing.name.toLowerCase());
      const missingCount = ingredients.filter((ing: string) => !recipeIngredients.includes(ing.toLowerCase())).length;
      return missingCount <= maxMissingIngredients;
    });
  }
}

// Export singleton instance
export const recipeApiService = new RecipeApiService();

// Export individual functions for convenience
export const searchRecipes = (params: RecipeSearchParams) => recipeApiService.searchRecipes(params);
export const getRecipeDetails = (recipeId: number) => recipeApiService.getRecipeDetails(recipeId);
export const getFilterOptions = () => recipeApiService.getFilterOptions();
export const searchRecipesByIngredients = (ingredients: string[], maxMissingIngredients: number = 3) => recipeApiService.searchRecipesByIngredients(ingredients, maxMissingIngredients);

