// Filter Service - Handles recipe filtering with API-first approach and mock data fallback
// This service tries to use the API first, then falls back to mock data if the API fails
// It provides a consistent interface for recipe searching regardless of whether the API is working

import type { Recipe, RecipeSearchParams } from '../types/recipeTypes';
import { mockRecipes } from './mockData'; // Import mock data for fallback when API is unavailable
import { recipeApiService } from './apiService'; // Import API service for API-first approach

// Interface for filter results
// This defines what the filter service returns when searching for recipes
export interface FilterResult {
  recipes: Recipe[];        // Array of recipes that match the search criteria
  totalResults: number;     // Total number of recipes that match (for pagination)
  offset: number;          // Starting position of results (for pagination)
  number: number;          // Number of recipes returned in this batch
  isMockData: boolean;     // Indicates whether mock data was used (true) or API data (false)
}

// Main Filter Service Class - Handles all recipe filtering operations
// This class provides a unified interface for recipe searching with automatic fallback
export class RecipeFilterService {
  private static instance: RecipeFilterService;  // Singleton instance
  private allRecipes: Recipe[] = [];             // Local copy of all mock recipes

  // Private constructor for singleton pattern
  // This ensures only one instance of the filter service exists
  private constructor() {
    // Initialize with all mock recipes for fallback
    this.allRecipes = [...mockRecipes];
  }

  // Get singleton instance of the filter service
  // This ensures we only have one filter service throughout the app
  public static getInstance(): RecipeFilterService {
    if (!RecipeFilterService.instance) {
      RecipeFilterService.instance = new RecipeFilterService();
    }
    return RecipeFilterService.instance;
  }

  /**
   * Main filtering function - tries API first, falls back to mock data
   * @param params - Search parameters (query, cuisine, diet, etc.)
   * @returns Filtered recipe results with metadata
   * 
   * This is the main function for searching recipes. It first tries to use the
   * Spoonacular API, and if that fails, it falls back to local mock data.
   * This ensures the app always works, even when the API is down.
   */
  public async filterRecipes(params: RecipeSearchParams): Promise<FilterResult> {
    try {
      // Try to use the API first
      const apiResult = await recipeApiService.searchRecipes(params);
      return {
        recipes: apiResult.results,
        totalResults: apiResult.totalResults,
        offset: apiResult.offset,
        number: apiResult.number,
        isMockData: false  // API was successful
      };
    } catch (error) {
      // If API fails, use mock data
      const mockResult = this.getMockSearchResults(params);
      return mockResult;
    }
  }

  /**
   * Get all recipes for favorites or other use cases
   * @returns Array of all available recipes
   * 
   * This function returns all recipes, either from the API or mock data.
   * It's used when we need a complete list of recipes (like for favorites).
   */
  public async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Try to get recipes from API with default search
      const apiResult = await recipeApiService.searchRecipes({ number: 100 });
      return apiResult.results;
    } catch (error) {
      // If API fails, use mock data
      return [...this.allRecipes];
    }
  }

  /**
   * Search recipes by ingredients with API-first approach
   * @param ingredients - Array of ingredient names to search for
   * @param maxMissingIngredients - Maximum number of missing ingredients allowed
   * @returns Array of recipes that can be made with the given ingredients
   * 
   * This function finds recipes that can be made with the ingredients the user has.
   * It allows for some missing ingredients (up to maxMissingIngredients) to be flexible.
   */
  public async searchByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Promise<Recipe[]> {
    console.log('FilterService: searchByIngredients called with:', ingredients, 'maxMissing:', maxMissingIngredients);

    try {
      console.log('FilterService: Trying API first...');
      // Try API first
      const apiResult = await recipeApiService.searchRecipesByIngredients(ingredients, maxMissingIngredients);
      console.log('FilterService: API successful, returned', apiResult.length, 'recipes');
      return apiResult;
    } catch (error) {
      console.log('FilterService: API failed, using mock data. Error:', error);
      // If API fails, use mock data
      const mockResult = this.getMockRecipesByIngredients(ingredients, maxMissingIngredients);
      console.log('FilterService: Mock data returned', mockResult.length, 'recipes');
      return mockResult;
    }
  }

  /**
   * Get recipe details with API-first approach
   * @param recipeId - The unique ID of the recipe
   * @returns Recipe details or null if not found
   * 
   * This function gets detailed information about a specific recipe.
   * It tries the API first, then falls back to mock data if needed.
   */
  public async getRecipeDetails(recipeId: number): Promise<Recipe | null> {
    try {
      // Try API first
      const apiResult = await recipeApiService.getRecipeDetails(recipeId);
      return apiResult;
    } catch (error) {
      // If API fails, use mock data
      return this.allRecipes.find(recipe => recipe.id === recipeId) || null;
    }
  }

  /**
   * Get filter options - uses mock data since API doesn't provide this endpoint
   * @returns Object containing all available filter options
   * 
   * This function returns all the available options for filtering recipes.
   * It includes cuisines, diets, intolerances, meal types, and time preferences.
   * Since the API doesn't provide this data, we use predefined mock options.
   */
  public getFilterOptions() {
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

  // ===== MOCK DATA FALLBACK METHODS =====

  /**
   * Filter mock recipes based on search parameters
   * @param params - Search parameters to filter by
   * @returns Filtered recipe results using mock data
   * 
   * This function filters the local mock recipes based on the search parameters.
   * It's used as a fallback when the API is unavailable.
   */
  private getMockSearchResults(params: RecipeSearchParams): FilterResult {
    let filteredRecipes = [...this.allRecipes];

    // Filter by search query (title, summary, or ingredients)
    // This allows users to search for recipes by name, description, or ingredients
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.summary?.toLowerCase().includes(query) ||
        recipe.extendedIngredients.some(ingredient =>
          ingredient.name.toLowerCase().includes(query)
        )
      );
    }

    // Filter by diet preference
    // Only show recipes that match the selected dietary restrictions
    if (params.diet) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.diets.includes(params.diet!)
      );
    }

    // Filter by cuisine type
    // Only show recipes from the selected cuisine
    if (params.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.cuisines.includes(params.cuisine!)
      );
    }

    // Filter by meal type (breakfast, lunch, dinner, etc.)
    // This checks multiple fields to find recipes that match the meal type
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

    // Filter by maximum cooking time
    // Only show recipes that can be made within the specified time limit
    if (params.maxReadyTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.readyInMinutes <= params.maxReadyTime!
      );
    }

    // Filter by food intolerances
    // Exclude recipes that contain ingredients the user can't eat
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

    // Apply pagination to results
    // This allows the app to show recipes in smaller batches for better performance
    const offset = params.offset || 0;
    const number = params.number || 20;
    const paginatedRecipes = filteredRecipes.slice(offset, offset + number);

    return {
      recipes: paginatedRecipes,
      totalResults: filteredRecipes.length,
      offset: offset,
      number: number,
      isMockData: true  // Indicates that mock data was used
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
    console.log('FilterService: getMockRecipesByIngredients called with:', ingredients, 'maxMissing:', maxMissingIngredients);
    console.log('FilterService: Total mock recipes available:', this.allRecipes.length);
    console.log('FilterService: First few recipes:', this.allRecipes.slice(0, 3).map(r => ({ title: r.title, ingredients: r.extendedIngredients.map(i => i.name) })));

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

    const results = this.allRecipes.filter(recipe => {
      const recipeIngredients = recipe.extendedIngredients.map((ing: any) => ing.name.toLowerCase());
      console.log(`FilterService: Recipe "${recipe.title}" has ingredients:`, recipeIngredients);
      console.log(`FilterService: User searching for ingredients:`, ingredients);

      // Count how many user ingredients match with recipe ingredients
      const matchedCount = ingredients.filter((userIng: string) => {
        const userLower = userIng.toLowerCase().trim();
        const hasMatch = recipeIngredients.some(recipeIng => {
          const match = ingredientsMatch(userLower, recipeIng);
          if (match) {
            console.log(`FilterService: ✓ "${userLower}" matches "${recipeIng}" in recipe "${recipe.title}"`);
          }
          return match;
        });
        if (!hasMatch) {
          console.log(`FilterService: ✗ "${userLower}" has no match in recipe "${recipe.title}"`);
        }
        return hasMatch;
      }).length;

      const missingCount = ingredients.length - matchedCount;
      console.log(`FilterService: Recipe "${recipe.title}" matched: ${matchedCount}, missing: ${missingCount}, max allowed: ${maxMissingIngredients}`);

      const shouldInclude = missingCount <= maxMissingIngredients;
      console.log(`FilterService: Recipe "${recipe.title}" included:`, shouldInclude);

      return shouldInclude;
    });

    console.log('FilterService: Final results count:', results.length);
    return results;
  }
}

// Create and export singleton instance
// This ensures we only have one filter service throughout the app
export const recipeFilterService = RecipeFilterService.getInstance();

// Export convenience functions for easy use in other parts of the app
// These functions provide a simple interface to the filter service
export const filterRecipes = (params: RecipeSearchParams) => recipeFilterService.filterRecipes(params);
export const getAllRecipes = () => recipeFilterService.getAllRecipes();
export const searchByIngredients = (ingredients: string[], maxMissing: number = 3) => recipeFilterService.searchByIngredients(ingredients, maxMissing);
export const getRecipeDetails = (recipeId: number) => recipeFilterService.getRecipeDetails(recipeId);
export const getFilterOptions = () => recipeFilterService.getFilterOptions();
