import type {
  Recipe,
  RecipeSearchParams,
  RecipeSearchResponse,
  RecipeDetailResponse,
  FilterOptionsResponse
} from '../types/recipeTypes';

// TheMealDB API Configuration
const THEMEALDB_API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Configuration options
const CONFIG = {
  LOG_API_ERRORS: import.meta.env.DEV,
  USE_MOCK_DATA_FALLBACK: true,
  RATE_LIMIT_DELAY: 1000,
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 10000,
};

// TheMealDB API Error handling
export class TheMealDBApiError extends Error {
  public code: string;
  public retryable: boolean;
  public details?: any;

  constructor(message: string, code: string, retryable: boolean = false, details?: any) {
    super(message);
    this.name = 'TheMealDBApiError';
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

// Convert TheMealDB recipe to your app's Recipe format
const convertTheMealDBRecipe = (themealdbRecipe: any): Recipe => {
  // Extract ingredients and measurements
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = themealdbRecipe[`strIngredient${i}`];
    const measure = themealdbRecipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        id: i,
        aisle: 'Other',
        amount: 1,
        unit: measure ? measure.trim() : 'unit',
        name: ingredient.trim(),
        original: measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim(),
        originalName: ingredient.trim(),
        meta: [],
        image: ''
      });
    }
  }

  // Extract instructions
  const instructions = themealdbRecipe.strInstructions || '';
  const instructionSteps = instructions.split('\n').filter((step: string) => step.trim());

  return {
    id: parseInt(themealdbRecipe.idMeal) || Date.now(),
    title: themealdbRecipe.strMeal,
    image: themealdbRecipe.strMealThumb,
    imageType: 'jpg',
    servings: 4, // TheMealDB doesn't provide servings
    readyInMinutes: 30, // TheMealDB doesn't provide cooking time
    aggregateLikes: 0,
    healthScore: 50, // Default health score
    spoonacularScore: 60, // Default score
    pricePerServing: 200, // Default price
    analyzedInstructions: instructionSteps.map((step: string, index: number) => ({
      name: `Step ${index + 1}`,
      steps: [{
        number: index + 1,
        step: step.trim(),
        ingredients: [],
        equipment: []
      }]
    })),
    cheap: true,
    cuisines: [themealdbRecipe.strArea || 'Unknown'],
    dairyFree: false, // TheMealDB doesn't provide this info
    diets: [],
    gaps: 'GAPS',
    glutenFree: false, // TheMealDB doesn't provide this info
    instructions: instructions,
    ketogenic: false,
    lowFodmap: false,
    occasions: [],
    sustainable: false,
    vegan: false, // TheMealDB doesn't provide this info
    vegetarian: false, // TheMealDB doesn't provide this info
    veryHealthy: false,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 5,
    dishTypes: [themealdbRecipe.strCategory || 'Main Course'],
    extendedIngredients: ingredients,
    summary: `A delicious ${themealdbRecipe.strCategory || 'meal'} from ${themealdbRecipe.strArea || 'various'} cuisine.`,
    sourceUrl: themealdbRecipe.strSource || '',
    sourceName: themealdbRecipe.strSource || 'TheMealDB',
    creditsText: '',
    license: '',
    nutrition: {
      nutrients: {},
      caloricBreakdown: {
        percentProtein: 25,
        percentFat: 30,
        percentCarbs: 45
      }
    }
  };
};

// TheMealDB API Service Class
class TheMealDBApiService {
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  // Rate limiting helper
  private async checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Basic rate limiting: max 10 requests per minute
    if (this.requestCount >= 10 && timeSinceLastRequest < 60000) {
      const waitTime = 60000 - timeSinceLastRequest;
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
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

        if (response.status === 429) {
          throw new TheMealDBApiError(
            'API rate limit exceeded. Please try again later.',
            'RATE_LIMIT_ERROR',
            true,
            errorData
          );
        } else if (response.status >= 500) {
          throw new TheMealDBApiError(
            'Server error. Please try again later.',
            'SERVER_ERROR',
            true,
            errorData
          );
        } else {
          throw new TheMealDBApiError(
            `API request failed: ${response.status} ${response.statusText}`,
            'REQUEST_ERROR',
            false,
            errorData
          );
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TheMealDBApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new TheMealDBApiError(
          'Request timeout. Please try again.',
          'TIMEOUT_ERROR',
          true
        );
      }

      // Retry logic for retryable errors
      if (retryCount < CONFIG.MAX_RETRIES && this.isRetryableError(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(url, options, retryCount + 1);
      }

      throw new TheMealDBApiError(
        `Network error: ${error.message}`,
        'NETWORK_ERROR',
        false,
        error
      );
    }
  }

  private isRetryableError(error: any): boolean {
    return error.code === 'RATE_LIMIT_ERROR' ||
      error.code === 'SERVER_ERROR' ||
      error.code === 'TIMEOUT_ERROR' ||
      error.name === 'AbortError';
  }

  // Search recipes with TheMealDB API
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    try {
      await this.checkRateLimit();

      let url: string;

      if (params.query) {
        // Search by name
        url = `${THEMEALDB_API_BASE}/search.php?s=${encodeURIComponent(params.query)}`;
      } else if (params.cuisine && params.cuisine !== 'All Menus') {
        // Search by area (cuisine)
        url = `${THEMEALDB_API_BASE}/filter.php?a=${encodeURIComponent(params.cuisine)}`;
      } else if (params.type && params.type !== 'All Meal Types') {
        // Search by category
        url = `${THEMEALDB_API_BASE}/filter.php?c=${encodeURIComponent(params.type)}`;
      } else {
        // Get random recipes
        url = `${THEMEALDB_API_BASE}/random.php`;
      }

      const response = await this.makeRequest<any>(url);

      let recipes: Recipe[] = [];

      if (response.meals) {
        // Convert to array if it's a single meal
        const mealsArray = Array.isArray(response.meals) ? response.meals : [response.meals];
        recipes = mealsArray.map((meal: any) => convertTheMealDBRecipe(meal));
      }

      // Apply pagination
      const offset = params.offset || 0;
      const number = params.number || 20;
      const paginatedRecipes = recipes.slice(offset, offset + number);

      return {
        results: paginatedRecipes,
        offset: offset,
        number: paginatedRecipes.length,
        totalResults: recipes.length,
        processingTimeMs: 0,
        expires: 0
      };
    } catch (error: unknown) {
      return this.handleApiError(error, this.getMockSearchResults(params));
    }
  }

  // Get recipe details from TheMealDB
  async getRecipeDetails(recipeId: number): Promise<RecipeDetailResponse> {
    try {
      await this.checkRateLimit();

      const response = await this.makeRequest<{ meals: any[] }>(
        `${THEMEALDB_API_BASE}/lookup.php?i=${recipeId}`
      );

      if (response.meals && response.meals.length > 0) {
        return convertTheMealDBRecipe(response.meals[0]);
      } else {
        throw new TheMealDBApiError('Recipe not found', 'NOT_FOUND', false);
      }
    } catch (error: unknown) {
      return this.handleApiError(error, this.getMockRecipeDetails(recipeId));
    }
  }

  // Get filter options from TheMealDB
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    try {
      await this.checkRateLimit();

      // Get categories
      const categoriesResponse = await this.makeRequest<{ meals: any[] }>(
        `${THEMEALDB_API_BASE}/categories.php`
      );

      // Get areas (cuisines)
      const areasResponse = await this.makeRequest<{ meals: any[] }>(
        `${THEMEALDB_API_BASE}/list.php?a=list`
      );

      return {
        cuisines: areasResponse.meals?.map((area: any) => ({
          name: area.strArea,
          value: area.strArea.toLowerCase()
        })) || [
            { name: 'American', value: 'american' },
            { name: 'Italian', value: 'italian' },
            { name: 'Mexican', value: 'mexican' },
            { name: 'Asian', value: 'asian' },
            { name: 'Mediterranean', value: 'mediterranean' },
            { name: 'Indian', value: 'indian' },
            { name: 'French', value: 'french' },
            { name: 'Japanese', value: 'japanese' },
            { name: 'Chinese', value: 'chinese' },
            { name: 'Thai', value: 'thai' }
          ],
        diets: [
          { name: 'No Diet Restrictions', value: 'no-diet' },
          { name: 'Vegetarian', value: 'vegetarian' },
          { name: 'Vegan', value: 'vegan' },
          { name: 'Gluten Free', value: 'gluten-free' },
          { name: 'Dairy Free', value: 'dairy-free' },
          { name: 'Low Carb', value: 'low-carb' },
          { name: 'Keto', value: 'keto' },
          { name: 'Paleo', value: 'paleo' }
        ],
        mealTypes: categoriesResponse.meals?.map((category: any) => ({
          name: category.strCategory,
          value: category.strCategory.toLowerCase()
        })) || [
            { name: 'All Meal Types', value: 'all' },
            { name: 'Breakfast', value: 'breakfast' },
            { name: 'Lunch', value: 'lunch' },
            { name: 'Dinner', value: 'dinner' },
            { name: 'Snack', value: 'snack' },
            { name: 'Dessert', value: 'dessert' }
          ]
      };
    } catch (error: unknown) {
      // Return static data if API fails
      return {
        cuisines: [
          { name: 'American', value: 'american' },
          { name: 'Italian', value: 'italian' },
          { name: 'Mexican', value: 'mexican' },
          { name: 'Asian', value: 'asian' },
          { name: 'Mediterranean', value: 'mediterranean' },
          { name: 'Indian', value: 'indian' },
          { name: 'French', value: 'french' },
          { name: 'Japanese', value: 'japanese' },
          { name: 'Chinese', value: 'chinese' },
          { name: 'Thai', value: 'thai' }
        ],
        diets: [
          { name: 'No Diet Restrictions', value: 'no-diet' },
          { name: 'Vegetarian', value: 'vegetarian' },
          { name: 'Vegan', value: 'vegan' },
          { name: 'Gluten Free', value: 'gluten-free' },
          { name: 'Dairy Free', value: 'dairy-free' },
          { name: 'Low Carb', value: 'low-carb' },
          { name: 'Keto', value: 'keto' },
          { name: 'Paleo', value: 'paleo' }
        ],
        mealTypes: [
          { name: 'All Meal Types', value: 'all' },
          { name: 'Breakfast', value: 'breakfast' },
          { name: 'Lunch', value: 'lunch' },
          { name: 'Dinner', value: 'dinner' },
          { name: 'Snack', value: 'snack' },
          { name: 'Dessert', value: 'dessert' }
        ]
      };
    }
  }

  // Mock data fallbacks
  private getMockSearchResults(params: RecipeSearchParams): RecipeSearchResponse {
    return {
      results: [],
      offset: params.offset || 0,
      number: params.number || 20,
      totalResults: 0,
      processingTimeMs: 0,
      expires: 0
    };
  }

  private getMockRecipeDetails(recipeId: number): RecipeDetailResponse {
    return {} as RecipeDetailResponse;
  }

  private handleApiError(error: unknown, fallbackData: any): any {
    if (CONFIG.LOG_API_ERRORS) {
      console.error('TheMealDB API Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        retryable: (error as any)?.retryable,
        details: (error as any)?.details
      });
    }

    if (CONFIG.USE_MOCK_DATA_FALLBACK) {
      console.warn('Falling back to mock data due to API error:', error instanceof Error ? error.message : 'Unknown error');
      return fallbackData;
    }

    throw error;
  }
}

// Create singleton instance
const themealdbApiService = new TheMealDBApiService();

// Export functions
export const searchRecipes = (params: RecipeSearchParams) => themealdbApiService.searchRecipes(params);
export const getRecipeDetails = (recipeId: number) => themealdbApiService.getRecipeDetails(recipeId);
export const getFilterOptions = () => themealdbApiService.getFilterOptions();
