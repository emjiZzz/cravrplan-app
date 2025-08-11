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

// Configuration options
const CONFIG = {
  LOG_API_ERRORS: import.meta.env.DEV, // Only log errors in development
  USE_MOCK_DATA_FALLBACK: true, // Always fallback to mock data on API errors
  RATE_LIMIT_DELAY: 1000, // 1 second between requests
  MAX_RETRIES: 3, // Maximum retry attempts for failed requests
  REQUEST_TIMEOUT: 10000, // 10 seconds timeout
};

// Enhanced error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export class RecipeApiError extends Error {
  public code: string;
  public retryable: boolean;
  public details?: any;

  constructor(message: string, code: string, retryable: boolean = false, details?: any) {
    super(message);
    this.name = 'RecipeApiError';
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

// Mock data for development when API key is not available
const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Fried Egg Breakfast Tostadas",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 20,
    aggregateLikes: 45,
    healthScore: 85,
    spoonacularScore: 92,
    pricePerServing: 250,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Mexican"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Toast the tortillas until crispy\n2. Fry eggs to desired doneness\n3. Top with avocado, tomato, and feta\n4. Drizzle with hot sauce",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 1,
        aisle: "Bakery",
        amount: 2,
        unit: "pieces",
        name: "corn tortillas",
        original: "2 corn tortillas",
        originalName: "corn tortillas",
        meta: [],
        image: "tortilla.jpg"
      },
      {
        id: 2,
        aisle: "Produce",
        amount: 2,
        unit: "large",
        name: "eggs",
        original: "2 large eggs",
        originalName: "eggs",
        meta: [],
        image: "egg.jpg"
      }
    ],
    summary: "A delicious breakfast featuring crispy tostadas topped with fried eggs, fresh avocado, and tangy feta cheese."
  },
  {
    id: 2,
    title: "Pan-Fried Beef Meatballs",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 35,
    aggregateLikes: 67,
    healthScore: 78,
    spoonacularScore: 88,
    pricePerServing: 320,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Mix ground beef with breadcrumbs and seasonings\n2. Form into meatballs\n3. Pan-fry until golden brown\n4. Serve with marinara sauce",
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
        id: 3,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "ground beef",
        original: "1 pound ground beef",
        originalName: "ground beef",
        meta: [],
        image: "beef.jpg"
      }
    ],
    summary: "Juicy beef meatballs pan-fried to perfection and served with a rich spinach marinara sauce over creamy polenta."
  },
  {
    id: 3,
    title: "Thai Red Curry Fried Rice",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 3,
    readyInMinutes: 25,
    aggregateLikes: 89,
    healthScore: 72,
    spoonacularScore: 85,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Thai"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Cook rice and let it cool\n2. Stir-fry vegetables and pork\n3. Add curry paste and rice\n4. Season and serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 10,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 4,
        aisle: "Produce",
        amount: 2,
        unit: "cups",
        name: "cooked rice",
        original: "2 cups cooked rice",
        originalName: "cooked rice",
        meta: [],
        image: "rice.jpg"
      }
    ],
    summary: "Aromatic Thai red curry fried rice with ground pork, fresh carrots, and snap peas for a quick and flavorful meal."
  },
  {
    id: 4,
    title: "Miso-Hoisin Rice Noodles",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 30,
    aggregateLikes: 56,
    healthScore: 81,
    spoonacularScore: 79,
    pricePerServing: 310,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Asian"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Cook rice noodles\n2. Stir-fry chicken and vegetables\n3. Add miso and hoisin sauce\n4. Combine and serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 9,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 5,
        aisle: "Produce",
        amount: 8,
        unit: "ounces",
        name: "rice noodles",
        original: "8 ounces rice noodles",
        originalName: "rice noodles",
        meta: [],
        image: "noodles.jpg"
      }
    ],
    summary: "Savory rice noodles tossed with tender chicken, crisp bok choy, and colorful bell peppers in a rich miso-hoisin sauce."
  },
  {
    id: 5,
    title: "Pasta Salad",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 15,
    aggregateLikes: 34,
    healthScore: 88,
    spoonacularScore: 76,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Cook pasta and cool\n2. Mix with vegetables\n3. Add dressing\n4. Chill and serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Side Dish"],
    extendedIngredients: [
      {
        id: 6,
        aisle: "Pasta and Rice",
        amount: 1,
        unit: "pound",
        name: "pasta",
        original: "1 pound pasta",
        originalName: "pasta",
        meta: [],
        image: "pasta.jpg"
      }
    ],
    summary: "Fresh and colorful pasta salad loaded with edamame, cucumber, carrots, and a zesty peanut-lime dressing."
  },
  {
    id: 6,
    title: "Savory Cottage Cheese",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 1,
    readyInMinutes: 5,
    aggregateLikes: 23,
    healthScore: 92,
    spoonacularScore: 68,
    pricePerServing: 120,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mix cottage cheese with vegetables\n2. Add seasonings\n3. Top with seeds\n4. Serve immediately",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast", "Snack"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 7,
        aisle: "Dairy",
        amount: 1,
        unit: "cup",
        name: "cottage cheese",
        original: "1 cup cottage cheese",
        originalName: "cottage cheese",
        meta: [],
        image: "cottage-cheese.jpg"
      }
    ],
    summary: "Protein-rich cottage cheese topped with fresh cucumber, juicy tomatoes, and nutty sesame seeds for a healthy snack."
  },
  {
    id: 7,
    title: "Cottage Cheese with Peaches",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 1,
    readyInMinutes: 3,
    aggregateLikes: 41,
    healthScore: 89,
    spoonacularScore: 71,
    pricePerServing: 140,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Top cottage cheese with peaches\n2. Add blueberries\n3. Drizzle with maple syrup\n4. Serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast", "Snack"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 4,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 8,
        aisle: "Produce",
        amount: 1,
        unit: "peach",
        name: "peach",
        original: "1 peach",
        originalName: "peach",
        meta: [],
        image: "peach.jpg"
      }
    ],
    summary: "Sweet and creamy cottage cheese topped with fresh peaches, plump blueberries, and a drizzle of maple syrup."
  },
  {
    id: 8,
    title: "English Muffin Pizzas",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 12,
    aggregateLikes: 67,
    healthScore: 65,
    spoonacularScore: 82,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Toast English muffins\n2. Spread with pesto\n3. Add cheese and tomatoes\n4. Broil until melted",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch", "Snack"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 9,
        aisle: "Bakery",
        amount: 2,
        unit: "English muffins",
        name: "English muffins",
        original: "2 English muffins",
        originalName: "English muffins",
        meta: [],
        image: "english-muffin.jpg"
      }
    ],
    summary: "Quick and delicious mini pizzas made on English muffins with basil pesto, creamy goat cheese, and fresh tomatoes."
  },
  {
    id: 9,
    title: "Chicken Salad",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 20,
    aggregateLikes: 78,
    healthScore: 83,
    spoonacularScore: 87,
    pricePerServing: 290,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Cook and shred chicken\n2. Mix with vegetables\n3. Add dressing\n4. Chill and serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 7,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 10,
        aisle: "Meat",
        amount: 2,
        unit: "chicken breasts",
        name: "chicken breasts",
        original: "2 chicken breasts",
        originalName: "chicken breasts",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Fresh and flavorful chicken salad with crisp cucumbers, sweet peaches, aromatic mint, creamy goat cheese, and crunchy almonds."
  },
  {
    id: 10,
    title: "Spicy Seared Lamb Chops",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 25,
    aggregateLikes: 95,
    healthScore: 71,
    spoonacularScore: 91,
    pricePerServing: 450,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Mediterranean"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Season lamb chops\n2. Sear until medium-rare\n3. Serve with side salad\n4. Drizzle with yogurt sauce",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 15,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 11,
        aisle: "Meat",
        amount: 4,
        unit: "lamb chops",
        name: "lamb chops",
        original: "4 lamb chops",
        originalName: "lamb chops",
        meta: [],
        image: "lamb.jpg"
      }
    ],
    summary: "Perfectly seared lamb chops with a spicy kick, served alongside a refreshing salad of cucumbers, peaches, almonds, and creamy yogurt."
  },
  {
    id: 11,
    title: "Grilled Salmon with Lemon Herb Butter",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 30,
    aggregateLikes: 88,
    healthScore: 89,
    spoonacularScore: 94,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Mediterranean"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Season salmon fillets\n2. Grill until flaky\n3. Top with herb butter\n4. Serve with vegetables",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
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
        id: 12,
        aisle: "Seafood",
        amount: 2,
        unit: "salmon fillets",
        name: "salmon fillets",
        original: "2 salmon fillets",
        originalName: "salmon fillets",
        meta: [],
        image: "salmon.jpg"
      }
    ],
    summary: "Fresh salmon fillets grilled to perfection and topped with a zesty lemon herb butter sauce."
  },
  {
    id: 12,
    title: "Vegetarian Buddha Bowl",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 25,
    aggregateLikes: 72,
    healthScore: 95,
    spoonacularScore: 87,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Asian"],
    dairyFree: true,
    diets: ["Vegetarian", "Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Cook quinoa\n2. Roast vegetables\n3. Prepare tahini sauce\n4. Assemble bowl",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch", "Dinner"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 5,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 13,
        aisle: "Produce",
        amount: 1,
        unit: "cup",
        name: "quinoa",
        original: "1 cup quinoa",
        originalName: "quinoa",
        meta: [],
        image: "quinoa.jpg"
      }
    ],
    summary: "A colorful and nutritious Buddha bowl packed with quinoa, roasted vegetables, and a creamy tahini dressing."
  },
  {
    id: 13,
    title: "Classic Beef Burger",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 20,
    aggregateLikes: 95,
    healthScore: 45,
    spoonacularScore: 89,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Form burger patties\n2. Grill to desired doneness\n3. Add toppings\n4. Serve on buns",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch", "Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 14,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 14,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "ground beef",
        original: "1 pound ground beef",
        originalName: "ground beef",
        meta: [],
        image: "beef.jpg"
      }
    ],
    summary: "Juicy beef burgers with all the classic toppings - lettuce, tomato, cheese, and special sauce."
  },
  {
    id: 14,
    title: "Chocolate Chip Cookies",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 24,
    readyInMinutes: 35,
    aggregateLikes: 98,
    healthScore: 25,
    spoonacularScore: 92,
    pricePerServing: 120,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Mix ingredients\n2. Form cookie dough\n3. Bake until golden\n4. Cool and enjoy",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 15,
        aisle: "Baking",
        amount: 2,
        unit: "cups",
        name: "all-purpose flour",
        original: "2 cups all-purpose flour",
        originalName: "all-purpose flour",
        meta: [],
        image: "flour.jpg"
      }
    ],
    summary: "Classic homemade chocolate chip cookies with crispy edges and chewy centers."
  },
  {
    id: 15,
    title: "Caesar Salad",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 15,
    aggregateLikes: 65,
    healthScore: 75,
    spoonacularScore: 78,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Wash and chop lettuce\n2. Make Caesar dressing\n3. Add croutons and cheese\n4. Toss and serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch", "Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 4,
    dishTypes: ["Side Dish"],
    extendedIngredients: [
      {
        id: 16,
        aisle: "Produce",
        amount: 1,
        unit: "head",
        name: "romaine lettuce",
        original: "1 head romaine lettuce",
        originalName: "romaine lettuce",
        meta: [],
        image: "lettuce.jpg"
      }
    ],
    summary: "Classic Caesar salad with crisp romaine lettuce, homemade dressing, croutons, and Parmesan cheese."
  }
];

// Add more mock recipes below to ensure at least 25 for pagination
for (let i = 16; i <= 25; i++) {
  mockRecipes.push({
    id: i,
    title: `Mock Recipe ${i}`,
    image: 'https://via.placeholder.com/400x300?text=Recipe+' + i,
    imageType: 'jpg',
    servings: 2,
    readyInMinutes: 30,
    aggregateLikes: 10 + i,
    healthScore: 50 + i,
    spoonacularScore: 60 + i,
    pricePerServing: 200 + i,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ['Test'],
    dairyFree: false,
    diets: ['Vegetarian'],
    gaps: 'GAPS',
    glutenFree: false,
    instructions: '1. Do something\n2. Do something else',
    ketogenic: false,
    lowFodmap: false,
    occasions: ['Test'],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 5,
    dishTypes: ['Main Course'],
    extendedIngredients: [
      {
        id: 100 + i,
        aisle: 'Test',
        amount: 1,
        unit: 'unit',
        name: 'Test Ingredient',
        original: '1 unit Test Ingredient',
        originalName: 'Test Ingredient',
        meta: [],
        image: 'ingredient.jpg'
      }
    ],
    summary: `This is a mock recipe for testing pagination. Recipe #${i}.`
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

// API Service Class
class RecipeApiService {
  private useMockData: boolean;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor() {
    this.useMockData = !API_KEY || API_KEY === 'your-api-key-here';
  }

  // Rate limiting helper
  private async checkRateLimit(): Promise<void> {
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

      if (error.name === 'AbortError') {
        throw new RecipeApiError(
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

      throw new RecipeApiError(
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

  // Enhanced error handling with fallback
  private handleApiError(error: unknown, fallbackData: any): any {
    if (CONFIG.LOG_API_ERRORS) {
      console.error('API Error:', {
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

  // Search recipes with various filters
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
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

  // Search recipes by ingredients
  async searchRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Promise<Recipe[]> {
    if (this.useMockData) {
      return this.getMockRecipesByIngredients(ingredients, maxMissingIngredients);
    }

    try {
      await this.checkRateLimit();

      const queryParams = buildQueryParams({
        ingredients: ingredients.join(','),
        ranking: 2, // Maximize used ingredients
        ignorePantry: true,
        number: 20,
        apiKey: API_KEY,
        addRecipeInformation: true,
        fillIngredients: true
      });

      const response = await this.makeRequest<{ results: any[] }>(`${API_BASE_URL}/findByIngredients?${queryParams}`);

      // Filter results based on maxMissingIngredients
      return response.results.filter((recipe: any) =>
        recipe.missedIngredientCount <= maxMissingIngredients
      );
    } catch (error: unknown) {
      return this.handleApiError(error, this.getMockRecipesByIngredients(ingredients, maxMissingIngredients));
    }
  }

  // Get detailed recipe information
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

  // Get available filter options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    // For now, always use mock data since the Spoonacular filter endpoints are not reliable
    // This prevents 404 errors and provides a consistent user experience
    return this.getMockFilterOptions();
  }

  // Mock data methods
  private getMockSearchResults(params: RecipeSearchParams): RecipeSearchResponse {
    let filteredRecipes = [...mockRecipes];

    // Apply search query filter
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

    // Apply diet filter
    if (params.diet) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.diets.includes(params.diet!)
      );
    }

    // Apply cuisine filter
    if (params.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.cuisines.includes(params.cuisine!)
      );
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
        { name: "Mediterranean", value: "Mediterranean" }
      ],
      diets: [
        { name: "Vegetarian", value: "Vegetarian" },
        { name: "Vegan", value: "Vegan" },
        { name: "Gluten Free", value: "Gluten Free" },
        { name: "Keto", value: "Keto" },
        { name: "Paleo", value: "Paleo" }
      ],
      intolerances: [
        { name: "Dairy", value: "Dairy" },
        { name: "Egg", value: "Egg" },
        { name: "Gluten", value: "Gluten" },
        { name: "Peanut", value: "Peanut" },
        { name: "Seafood", value: "Seafood" },
        { name: "Shellfish", value: "Shellfish" },
        { name: "Soy", value: "Soy" },
        { name: "Sulfite", value: "Sulfite" },
        { name: "Tree Nut", value: "Tree Nut" },
        { name: "Wheat", value: "Wheat" }
      ],
      mealTypes: [
        { name: "Main Course", value: "main course" },
        { name: "Breakfast", value: "breakfast" },
        { name: "Side Dish", value: "side dish" },
        { name: "Dessert", value: "dessert" },
        { name: "Snack", value: "snack" }
      ]
    };
  }

  private getMockRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Recipe[] {
    return mockRecipes.filter(recipe => {
      const recipeIngredients = recipe.extendedIngredients.map(ing => ing.name.toLowerCase());
      const missingCount = ingredients.filter(ing => !recipeIngredients.includes(ing.toLowerCase())).length;
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

