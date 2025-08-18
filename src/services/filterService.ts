// REFACTORED: Local Filter Service for Instant Recipe Filtering
// This service provides instant filtering on mock data while maintaining API compatibility
// To switch back to full API: replace filterService calls with direct API calls

import type { Recipe, RecipeSearchParams } from '../types/recipeTypes';
import { mockRecipes } from './mockData'; // Import mock data from separate file

export interface FilterResult {
  recipes: Recipe[];
  totalResults: number;
  offset: number;
  number: number;
  isMockData: boolean; // Label for easy API switching
}

export class RecipeFilterService {
  private static instance: RecipeFilterService;
  private allRecipes: Recipe[] = [];

  private constructor() {
    // Initialize with all mock recipes
    this.allRecipes = [...mockRecipes];
  }

  public static getInstance(): RecipeFilterService {
    if (!RecipeFilterService.instance) {
      RecipeFilterService.instance = new RecipeFilterService();
    }
    return RecipeFilterService.instance;
  }

  /**
   * REFACTORED: Instant local filtering with mock data
   * This provides immediate results without API calls
   * To switch back to API: replace this with searchRecipes API call
   */
  public filterRecipes(params: RecipeSearchParams): FilterResult {
    let filteredRecipes = [...this.allRecipes];

    // Apply search query filter
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

    // Apply maxReadyTime filter (cooking time ranges)
    if (params.maxReadyTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.readyInMinutes <= params.maxReadyTime!
      );
    }

    // Apply intolerances filter
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
      recipes: paginatedRecipes,
      totalResults: filteredRecipes.length,
      offset: offset,
      number: number,
      isMockData: true // Clear label for API switching
    };
  }

  /**
   * REFACTORED: Get all recipes for favorites or other use cases
   * To switch back to API: replace with API call
   */
  public getAllRecipes(): Recipe[] {
    return [...this.allRecipes];
  }

  /**
   * REFACTORED: Search recipes by ingredients using local data
   * To switch back to API: replace with searchRecipesByIngredients API call
   */
  public searchByIngredients(ingredients: string[], maxMissingIngredients: number = 3): Recipe[] {
    return this.allRecipes.filter(recipe => {
      const recipeIngredients = recipe.extendedIngredients.map((ing: any) => ing.name.toLowerCase());
      const missingCount = ingredients.filter((ing: string) => !recipeIngredients.includes(ing.toLowerCase())).length;
      return missingCount <= maxMissingIngredients;
    });
  }

  /**
   * REFACTORED: Get recipe details from local data
   * To switch back to API: replace with getRecipeDetails API call
   */
  public getRecipeDetails(recipeId: number): Recipe | null {
    return this.allRecipes.find(recipe => recipe.id === recipeId) || null;
  }

  /**
   * REFACTORED: Get filter options from local data
   * To switch back to API: replace with getFilterOptions API call
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
}

// Export singleton instance
export const recipeFilterService = RecipeFilterService.getInstance();

// Export convenience functions for easy API switching
export const filterRecipes = (params: RecipeSearchParams) => recipeFilterService.filterRecipes(params);
export const getAllRecipes = () => recipeFilterService.getAllRecipes();
export const searchByIngredients = (ingredients: string[], maxMissing: number = 3) => recipeFilterService.searchByIngredients(ingredients, maxMissing);
export const getRecipeDetails = (recipeId: number) => recipeFilterService.getRecipeDetails(recipeId);
export const getFilterOptions = () => recipeFilterService.getFilterOptions();
