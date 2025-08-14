// Service for handling recipe API calls and mock data

import type {
  Recipe,
  RecipeSearchParams,
  RecipeSearchResponse,
  RecipeDetailResponse,
  FilterOptionsResponse
} from '../types/recipeTypes';

// API Configuration
const API_BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'your-api-key-here';

const CONFIG = {
  LOG_API_ERRORS: import.meta.env.DEV,
  USE_MOCK_DATA_FALLBACK: true,
  RATE_LIMIT_DELAY: 1000,
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 10000,
  MOCK_DATA_DELAY: 0,
};

// Custom error types
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

// Mock recipe data for when the API is unavailable
const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Crispy Chicken Tacos with Avocado Salsa",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 25,
    aggregateLikes: 89,
    healthScore: 78,
    spoonacularScore: 94,
    pricePerServing: 320,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Mexican"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Season chicken with spices and pan-fry until crispy\n2. Warm corn tortillas\n3. Make fresh avocado salsa with lime and cilantro\n4. Assemble tacos with chicken, salsa, and crumbled queso fresco",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner", "Lunch"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 1,
        aisle: "Meat",
        amount: 1.5,
        unit: "pounds",
        name: "chicken breast",
        original: "1.5 pounds chicken breast, sliced",
        originalName: "chicken breast",
        meta: ["sliced"],
        image: "chicken-breast.jpg"
      },
      {
        id: 2,
        aisle: "Produce",
        amount: 2,
        unit: "avocados",
        name: "avocado",
        original: "2 ripe avocados",
        originalName: "avocado",
        meta: ["ripe"],
        image: "avocado.jpg"
      },
      {
        id: 3,
        aisle: "Bakery",
        amount: 8,
        unit: "corn tortillas",
        name: "corn tortillas",
        original: "8 corn tortillas",
        originalName: "corn tortillas",
        meta: [],
        image: "corn-tortillas.jpg"
      }
    ],
    summary: "Crispy pan-fried chicken tacos topped with fresh avocado salsa and crumbled queso fresco. A quick and flavorful Mexican-inspired meal perfect for weeknight dinners."
  },
  {
    id: 2,
    title: "Mediterranean Quinoa Bowl with Roasted Vegetables",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 3,
    readyInMinutes: 35,
    aggregateLikes: 76,
    healthScore: 92,
    spoonacularScore: 88,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Mediterranean"],
    dairyFree: true,
    diets: ["Vegetarian", "Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Cook quinoa according to package instructions\n2. Roast chickpeas, bell peppers, and zucchini with olive oil and herbs\n3. Prepare lemon-tahini dressing\n4. Assemble bowls with quinoa, vegetables, and dressing",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch", "Dinner"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 4,
        aisle: "Pasta and Rice",
        amount: 1,
        unit: "cup",
        name: "quinoa",
        original: "1 cup quinoa",
        originalName: "quinoa",
        meta: [],
        image: "quinoa.jpg"
      },
      {
        id: 5,
        aisle: "Canned and Jarred",
        amount: 1,
        unit: "can",
        name: "chickpeas",
        original: "1 can chickpeas, drained",
        originalName: "chickpeas",
        meta: ["drained"],
        image: "chickpeas.jpg"
      },
      {
        id: 6,
        aisle: "Produce",
        amount: 2,
        unit: "bell peppers",
        name: "bell peppers",
        original: "2 bell peppers, sliced",
        originalName: "bell peppers",
        meta: ["sliced"],
        image: "bell-peppers.jpg"
      }
    ],
    summary: "A nutritious Mediterranean-inspired quinoa bowl featuring roasted chickpeas, colorful bell peppers, and zucchini, topped with a creamy lemon-tahini dressing."
  },
  {
    id: 3,
    title: "Thai Green Curry with Coconut Rice",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 40,
    aggregateLikes: 94,
    healthScore: 71,
    spoonacularScore: 91,
    pricePerServing: 350,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Thai"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Cook coconut rice with pandan leaves\n2. Stir-fry chicken with green curry paste\n3. Add coconut milk and vegetables\n4. Simmer until sauce thickens and serve over rice",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 12,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 7,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "chicken thigh",
        original: "1 pound chicken thighs, cubed",
        originalName: "chicken thigh",
        meta: ["cubed"],
        image: "chicken-thigh.jpg"
      },
      {
        id: 8,
        aisle: "Ethnic Foods",
        amount: 2,
        unit: "tablespoons",
        name: "green curry paste",
        original: "2 tablespoons green curry paste",
        originalName: "green curry paste",
        meta: [],
        image: "green-curry-paste.jpg"
      },
      {
        id: 9,
        aisle: "Canned and Jarred",
        amount: 1,
        unit: "can",
        name: "coconut milk",
        original: "1 can coconut milk",
        originalName: "coconut milk",
        meta: [],
        image: "coconut-milk.jpg"
      }
    ],
    summary: "Aromatic Thai green curry with tender chicken, bamboo shoots, and Thai basil, served over fragrant coconut rice for an authentic Southeast Asian dining experience."
  }
];

// Add more mock recipes for variety
for (let i = 4; i <= 20; i++) {
  const recipeTemplates = [
    {
      title: "Grilled Vegetable Panini",
      cuisines: ["Italian"],
      diets: ["Vegetarian"],
      dishTypes: ["Main Course"],
      readyInMinutes: 20,
      healthScore: 85
    },
    {
      title: "Spicy Tofu Stir-Fry",
      cuisines: ["Asian"],
      diets: ["Vegan"],
      dishTypes: ["Main Course"],
      readyInMinutes: 25,
      healthScore: 88
    },
    {
      title: "Classic Caesar Salad",
      cuisines: ["Italian"],
      diets: ["Vegetarian"],
      dishTypes: ["Side Dish"],
      readyInMinutes: 15,
      healthScore: 75
    },
    {
      title: "Beef and Broccoli",
      cuisines: ["Chinese"],
      diets: ["High-Protein"],
      dishTypes: ["Main Course"],
      readyInMinutes: 30,
      healthScore: 72
    },
    {
      title: "Chocolate Chip Cookies",
      cuisines: ["American"],
      diets: ["Vegetarian"],
      dishTypes: ["Dessert"],
      readyInMinutes: 35,
      healthScore: 45
    }
  ];

  const template = recipeTemplates[(i - 4) % recipeTemplates.length];

  mockRecipes.push({
    id: i,
    title: template.title,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    imageType: 'jpg',
    servings: 2 + (i % 3),
    readyInMinutes: template.readyInMinutes,
    aggregateLikes: 50 + (i * 3),
    healthScore: template.healthScore,
    spoonacularScore: 70 + (i * 2),
    pricePerServing: 200 + (i * 20),
    analyzedInstructions: [],
    cheap: i % 2 === 0,
    cuisines: template.cuisines,
    dairyFree: template.diets.includes('Vegan'),
    diets: template.diets,
    gaps: 'GAPS',
    glutenFree: template.diets.includes('Gluten-Free'),
    instructions: `1. Prepare ingredients\n2. Cook according to recipe\n3. Serve and enjoy`,
    ketogenic: false,
    lowFodmap: false,
    occasions: ['Dinner'],
    sustainable: i % 2 === 0,
    vegan: template.diets.includes('Vegan'),
    vegetarian: template.diets.includes('Vegetarian'),
    veryHealthy: template.healthScore > 80,
    veryPopular: i % 3 === 0,
    whole30: false,
    weightWatcherSmartPoints: 5 + (i % 8),
    dishTypes: template.dishTypes,
    extendedIngredients: [
      {
        id: 100 + i,
        aisle: 'Produce',
        amount: 1,
        unit: 'unit',
        name: 'Main Ingredient',
        original: '1 unit Main Ingredient',
        originalName: 'Main Ingredient',
        meta: [],
        image: 'ingredient.jpg'
      }
    ],
    summary: `A delicious ${template.title.toLowerCase()} recipe perfect for any occasion.`
  });
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

// Main API Service Class
class RecipeApiService {
  private useMockData: boolean;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private mockDataLoaded: boolean = false;

  constructor() {
    this.useMockData = !API_KEY || API_KEY === 'your-api-key-here';
    this.preloadMockData();

    if (CONFIG.LOG_API_ERRORS) {
      console.log('API Service initialized:', {
        hasApiKey: !!API_KEY && API_KEY !== 'your-api-key-here',
        useMockData: this.useMockData,
        rateLimitDelay: CONFIG.RATE_LIMIT_DELAY,
        maxRetries: CONFIG.MAX_RETRIES
      });
    }
  }

  private preloadMockData(): void {
    if (!this.mockDataLoaded) {
      this.mockDataLoaded = true;
      if (CONFIG.LOG_API_ERRORS) {
        console.log('Mock data preloaded for instant access');
      }
    }
  }

  private saveFiltersToStorage(filters: Record<string, any>): void {
    try {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          localStorage.setItem(`cravrplan_filters_${key}`, JSON.stringify(value));
        } else {
          localStorage.removeItem(`cravrplan_filters_${key}`);
        }
      });
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }

  private loadFiltersFromStorage(): Record<string, any> {
    const filters: Record<string, any> = {};
    try {
      const filterKeys = ['query', 'cuisine', 'diet', 'intolerances', 'maxReadyTime', 'type'];
      filterKeys.forEach(key => {
        const stored = localStorage.getItem(`cravrplan_filters_${key}`);
        if (stored) {
          try {
            filters[key] = JSON.parse(stored);
          } catch (e) {
            console.warn(`Failed to parse stored filter ${key}:`, e);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
    return filters;
  }

  private async checkRateLimit(): Promise<void> {
    // Skip rate limiting when using mock data
    if (this.useMockData) {
      return;
    }

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

  private async makeRequest<T>(url: string, options: RequestInit = {}, retryCount: number = 0): Promise<T> {
    try {
      // Only apply rate limiting delay if not using mock data
      if (!this.useMockData && this.lastRequestTime > 0) {
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
        } else if (response.status === 402) {
          throw new RecipeApiError(
            'API payment required. Using mock data instead.',
            'PAYMENT_REQUIRED',
            false,
            errorData
          );
        } else if (response.status === 429) {
          throw new RecipeApiError(
            'API rate limit exceeded. Using mock data instead.',
            'RATE_LIMIT_ERROR',
            true,
            errorData
          );
        } else if (response.status >= 500) {
          throw new RecipeApiError(
            'Server error. Using mock data instead.',
            'SERVER_ERROR',
            true,
            errorData
          );
        } else {
          throw new RecipeApiError(
            `API request failed: ${response.status} ${response.statusText}. Using mock data instead.`,
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
          'Request timeout. Using mock data instead.',
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
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}. Using mock data instead.`,
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

  private handleApiError<T>(error: unknown, fallbackData: T): T {
    if (CONFIG.LOG_API_ERRORS) {
      console.warn('API Error - falling back to mock data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as { code?: string })?.code,
        retryable: (error as { retryable?: boolean })?.retryable,
        details: (error as { details?: unknown })?.details
      });
    }

    if (CONFIG.USE_MOCK_DATA_FALLBACK) {
      console.log('✅ Using mock data for instant response');
      return fallbackData;
    }

    throw error;
  }

  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    this.saveFiltersToStorage(params);

    if (this.useMockData) {
      return this.getMockSearchResults(params);
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

      const response = await this.makeRequest<RecipeSearchResponse>(`${API_BASE_URL}/complexSearch?${queryParams}`);
      return response;
    } catch (error: unknown) {
      return this.handleApiError(error, this.getMockSearchResults(params));
    }
  }

  async getRecipeDetails(recipeId: number): Promise<RecipeDetailResponse> {
    if (this.useMockData) {
      return this.getMockRecipeDetails(recipeId);
    }

    try {
      await this.checkRateLimit();

      const queryParams = buildQueryParams({
        apiKey: API_KEY
      });

      const response = await this.makeRequest<RecipeDetailResponse>(`${API_BASE_URL}/${recipeId}/information?${queryParams}`);
      return response;
    } catch (error: unknown) {
      console.error('Error fetching recipe details:', error);
      return this.handleApiError(error, this.getMockRecipeDetails(recipeId));
    }
  }

  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return this.getMockFilterOptions();
  }

  getLastUsedFilters(): RecipeSearchParams {
    return this.loadFiltersFromStorage();
  }

  // Mock data methods
  private getMockSearchResults(params: RecipeSearchParams): RecipeSearchResponse {
    let filteredRecipes = [...mockRecipes];

    if (params.query) {
      const query = params.query.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.summary.toLowerCase().includes(query) ||
        recipe.extendedIngredients.some(ingredient =>
          ingredient.name.toLowerCase().includes(query)
        )
      );
    }

    if (params.diet) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.diets.includes(params.diet!)
      );
    }

    if (params.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.cuisines.includes(params.cuisine!)
      );
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
        { name: "Korean", value: "Korean" },
        { name: "Indian", value: "Indian" },
        { name: "Spanish", value: "Spanish" },
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
        { name: "Long (60+ min)", value: "60+" },
        { name: "Meal Prep", value: "meal-prep" },
        { name: "Weekend Cooking", value: "weekend" }
      ]
    };
  }
}

// Create a single instance of the API service
export const recipeApiService = new RecipeApiService();

// Export individual functions for convenience
export const searchRecipes = (params: RecipeSearchParams) => recipeApiService.searchRecipes(params);
export const getRecipeDetails = (recipeId: number) => recipeApiService.getRecipeDetails(recipeId);
export const getFilterOptions = () => recipeApiService.getFilterOptions();

// Export utility functions
export const getLastUsedFilters = () => recipeApiService.getLastUsedFilters();
export const isUsingMockData = () => recipeApiService['useMockData'];
export const clearStoredFilters = () => {
  try {
    const filterKeys = ['query', 'cuisine', 'diet', 'intolerances', 'maxReadyTime', 'type'];
    filterKeys.forEach(key => {
      localStorage.removeItem(`cravrplan_filters_${key}`);
    });
    console.log('✅ Stored filters cleared');
  } catch (error) {
    console.warn('Failed to clear stored filters:', error);
  }
};

