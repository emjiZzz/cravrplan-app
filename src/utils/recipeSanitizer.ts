// Utility functions for cleaning up recipe data before saving to the database
// This helps prevent errors when storing recipes in Firestore

import type { Recipe } from '../types/recipeTypes';

/**
 * Cleans up a recipe object so it can be safely stored in Firestore
 * Removes undefined values and ensures all fields have proper defaults
 */
export function sanitizeRecipeForFirestore(recipe: Recipe): any {
  const sanitized: any = {};

  // Helper function to remove undefined values from nested objects and arrays
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }

    // Handle arrays - clean each item and remove null values
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined).filter(item => item !== null);
    }

    // Handle objects - clean each property
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = removeUndefined(value);
        if (cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }

    // Return primitive values as-is
    return obj;
  };

  // Clean the recipe by removing all undefined values
  const cleanedRecipe = removeUndefined(recipe);

  // Return a clean recipe object with fallback values for missing fields
  return {
    id: cleanedRecipe.id || 0,
    title: cleanedRecipe.title || '',
    image: cleanedRecipe.image || '',
    imageType: cleanedRecipe.imageType || 'jpg',
    readyInMinutes: cleanedRecipe.readyInMinutes || 0,
    servings: cleanedRecipe.servings || 1,
    aggregateLikes: cleanedRecipe.aggregateLikes || 0,
    healthScore: cleanedRecipe.healthScore || 0,
    spoonacularScore: cleanedRecipe.spoonacularScore || 0,
    pricePerServing: cleanedRecipe.pricePerServing || 0,
    cuisines: cleanedRecipe.cuisines || [],
    dishTypes: cleanedRecipe.dishTypes || [],
    diets: cleanedRecipe.diets || [],
    cheap: cleanedRecipe.cheap || false,
    dairyFree: cleanedRecipe.dairyFree || false,
    glutenFree: cleanedRecipe.glutenFree || false,
    ketogenic: cleanedRecipe.ketogenic || false,
    lowFodmap: cleanedRecipe.lowFodmap || false,
    sustainable: cleanedRecipe.sustainable || false,
    vegan: cleanedRecipe.vegan || false,
    vegetarian: cleanedRecipe.vegetarian || false,
    veryHealthy: cleanedRecipe.veryHealthy || false,
    veryPopular: cleanedRecipe.veryPopular || false,
    whole30: cleanedRecipe.whole30 || false,
    weightWatcherSmartPoints: cleanedRecipe.weightWatcherSmartPoints || 0,
    occasions: cleanedRecipe.occasions || [],
    extendedIngredients: cleanedRecipe.extendedIngredients || [],
    summary: cleanedRecipe.summary || '',

    // Only include nutrition if it's properly structured
    ...(cleanedRecipe.nutrition && typeof cleanedRecipe.nutrition === 'object' ? {
      nutrition: cleanedRecipe.nutrition
    } : {}),

    // Include other optional fields only if they exist
    ...(cleanedRecipe.analyzedInstructions ? { analyzedInstructions: cleanedRecipe.analyzedInstructions } : {}),
    ...(cleanedRecipe.instructions ? { instructions: cleanedRecipe.instructions } : {}),
    ...(cleanedRecipe.sourceName ? { sourceName: cleanedRecipe.sourceName } : {}),
    ...(cleanedRecipe.sourceUrl ? { sourceUrl: cleanedRecipe.sourceUrl } : {}),
    ...(cleanedRecipe.spoonacularSourceUrl ? { spoonacularSourceUrl: cleanedRecipe.spoonacularSourceUrl } : {}),
    ...(cleanedRecipe.license ? { license: cleanedRecipe.license } : {}),
    ...(cleanedRecipe.creditsText ? { creditsText: cleanedRecipe.creditsText } : {}),
    ...(cleanedRecipe.gaps ? { gaps: cleanedRecipe.gaps } : {})
  };
}

/**
 * Checks if a recipe object is safe to store in Firestore
 * Returns true if the recipe is valid, false if there are problems
 */
export function validateRecipeForFirestore(recipe: any): boolean {
  try {
    // Check that critical fields are not undefined
    const criticalFields = ['id', 'title', 'image'];
    for (const field of criticalFields) {
      if (recipe[field] === undefined) {
        console.warn(`Recipe validation failed: ${field} is undefined`);
        return false;
      }
    }

    // Check the nutrition field specifically since it's complex
    if (recipe.nutrition !== undefined && recipe.nutrition !== null) {
      if (typeof recipe.nutrition !== 'object') {
        console.warn('Recipe validation failed: nutrition is not an object');
        return false;
      }

      // Check if nutrition contains any undefined values
      const hasUndefinedInNutrition = JSON.stringify(recipe.nutrition).includes('undefined');
      if (hasUndefinedInNutrition) {
        console.warn('Recipe validation failed: nutrition contains undefined values');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Recipe validation error:', error);
    return false;
  }
}
