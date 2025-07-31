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
const buildQueryParams = (params: Record<string, any>): string => {
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

  constructor() {
    this.useMockData = !API_KEY || API_KEY === 'your-api-key-here';
  }

  // Search recipes with various filters
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    if (this.useMockData) {
      return this.getMockSearchResults(params);
    }

    try {
      const queryParams = buildQueryParams({
        ...params,
        apiKey: API_KEY,
        addRecipeInformation: true,
        fillIngredients: true,
        number: params.number || 20
      });

      const response = await fetch(`${API_BASE_URL}/complexSearch?${queryParams}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching recipes:', error);
      // Fallback to mock data on error
      return this.getMockSearchResults(params);
    }
  }

  // Get detailed recipe information
  async getRecipeDetails(recipeId: number): Promise<RecipeDetailResponse> {
    if (this.useMockData) {
      return this.getMockRecipeDetails(recipeId);
    }

    try {
      const queryParams = buildQueryParams({
        apiKey: API_KEY,
        addRecipeInformation: true,
        fillIngredients: true,
        addWinePairing: true,
        addTasteData: true
      });

      const response = await fetch(`${API_BASE_URL}/${recipeId}/information?${queryParams}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      // Fallback to mock data on error
      return this.getMockRecipeDetails(recipeId);
    }
  }

  // Get available filter options
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    if (this.useMockData) {
      return this.getMockFilterOptions();
    }

    try {
      const [cuisinesResponse, dietsResponse, intolerancesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/cuisines?apiKey=${API_KEY}`),
        fetch(`${API_BASE_URL}/diets?apiKey=${API_KEY}`),
        fetch(`${API_BASE_URL}/intolerances?apiKey=${API_KEY}`)
      ]);

      const [cuisines, diets, intolerances] = await Promise.all([
        cuisinesResponse.json(),
        dietsResponse.json(),
        intolerancesResponse.json()
      ]);

      return {
        cuisines: cuisines.map((c: any) => ({ name: c.cuisine, value: c.cuisine })),
        diets: diets.map((d: any) => ({ name: d.name, value: d.name })),
        intolerances: intolerances.map((i: any) => ({ name: i.name, value: i.name })),
        mealTypes: [
          { name: "Breakfast", value: "breakfast" },
          { name: "Lunch", value: "lunch" },
          { name: "Dinner", value: "dinner" },
          { name: "Snack", value: "snack" }
        ]
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return this.getMockFilterOptions();
    }
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
        { name: "Breakfast", value: "breakfast" },
        { name: "Lunch", value: "lunch" },
        { name: "Dinner", value: "dinner" },
        { name: "Snack", value: "snack" }
      ]
    };
  }
}

// Export singleton instance
export const recipeApiService = new RecipeApiService();

// Export individual functions for convenience
export const searchRecipes = (params: RecipeSearchParams) => recipeApiService.searchRecipes(params);
export const getRecipeDetails = (recipeId: number) => recipeApiService.getRecipeDetails(recipeId);
export const getFilterOptions = () => recipeApiService.getFilterOptions();
