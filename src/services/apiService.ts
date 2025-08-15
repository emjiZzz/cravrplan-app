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

// REFACTORED: Mock data exported for local filtering
// To switch back to API: remove this export and use API calls instead
export const mockRecipes: Recipe[] = [
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

// BETA: Enhanced mock recipes with diverse meal types and cooking times
// Ensuring every filter option has at least 4 recipes
const additionalMockRecipes: Recipe[] = [
  // BREAKFAST RECIPES (4+ recipes)
  {
    id: 16,
    title: "Quick Breakfast Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 1,
    readyInMinutes: 8,
    aggregateLikes: 78,
    healthScore: 95,
    spoonacularScore: 88,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Blend frozen berries with almond milk\n2. Top with granola and fresh fruit\n3. Drizzle with honey",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 4,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 101,
        aisle: "Produce",
        amount: 1,
        unit: "cup",
        name: "frozen berries",
        original: "1 cup frozen berries",
        originalName: "frozen berries",
        meta: [],
        image: "berries.jpg"
      }
    ],
    summary: "A vibrant and nutritious smoothie bowl perfect for a quick breakfast."
  },
  {
    id: 17,
    title: "Lunch Time Mediterranean Salad",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 15,
    aggregateLikes: 92,
    healthScore: 89,
    spoonacularScore: 91,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Mediterranean"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mix fresh vegetables\n2. Add olives and feta\n3. Dress with olive oil and lemon",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Salad"],
    extendedIngredients: [
      {
        id: 102,
        aisle: "Produce",
        amount: 2,
        unit: "cups",
        name: "mixed greens",
        original: "2 cups mixed greens",
        originalName: "mixed greens",
        meta: [],
        image: "greens.jpg"
      }
    ],
    summary: "A refreshing Mediterranean salad perfect for a healthy lunch."
  },
  // Additional breakfast recipes to ensure 4+ options
  {
    id: 26,
    title: "Overnight Oats with Berries",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 1,
    readyInMinutes: 480, // 8 hours overnight
    aggregateLikes: 85,
    healthScore: 92,
    spoonacularScore: 89,
    pricePerServing: 160,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mix oats with almond milk\n2. Add berries and honey\n3. Refrigerate overnight\n4. Top with nuts",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 111,
        aisle: "Cereal",
        amount: 1,
        unit: "cup",
        name: "rolled oats",
        original: "1 cup rolled oats",
        originalName: "rolled oats",
        meta: [],
        image: "oats.jpg"
      }
    ],
    summary: "Creamy overnight oats with fresh berries and crunchy nuts for a healthy breakfast."
  },
  {
    id: 27,
    title: "Avocado Toast with Poached Eggs",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 12,
    aggregateLikes: 94,
    healthScore: 88,
    spoonacularScore: 91,
    pricePerServing: 200,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Toast bread\n2. Mash avocado\n3. Poach eggs\n4. Assemble and season",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 112,
        aisle: "Bakery",
        amount: 2,
        unit: "slices",
        name: "sourdough bread",
        original: "2 slices sourdough bread",
        originalName: "sourdough bread",
        meta: [],
        image: "bread.jpg"
      }
    ],
    summary: "Classic avocado toast topped with perfectly poached eggs and a sprinkle of red pepper flakes."
  },
  // LUNCH RECIPES (4+ recipes)
  {
    id: 18,
    title: "Dinner Time Grilled Salmon",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 45,
    aggregateLikes: 156,
    healthScore: 94,
    spoonacularScore: 96,
    pricePerServing: 450,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Season salmon fillets\n2. Grill for 6-8 minutes per side\n3. Serve with vegetables",
    ketogenic: true,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 103,
        aisle: "Seafood",
        amount: 4,
        unit: "fillets",
        name: "salmon",
        original: "4 salmon fillets",
        originalName: "salmon",
        meta: [],
        image: "salmon.jpg"
      }
    ],
    summary: "Perfectly grilled salmon fillets with herbs and lemon for a healthy dinner."
  },
  // Additional lunch recipes to ensure 4+ options
  {
    id: 28,
    title: "Greek Quinoa Salad",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 20,
    aggregateLikes: 87,
    healthScore: 91,
    spoonacularScore: 88,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Greek"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Cook quinoa\n2. Mix with vegetables\n3. Add feta and olives\n4. Dress with lemon vinaigrette",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 4,
    dishTypes: ["Salad"],
    extendedIngredients: [
      {
        id: 113,
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
    summary: "Fresh Greek quinoa salad with cucumber, tomatoes, olives, and feta cheese."
  },
  {
    id: 29,
    title: "Vietnamese Pho Soup",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 40,
    aggregateLikes: 134,
    healthScore: 85,
    spoonacularScore: 89,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Vietnamese"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Simmer broth with spices\n2. Cook rice noodles\n3. Add beef and herbs\n4. Serve hot",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch", "Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 5,
    dishTypes: ["Soup"],
    extendedIngredients: [
      {
        id: 114,
        aisle: "Pasta and Rice",
        amount: 8,
        unit: "ounces",
        name: "rice noodles",
        original: "8 ounces rice noodles",
        originalName: "rice noodles",
        meta: [],
        image: "noodles.jpg"
      }
    ],
    summary: "Authentic Vietnamese pho with aromatic broth, tender beef, and fresh herbs."
  },
  {
    id: 30,
    title: "Italian Caprese Sandwich",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 10,
    aggregateLikes: 76,
    healthScore: 82,
    spoonacularScore: 84,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Toast ciabatta bread\n2. Layer mozzarella and tomatoes\n3. Add basil and balsamic\n4. Serve immediately",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 7,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 115,
        aisle: "Bakery",
        amount: 1,
        unit: "loaf",
        name: "ciabatta bread",
        original: "1 loaf ciabatta bread",
        originalName: "ciabatta bread",
        meta: [],
        image: "bread.jpg"
      }
    ],
    summary: "Classic Italian caprese sandwich with fresh mozzarella, tomatoes, and basil."
  },
  // SNACK RECIPES (4+ recipes)
  {
    id: 19,
    title: "Snack Time Energy Balls",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 12,
    readyInMinutes: 20,
    aggregateLikes: 67,
    healthScore: 87,
    spoonacularScore: 79,
    pricePerServing: 120,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mix dates and nuts\n2. Form into balls\n3. Roll in coconut",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Snack"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: false,
    whole30: false,
    weightWatcherSmartPoints: 2,
    dishTypes: ["Snack"],
    extendedIngredients: [
      {
        id: 104,
        aisle: "Produce",
        amount: 1,
        unit: "cup",
        name: "dates",
        original: "1 cup dates",
        originalName: "dates",
        meta: [],
        image: "dates.jpg"
      }
    ],
    summary: "Healthy energy balls made with dates, nuts, and coconut for a perfect snack."
  },
  // Additional snack recipes to ensure 4+ options
  {
    id: 31,
    title: "Hummus with Pita Chips",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 15,
    aggregateLikes: 89,
    healthScore: 85,
    spoonacularScore: 87,
    pricePerServing: 140,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Middle Eastern"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Blend chickpeas with tahini\n2. Add lemon and garlic\n3. Serve with pita chips",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Snack", "Appetizer"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Appetizer"],
    extendedIngredients: [
      {
        id: 116,
        aisle: "Canned and Jarred",
        amount: 1,
        unit: "can",
        name: "chickpeas",
        original: "1 can chickpeas",
        originalName: "chickpeas",
        meta: [],
        image: "chickpeas.jpg"
      }
    ],
    summary: "Creamy homemade hummus served with crispy pita chips for a healthy snack."
  },
  {
    id: 32,
    title: "Trail Mix with Dark Chocolate",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 8,
    readyInMinutes: 5,
    aggregateLikes: 73,
    healthScore: 78,
    spoonacularScore: 82,
    pricePerServing: 160,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mix nuts and dried fruits\n2. Add dark chocolate chips\n3. Store in airtight container",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Snack"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 4,
    dishTypes: ["Snack"],
    extendedIngredients: [
      {
        id: 117,
        aisle: "Nuts",
        amount: 1,
        unit: "cup",
        name: "mixed nuts",
        original: "1 cup mixed nuts",
        originalName: "mixed nuts",
        meta: [],
        image: "nuts.jpg"
      }
    ],
    summary: "Nutritious trail mix with almonds, cashews, dried cranberries, and dark chocolate chips."
  },
  {
    id: 33,
    title: "Greek Yogurt Parfait",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 8,
    aggregateLikes: 81,
    healthScore: 88,
    spoonacularScore: 85,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Layer Greek yogurt\n2. Add granola and berries\n3. Drizzle with honey",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Snack", "Breakfast"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 5,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 118,
        aisle: "Dairy",
        amount: 1,
        unit: "cup",
        name: "Greek yogurt",
        original: "1 cup Greek yogurt",
        originalName: "Greek yogurt",
        meta: [],
        image: "yogurt.jpg"
      }
    ],
    summary: "Layered Greek yogurt parfait with crunchy granola and fresh mixed berries."
  },
  // DESSERT RECIPES (4+ recipes)
  {
    id: 20,
    title: "Dessert Chocolate Lava Cake",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 25,
    aggregateLikes: 234,
    healthScore: 45,
    spoonacularScore: 89,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["French"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Mix chocolate and butter\n2. Bake in ramekins\n3. Serve warm",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 12,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 105,
        aisle: "Baking",
        amount: 4,
        unit: "ounces",
        name: "dark chocolate",
        original: "4 ounces dark chocolate",
        originalName: "dark chocolate",
        meta: [],
        image: "chocolate.jpg"
      }
    ],
    summary: "Decadent chocolate lava cakes with a molten center, perfect for dessert."
  },
  // Additional dessert recipes to ensure 4+ options
  {
    id: 34,
    title: "Berry Cheesecake",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 8,
    readyInMinutes: 180,
    aggregateLikes: 198,
    healthScore: 35,
    spoonacularScore: 92,
    pricePerServing: 320,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Make graham cracker crust\n2. Prepare cream cheese filling\n3. Top with berry compote\n4. Chill overnight",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 14,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 119,
        aisle: "Baking",
        amount: 2,
        unit: "packages",
        name: "cream cheese",
        original: "2 packages cream cheese",
        originalName: "cream cheese",
        meta: [],
        image: "cream-cheese.jpg"
      }
    ],
    summary: "Creamy New York style cheesecake topped with fresh mixed berries."
  },
  {
    id: 35,
    title: "Tiramisu",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 120,
    aggregateLikes: 245,
    healthScore: 40,
    spoonacularScore: 94,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Prepare coffee mixture\n2. Layer ladyfingers and mascarpone\n3. Dust with cocoa powder\n4. Chill for 4 hours",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 16,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 120,
        aisle: "Dairy",
        amount: 1,
        unit: "pound",
        name: "mascarpone cheese",
        original: "1 pound mascarpone cheese",
        originalName: "mascarpone cheese",
        meta: [],
        image: "mascarpone.jpg"
      }
    ],
    summary: "Classic Italian tiramisu with layers of coffee-soaked ladyfingers and creamy mascarpone."
  },
  {
    id: 36,
    title: "Apple Crumble",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 60,
    aggregateLikes: 167,
    healthScore: 55,
    spoonacularScore: 87,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Prepare apple filling\n2. Make crumble topping\n3. Bake until golden\n4. Serve warm",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 121,
        aisle: "Produce",
        amount: 6,
        unit: "apples",
        name: "apples",
        original: "6 apples",
        originalName: "apples",
        meta: [],
        image: "apples.jpg"
      }
    ],
    summary: "Warm apple crumble with a buttery oat topping, perfect with vanilla ice cream."
  },
  // APPETIZER RECIPES (4+ recipes)
  {
    id: 21,
    title: "Appetizer Bruschetta",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 12,
    aggregateLikes: 89,
    healthScore: 82,
    spoonacularScore: 85,
    pricePerServing: 150,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Italian"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Toast bread slices\n2. Top with tomato mixture\n3. Drizzle with balsamic",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Appetizer"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Appetizer"],
    extendedIngredients: [
      {
        id: 106,
        aisle: "Bakery",
        amount: 6,
        unit: "slices",
        name: "baguette",
        original: "6 slices baguette",
        originalName: "baguette",
        meta: [],
        image: "baguette.jpg"
      }
    ],
    summary: "Classic Italian bruschetta with fresh tomatoes, basil, and garlic on toasted bread."
  },
  // Additional appetizer recipes to ensure 4+ options
  {
    id: 37,
    title: "Guacamole with Tortilla Chips",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 10,
    aggregateLikes: 95,
    healthScore: 88,
    spoonacularScore: 89,
    pricePerServing: 120,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Mexican"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mash avocados\n2. Add lime juice and seasonings\n3. Serve with chips",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Appetizer", "Snack"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 2,
    dishTypes: ["Appetizer"],
    extendedIngredients: [
      {
        id: 122,
        aisle: "Produce",
        amount: 3,
        unit: "avocados",
        name: "avocados",
        original: "3 avocados",
        originalName: "avocados",
        meta: [],
        image: "avocado.jpg"
      }
    ],
    summary: "Fresh and creamy guacamole with lime, cilantro, and jalapeño served with crispy tortilla chips."
  },
  {
    id: 38,
    title: "Spinach Artichoke Dip",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 25,
    aggregateLikes: 87,
    healthScore: 65,
    spoonacularScore: 83,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Mix cream cheese and spinach\n2. Add artichokes and cheese\n3. Bake until bubbly",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Appetizer"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Appetizer"],
    extendedIngredients: [
      {
        id: 123,
        aisle: "Dairy",
        amount: 8,
        unit: "ounces",
        name: "cream cheese",
        original: "8 ounces cream cheese",
        originalName: "cream cheese",
        meta: [],
        image: "cream-cheese.jpg"
      }
    ],
    summary: "Creamy spinach and artichoke dip served warm with toasted bread or crackers."
  },
  {
    id: 39,
    title: "Spring Rolls with Peanut Sauce",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 8,
    readyInMinutes: 30,
    aggregateLikes: 92,
    healthScore: 85,
    spoonacularScore: 87,
    pricePerServing: 160,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Vietnamese"],
    dairyFree: true,
    diets: ["Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Prepare rice paper wrappers\n2. Fill with vegetables and herbs\n3. Roll tightly\n4. Serve with peanut sauce",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Appetizer"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Appetizer"],
    extendedIngredients: [
      {
        id: 124,
        aisle: "Produce",
        amount: 8,
        unit: "sheets",
        name: "rice paper",
        original: "8 sheets rice paper",
        originalName: "rice paper",
        meta: [],
        image: "rice-paper.jpg"
      }
    ],
    summary: "Fresh Vietnamese spring rolls filled with crisp vegetables and herbs, served with peanut dipping sauce."
  },
  // DINNER RECIPES (4+ recipes)
  {
    id: 22,
    title: "Slow Cooker Beef Stew",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 240,
    aggregateLikes: 178,
    healthScore: 76,
    spoonacularScore: 92,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Brown beef cubes\n2. Add vegetables and broth\n3. Cook on low for 4 hours",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 107,
        aisle: "Meat",
        amount: 2,
        unit: "pounds",
        name: "beef chuck",
        original: "2 pounds beef chuck",
        originalName: "beef chuck",
        meta: [],
        image: "beef.jpg"
      }
    ],
    summary: "Hearty beef stew cooked low and slow for maximum flavor and tenderness."
  },
  // Additional dinner recipes to ensure 4+ options
  {
    id: 40,
    title: "Indian Butter Chicken",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 45,
    aggregateLikes: 234,
    healthScore: 68,
    spoonacularScore: 94,
    pricePerServing: 420,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Indian"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Marinate chicken in spices\n2. Cook in tomato sauce\n3. Add cream and butter\n4. Serve with rice",
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
        id: 125,
        aisle: "Meat",
        amount: 2,
        unit: "pounds",
        name: "chicken thighs",
        original: "2 pounds chicken thighs",
        originalName: "chicken thighs",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Creamy Indian butter chicken with tender chicken in a rich tomato and cream sauce."
  },
  {
    id: 41,
    title: "Japanese Teriyaki Salmon",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 35,
    aggregateLikes: 189,
    healthScore: 89,
    spoonacularScore: 91,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Japanese"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Marinate salmon in teriyaki sauce\n2. Grill or bake salmon\n3. Serve with rice and vegetables",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 7,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 126,
        aisle: "Seafood",
        amount: 4,
        unit: "fillets",
        name: "salmon",
        original: "4 salmon fillets",
        originalName: "salmon",
        meta: [],
        image: "salmon.jpg"
      }
    ],
    summary: "Glazed teriyaki salmon with a sweet and savory sauce, served with steamed rice and vegetables."
  },
  {
    id: 42,
    title: "French Coq au Vin",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 90,
    aggregateLikes: 167,
    healthScore: 72,
    spoonacularScore: 89,
    pricePerServing: 450,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["French"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Brown chicken pieces\n2. Simmer in wine with vegetables\n3. Cook until tender\n4. Serve with crusty bread",
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
        id: 127,
        aisle: "Meat",
        amount: 3,
        unit: "pounds",
        name: "chicken pieces",
        original: "3 pounds chicken pieces",
        originalName: "chicken pieces",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Classic French coq au vin with tender chicken braised in red wine with mushrooms and pearl onions."
  },
  // QUICK RECIPES (15-30 min) - 4+ recipes
  {
    id: 23,
    title: "Quick 15-Minute Stir Fry",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 3,
    readyInMinutes: 15,
    aggregateLikes: 134,
    healthScore: 88,
    spoonacularScore: 87,
    pricePerServing: 260,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Asian"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Heat wok with oil\n2. Stir-fry vegetables and protein\n3. Add sauce and serve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 5,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 108,
        aisle: "Produce",
        amount: 3,
        unit: "cups",
        name: "mixed vegetables",
        original: "3 cups mixed vegetables",
        originalName: "mixed vegetables",
        meta: [],
        image: "vegetables.jpg"
      }
    ],
    summary: "Fast and flavorful stir fry with fresh vegetables and your choice of protein."
  },
  // Additional quick recipes to ensure 4+ options
  {
    id: 43,
    title: "20-Minute Chicken Tacos",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 20,
    aggregateLikes: 156,
    healthScore: 75,
    spoonacularScore: 89,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Mexican"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Season and cook chicken\n2. Warm tortillas\n3. Assemble with toppings\n4. Serve with salsa",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 128,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "chicken breast",
        original: "1 pound chicken breast",
        originalName: "chicken breast",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Quick and easy chicken tacos with fresh toppings and homemade salsa."
  },
  {
    id: 44,
    title: "25-Minute Mediterranean Pasta",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 25,
    aggregateLikes: 142,
    healthScore: 82,
    spoonacularScore: 86,
    pricePerServing: 240,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Mediterranean"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Cook pasta\n2. Sauté vegetables\n3. Add olives and feta\n4. Toss with olive oil",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 129,
        aisle: "Pasta and Rice",
        amount: 1,
        unit: "pound",
        name: "penne pasta",
        original: "1 pound penne pasta",
        originalName: "penne pasta",
        meta: [],
        image: "pasta.jpg"
      }
    ],
    summary: "Light Mediterranean pasta with cherry tomatoes, olives, and feta cheese."
  },
  {
    id: 45,
    title: "30-Minute Thai Curry",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 30,
    aggregateLikes: 178,
    healthScore: 85,
    spoonacularScore: 88,
    pricePerServing: 320,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Thai"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Simmer coconut milk\n2. Add curry paste and vegetables\n3. Cook protein\n4. Serve with rice",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 7,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 130,
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
    summary: "Aromatic Thai curry with coconut milk, vegetables, and your choice of protein."
  },
  // MEDIUM TIME RECIPES (30-60 min) - 4+ recipes
  {
    id: 24,
    title: "30-Minute Pasta Primavera",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 30,
    aggregateLikes: 145,
    healthScore: 85,
    spoonacularScore: 88,
    pricePerServing: 240,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Cook pasta\n2. Sauté spring vegetables\n3. Combine with cream sauce",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 7,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 109,
        aisle: "Pasta and Rice",
        amount: 1,
        unit: "pound",
        name: "fettuccine",
        original: "1 pound fettuccine",
        originalName: "fettuccine",
        meta: [],
        image: "fettuccine.jpg"
      }
    ],
    summary: "Fresh spring vegetables tossed with fettuccine in a light cream sauce."
  },
  // Additional medium time recipes to ensure 4+ options
  {
    id: 46,
    title: "45-Minute Beef Stir Fry",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 45,
    aggregateLikes: 167,
    healthScore: 78,
    spoonacularScore: 85,
    pricePerServing: 340,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Chinese"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Marinate beef\n2. Stir-fry vegetables\n3. Cook beef separately\n4. Combine with sauce",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 9,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 131,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "beef strips",
        original: "1 pound beef strips",
        originalName: "beef strips",
        meta: [],
        image: "beef.jpg"
      }
    ],
    summary: "Tender beef stir fry with colorful vegetables in a savory sauce."
  },
  {
    id: 47,
    title: "50-Minute Chicken Curry",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 50,
    aggregateLikes: 189,
    healthScore: 72,
    spoonacularScore: 87,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Indian"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Brown chicken pieces\n2. Simmer in curry sauce\n3. Add vegetables\n4. Serve with rice",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 132,
        aisle: "Meat",
        amount: 2,
        unit: "pounds",
        name: "chicken pieces",
        original: "2 pounds chicken pieces",
        originalName: "chicken pieces",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Spicy chicken curry with aromatic spices and tender vegetables."
  },
  {
    id: 48,
    title: "55-Minute Lasagna",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 8,
    readyInMinutes: 55,
    aggregateLikes: 234,
    healthScore: 65,
    spoonacularScore: 91,
    pricePerServing: 360,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Prepare meat sauce\n2. Layer pasta and cheese\n3. Bake until bubbly\n4. Let rest before serving",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 12,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 133,
        aisle: "Pasta and Rice",
        amount: 1,
        unit: "box",
        name: "lasagna noodles",
        original: "1 box lasagna noodles",
        originalName: "lasagna noodles",
        meta: [],
        image: "lasagna.jpg"
      }
    ],
    summary: "Classic Italian lasagna with layers of pasta, meat sauce, and melted cheese."
  },
  // LONG TIME RECIPES (60+ min) - 4+ recipes
  {
    id: 25,
    title: "60-Minute Sunday Roast",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 60,
    aggregateLikes: 198,
    healthScore: 72,
    spoonacularScore: 94,
    pricePerServing: 420,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["British"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Season roast\n2. Roast with vegetables\n3. Rest and carve",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 9,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 110,
        aisle: "Meat",
        amount: 3,
        unit: "pounds",
        name: "beef roast",
        original: "3 pounds beef roast",
        originalName: "beef roast",
        meta: [],
        image: "roast.jpg"
      }
    ],
    summary: "Traditional Sunday roast with tender beef and roasted vegetables."
  },
  // Additional long time recipes to ensure 4+ options
  {
    id: 49,
    title: "90-Minute Beef Bourguignon",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 90,
    aggregateLikes: 245,
    healthScore: 68,
    spoonacularScore: 96,
    pricePerServing: 480,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["French"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Brown beef cubes\n2. Simmer in red wine\n3. Add vegetables\n4. Cook until tender",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 11,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 134,
        aisle: "Meat",
        amount: 2,
        unit: "pounds",
        name: "beef chuck",
        original: "2 pounds beef chuck",
        originalName: "beef chuck",
        meta: [],
        image: "beef.jpg"
      }
    ],
    summary: "Classic French beef bourguignon with tender beef braised in red wine with mushrooms and pearl onions."
  },
  {
    id: 50,
    title: "120-Minute Osso Buco",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 120,
    aggregateLikes: 189,
    healthScore: 65,
    spoonacularScore: 92,
    pricePerServing: 520,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Italian"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Brown veal shanks\n2. Braise in wine and broth\n3. Cook until falling off bone\n4. Serve with gremolata",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
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
        id: 135,
        aisle: "Meat",
        amount: 4,
        unit: "pieces",
        name: "veal shanks",
        original: "4 pieces veal shanks",
        originalName: "veal shanks",
        meta: [],
        image: "veal.jpg"
      }
    ],
    summary: "Traditional Italian osso buco with tender veal shanks braised in white wine and broth."
  },
  {
    id: 51,
    title: "180-Minute Pulled Pork",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 8,
    readyInMinutes: 180,
    aggregateLikes: 267,
    healthScore: 58,
    spoonacularScore: 94,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Season pork shoulder\n2. Slow cook with barbecue sauce\n3. Shred meat\n4. Serve on buns",
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
        id: 136,
        aisle: "Meat",
        amount: 4,
        unit: "pounds",
        name: "pork shoulder",
        original: "4 pounds pork shoulder",
        originalName: "pork shoulder",
        meta: [],
        image: "pork.jpg"
      }
    ],
    summary: "Tender pulled pork slow-cooked with barbecue sauce, perfect for sandwiches or tacos."
  },
  // Additional recipes to ensure every filter option has at least 4 recipes
  {
    id: 52,
    title: "Gluten-Free Quinoa Breakfast Bowl",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 25,
    aggregateLikes: 89,
    healthScore: 92,
    spoonacularScore: 89,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Gluten-Free", "Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Cook quinoa with almond milk\n2. Top with berries and nuts\n3. Drizzle with maple syrup",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 137,
        aisle: "Grains",
        amount: 1,
        unit: "cup",
        name: "quinoa",
        original: "1 cup quinoa",
        originalName: "quinoa",
        meta: [],
        image: "quinoa.jpg"
      }
    ],
    summary: "A nutritious gluten-free breakfast bowl with quinoa, fresh berries, and crunchy nuts."
  },
  {
    id: 53,
    title: "Dairy-Free Chocolate Smoothie",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 1,
    readyInMinutes: 5,
    aggregateLikes: 76,
    healthScore: 78,
    spoonacularScore: 85,
    pricePerServing: 150,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Dairy-Free", "Vegan"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Blend almond milk with cocoa powder\n2. Add banana and dates\n3. Blend until smooth",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 4,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 138,
        aisle: "Produce",
        amount: 1,
        unit: "large",
        name: "banana",
        original: "1 large banana",
        originalName: "banana",
        meta: [],
        image: "banana.jpg"
      }
    ],
    summary: "A rich and creamy dairy-free chocolate smoothie perfect for breakfast or snack."
  },
  {
    id: 54,
    title: "Keto Avocado Toast",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 1,
    readyInMinutes: 10,
    aggregateLikes: 82,
    healthScore: 88,
    spoonacularScore: 87,
    pricePerServing: 200,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Keto", "Low-Carb"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Toast keto bread\n2. Mash avocado with lime\n3. Top with microgreens",
    ketogenic: true,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 139,
        aisle: "Produce",
        amount: 1,
        unit: "medium",
        name: "avocado",
        original: "1 medium avocado",
        originalName: "avocado",
        meta: [],
        image: "avocado.jpg"
      }
    ],
    summary: "A keto-friendly avocado toast using low-carb bread for a healthy breakfast."
  },
  {
    id: 55,
    title: "Paleo Sweet Potato Hash",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 30,
    aggregateLikes: 91,
    healthScore: 85,
    spoonacularScore: 88,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Paleo"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Dice sweet potatoes and cook\n2. Add ground turkey and vegetables\n3. Season with herbs",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Breakfast"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 7,
    dishTypes: ["Breakfast"],
    extendedIngredients: [
      {
        id: 140,
        aisle: "Produce",
        amount: 2,
        unit: "medium",
        name: "sweet potatoes",
        original: "2 medium sweet potatoes",
        originalName: "sweet potatoes",
        meta: [],
        image: "sweet-potato.jpg"
      }
    ],
    summary: "A hearty paleo breakfast hash with sweet potatoes, ground turkey, and fresh vegetables."
  },
  {
    id: 56,
    title: "Low-Carb Cauliflower Rice",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 20,
    aggregateLikes: 85,
    healthScore: 90,
    spoonacularScore: 86,
    pricePerServing: 120,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Low-Carb", "Keto"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Grate cauliflower into rice\n2. Sauté with garlic and herbs\n3. Season to taste",
    ketogenic: true,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 2,
    dishTypes: ["Side Dish"],
    extendedIngredients: [
      {
        id: 141,
        aisle: "Produce",
        amount: 1,
        unit: "head",
        name: "cauliflower",
        original: "1 head cauliflower",
        originalName: "cauliflower",
        meta: [],
        image: "cauliflower.jpg"
      }
    ],
    summary: "A healthy low-carb alternative to rice made with fresh cauliflower and aromatic herbs."
  },
  {
    id: 57,
    title: "Greek Moussaka",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 90,
    aggregateLikes: 156,
    healthScore: 72,
    spoonacularScore: 91,
    pricePerServing: 450,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Greek"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Layer eggplant with ground lamb\n2. Add béchamel sauce\n3. Bake until golden",
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
        id: 142,
        aisle: "Produce",
        amount: 2,
        unit: "large",
        name: "eggplants",
        original: "2 large eggplants",
        originalName: "eggplants",
        meta: [],
        image: "eggplant.jpg"
      }
    ],
    summary: "Traditional Greek moussaka with layers of eggplant, ground lamb, and creamy béchamel sauce."
  },
  {
    id: 58,
    title: "French Coq au Vin",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 120,
    aggregateLikes: 178,
    healthScore: 68,
    spoonacularScore: 93,
    pricePerServing: 520,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["French"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Braise chicken in red wine\n2. Add mushrooms and pearl onions\n3. Simmer until tender",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 18,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 143,
        aisle: "Meat",
        amount: 4,
        unit: "pieces",
        name: "chicken thighs",
        original: "4 pieces chicken thighs",
        originalName: "chicken thighs",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Classic French coq au vin with tender chicken braised in red wine with mushrooms and pearl onions."
  },
  {
    id: 59,
    title: "Japanese Miso Soup",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 15,
    aggregateLikes: 94,
    healthScore: 88,
    spoonacularScore: 87,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Japanese"],
    dairyFree: true,
    diets: ["Vegan", "Gluten-Free"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Boil dashi stock\n2. Add miso paste and tofu\n3. Garnish with green onions",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 2,
    dishTypes: ["Soup"],
    extendedIngredients: [
      {
        id: 144,
        aisle: "Canned and Jarred",
        amount: 4,
        unit: "tablespoons",
        name: "miso paste",
        original: "4 tablespoons miso paste",
        originalName: "miso paste",
        meta: [],
        image: "miso.jpg"
      }
    ],
    summary: "Traditional Japanese miso soup with tofu, seaweed, and green onions in a flavorful dashi broth."
  },
  {
    id: 60,
    title: "Chinese Kung Pao Chicken",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 35,
    aggregateLikes: 167,
    healthScore: 74,
    spoonacularScore: 89,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Chinese"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Stir-fry chicken with vegetables\n2. Add spicy sauce and peanuts\n3. Serve over rice",
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
        id: 145,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "chicken breast",
        original: "1 pound chicken breast",
        originalName: "chicken breast",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Spicy Chinese kung pao chicken with tender chicken, crunchy peanuts, and vibrant vegetables."
  },
  {
    id: 61,
    title: "Thai Green Curry",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 45,
    aggregateLikes: 145,
    healthScore: 76,
    spoonacularScore: 88,
    pricePerServing: 420,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Thai"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Simmer coconut milk with green curry paste\n2. Add chicken and vegetables\n3. Serve with jasmine rice",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
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
        id: 146,
        aisle: "Canned and Jarred",
        amount: 2,
        unit: "tablespoons",
        name: "green curry paste",
        original: "2 tablespoons green curry paste",
        originalName: "green curry paste",
        meta: [],
        image: "curry-paste.jpg"
      }
    ],
    summary: "Aromatic Thai green curry with tender chicken, fresh vegetables, and creamy coconut milk."
  },
  {
    id: 62,
    title: "Indian Butter Chicken",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 60,
    aggregateLikes: 189,
    healthScore: 70,
    spoonacularScore: 92,
    pricePerServing: 480,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Indian"],
    dairyFree: false,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Marinate chicken in yogurt and spices\n2. Grill until charred\n3. Simmer in tomato cream sauce",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: false,
    vegan: false,
    vegetarian: false,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 16,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 147,
        aisle: "Meat",
        amount: 1.5,
        unit: "pounds",
        name: "chicken thighs",
        original: "1.5 pounds chicken thighs",
        originalName: "chicken thighs",
        meta: [],
        image: "chicken.jpg"
      }
    ],
    summary: "Creamy Indian butter chicken with tender chicken in a rich tomato and cream sauce."
  },
  {
    id: 63,
    title: "Middle Eastern Falafel",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 6,
    readyInMinutes: 40,
    aggregateLikes: 134,
    healthScore: 82,
    spoonacularScore: 86,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Middle Eastern"],
    dairyFree: true,
    diets: ["Vegan", "Vegetarian"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Blend chickpeas with herbs and spices\n2. Form into patties\n3. Fry until golden brown",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Lunch"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 148,
        aisle: "Canned and Jarred",
        amount: 2,
        unit: "cups",
        name: "chickpeas",
        original: "2 cups chickpeas",
        originalName: "chickpeas",
        meta: [],
        image: "chickpeas.jpg"
      }
    ],
    summary: "Crispy Middle Eastern falafel made with chickpeas, fresh herbs, and aromatic spices."
  },
  {
    id: 64,
    title: "Mexican Street Tacos",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 25,
    aggregateLikes: 156,
    healthScore: 78,
    spoonacularScore: 90,
    pricePerServing: 320,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Mexican"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Season and grill carne asada\n2. Warm corn tortillas\n3. Top with onions and cilantro",
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
        id: 149,
        aisle: "Meat",
        amount: 1,
        unit: "pound",
        name: "carne asada",
        original: "1 pound carne asada",
        originalName: "carne asada",
        meta: [],
        image: "beef.jpg"
      }
    ],
    summary: "Authentic Mexican street tacos with tender carne asada, fresh onions, and cilantro."
  },
  {
    id: 65,
    title: "Italian Risotto ai Funghi",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 50,
    aggregateLikes: 167,
    healthScore: 76,
    spoonacularScore: 89,
    pricePerServing: 380,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Italian"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Sauté mushrooms and onions\n2. Add arborio rice gradually\n3. Finish with parmesan cheese",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 12,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 150,
        aisle: "Produce",
        amount: 1,
        unit: "pound",
        name: "mixed mushrooms",
        original: "1 pound mixed mushrooms",
        originalName: "mixed mushrooms",
        meta: [],
        image: "mushrooms.jpg"
      }
    ],
    summary: "Creamy Italian mushroom risotto with arborio rice, wild mushrooms, and parmesan cheese."
  },
  {
    id: 66,
    title: "Mediterranean Grilled Fish",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 30,
    aggregateLikes: 145,
    healthScore: 88,
    spoonacularScore: 87,
    pricePerServing: 420,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["Mediterranean"],
    dairyFree: true,
    diets: ["High-Protein"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Season fish with herbs and lemon\n2. Grill until flaky\n3. Serve with vegetables",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: false,
    vegetarian: false,
    veryHealthy: true,
    veryPopular: true,
    whole30: true,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Main Course"],
    extendedIngredients: [
      {
        id: 151,
        aisle: "Seafood",
        amount: 2,
        unit: "fillets",
        name: "sea bass",
        original: "2 fillets sea bass",
        originalName: "sea bass",
        meta: [],
        image: "fish.jpg"
      }
    ],
    summary: "Fresh Mediterranean grilled sea bass with herbs, lemon, and seasonal vegetables."
  },
  {
    id: 67,
    title: "Asian Stir-Fried Vegetables",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 4,
    readyInMinutes: 20,
    aggregateLikes: 98,
    healthScore: 92,
    spoonacularScore: 85,
    pricePerServing: 180,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["Asian"],
    dairyFree: true,
    diets: ["Vegan", "Vegetarian"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Heat wok with oil\n2. Stir-fry vegetables quickly\n3. Add soy sauce and sesame oil",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dinner"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 3,
    dishTypes: ["Side Dish"],
    extendedIngredients: [
      {
        id: 152,
        aisle: "Produce",
        amount: 4,
        unit: "cups",
        name: "mixed vegetables",
        original: "4 cups mixed vegetables",
        originalName: "mixed vegetables",
        meta: [],
        image: "vegetables.jpg"
      }
    ],
    summary: "Quick and healthy Asian stir-fried vegetables with soy sauce and sesame oil."
  },
  {
    id: 68,
    title: "Chocolate Lava Cake",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 25,
    aggregateLikes: 234,
    healthScore: 45,
    spoonacularScore: 95,
    pricePerServing: 280,
    analyzedInstructions: [],
    cheap: false,
    cuisines: ["French"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: false,
    instructions: "1. Melt chocolate and butter\n2. Mix with eggs and flour\n3. Bake until edges are set",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: false,
    vegan: false,
    vegetarian: true,
    veryHealthy: false,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 18,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 153,
        aisle: "Baking",
        amount: 4,
        unit: "ounces",
        name: "dark chocolate",
        original: "4 ounces dark chocolate",
        originalName: "dark chocolate",
        meta: [],
        image: "chocolate.jpg"
      }
    ],
    summary: "Decadent French chocolate lava cake with a molten center and crisp exterior."
  },
  {
    id: 69,
    title: "Berry Parfait",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 2,
    readyInMinutes: 15,
    aggregateLikes: 112,
    healthScore: 78,
    spoonacularScore: 88,
    pricePerServing: 220,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: false,
    diets: ["Vegetarian"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Layer yogurt with berries\n2. Add granola and honey\n3. Top with fresh mint",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Dessert"],
    sustainable: true,
    vegan: false,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 8,
    dishTypes: ["Dessert"],
    extendedIngredients: [
      {
        id: 154,
        aisle: "Produce",
        amount: 1,
        unit: "cup",
        name: "mixed berries",
        original: "1 cup mixed berries",
        originalName: "mixed berries",
        meta: [],
        image: "berries.jpg"
      }
    ],
    summary: "A light and refreshing berry parfait with Greek yogurt, fresh berries, and crunchy granola."
  },
  {
    id: 70,
    title: "Trail Mix Snack",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    imageType: "jpg",
    servings: 8,
    readyInMinutes: 5,
    aggregateLikes: 89,
    healthScore: 82,
    spoonacularScore: 84,
    pricePerServing: 150,
    analyzedInstructions: [],
    cheap: true,
    cuisines: ["American"],
    dairyFree: true,
    diets: ["Vegan", "Vegetarian"],
    gaps: "GAPS",
    glutenFree: true,
    instructions: "1. Mix nuts and dried fruits\n2. Add seeds and chocolate chips\n3. Store in airtight container",
    ketogenic: false,
    lowFodmap: false,
    occasions: ["Snack"],
    sustainable: true,
    vegan: true,
    vegetarian: true,
    veryHealthy: true,
    veryPopular: true,
    whole30: false,
    weightWatcherSmartPoints: 6,
    dishTypes: ["Snack"],
    extendedIngredients: [
      {
        id: 155,
        aisle: "Nuts",
        amount: 1,
        unit: "cup",
        name: "mixed nuts",
        original: "1 cup mixed nuts",
        originalName: "mixed nuts",
        meta: [],
        image: "nuts.jpg"
      }
    ],
    summary: "A healthy and energizing trail mix with nuts, dried fruits, and dark chocolate chips."
  }
];

// Add enhanced mock recipes to the main array
mockRecipes.push(...additionalMockRecipes);

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

// API Service Class - BETA: Mock data as default with background API calls
class RecipeApiService {
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor() {
    // Log the API configuration for debugging
    if (CONFIG.LOG_API_ERRORS) {
      console.log('API Service initialized');
    }
  }



  // Rate limiting helper
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Basic rate limiting: max 10 requests per minute
    if (this.requestCount >= 10 && timeSinceLastRequest < 60000) {
      const waitTime = 60000 - timeSinceLastRequest;
      console.warn(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      // Instead of throwing an error, wait and reset
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
      // Add delay between requests to prevent rate limiting
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

      // Retry logic for retryable errors
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

  private isRetryableError(error: { code?: string; name?: string }): boolean {
    return error.code === 'RATE_LIMIT_ERROR' ||
      error.code === 'SERVER_ERROR' ||
      error.code === 'TIMEOUT_ERROR' ||
      error.name === 'AbortError';
  }

  // Enhanced error handling with fallback
  private handleApiError<T>(error: unknown, fallbackData: T): T {
    if (CONFIG.LOG_API_ERRORS) {
      console.error('API Error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as { code?: string })?.code,
        retryable: (error as { retryable?: boolean })?.retryable,
        details: (error as { details?: unknown })?.details
      });
    }

    if (CONFIG.USE_MOCK_DATA_FALLBACK) {
      console.log('Falling back to mock data due to API error');
      return fallbackData;
    }

    throw error;
  }

  // REFACTORED: Search recipes with instant mock data and optional API fallback
  // To switch back to full API: replace this with direct API call and remove mock fallback
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    // REFACTORED: Use local filter service for instant results
    // This provides immediate filtering without API calls
    const filterService = (await import('./filterService')).recipeFilterService;
    const result = filterService.filterRecipes(params);

    // REFACTORED: Optional API call in background (only if daily limit not reached)
    // To disable API calls: remove this try-catch block
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

      // REFACTORED: Replace mock data with API response if successful
      // To keep mock data only: remove this return
      return apiResult;
    } catch (error) {
      console.log('REFACTORED: API call failed, using instant mock data:', error);
      // Return mock data result
      return {
        results: result.recipes,
        offset: result.offset,
        number: result.number,
        totalResults: result.totalResults
      };
    }
  }



  // REFACTORED: Search recipes by ingredients with instant mock data
  // To switch back to full API: replace this with direct API call
  async searchRecipesByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Promise<Recipe[]> {
    // REFACTORED: Use local filter service for instant results
    const filterService = (await import('./filterService')).recipeFilterService;
    const mockResults = filterService.searchByIngredients(ingredients, maxMissingIngredients);

    // REFACTORED: Optional API call in background
    // To disable API calls: remove this try-catch block
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

      const result = await this.makeRequest<{ results: Array<{ missedIngredientCount: number }> }>(`${API_BASE_URL}/findByIngredients?${ingredientParams}`);

      // REFACTORED: Return API results if successful
      // To keep mock data only: remove this return
      return result.results || [];
    } catch (error) {
      console.log('REFACTORED: API call failed, using instant mock data:', error);
      return mockResults;
    }
  }

  // REFACTORED: Get detailed recipe information with instant mock data
  // To switch back to full API: replace this with direct API call
  async getRecipeDetails(recipeId: number): Promise<RecipeDetailResponse> {
    // REFACTORED: Use local filter service for instant results
    const filterService = (await import('./filterService')).recipeFilterService;
    const mockRecipe = filterService.getRecipeDetails(recipeId);

    if (!mockRecipe) {
      throw new Error(`Recipe with id ${recipeId} not found`);
    }

    // REFACTORED: Optional API call in background
    // To disable API calls: remove this try-catch block
    try {
      await this.checkRateLimit();

      const detailParams = buildQueryParams({ apiKey: API_KEY });
      const result = await this.makeRequest<RecipeDetailResponse>(`${API_BASE_URL}/${recipeId}/information?${detailParams}`);

      // REFACTORED: Return API results if successful
      // To keep mock data only: remove this return
      return result;
    } catch (error) {
      console.log('REFACTORED: API call failed, using instant mock data:', error);
      return this.getMockRecipeDetails(recipeId);
    }
  }

  // REFACTORED: Get available filter options with instant mock data
  // To switch back to full API: replace this with direct API call
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    // REFACTORED: Use local filter service for instant results
    const filterService = (await import('./filterService')).recipeFilterService;
    return filterService.getFilterOptions();
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

    // Apply meal type filter
    if (params.type) {
      const mealType = params.type.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Check dishTypes array
        if (recipe.dishTypes.some(dishType =>
          dishType.toLowerCase().includes(mealType)
        )) {
          return true;
        }

        // Check occasions array
        if (recipe.occasions.some(occasion =>
          occasion.toLowerCase().includes(mealType)
        )) {
          return true;
        }

        // Check title for meal type keywords
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

    // Apply maxReadyTime filter (BETA: Enhanced time range filtering)
    if (params.maxReadyTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.readyInMinutes <= params.maxReadyTime!
      );
    }

    // Apply intolerances filter (exclude recipes with these ingredients)
    if (params.intolerances && params.intolerances.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        // For mock data, we'll do a simple check against recipe properties
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

    if (filteredRecipes.length === 0) {
      console.log('No matching recipes found in mock data for filters:', params);
      return {
        results: [],
        offset: offset,
        number: number,
        totalResults: 0
      };
    }

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

