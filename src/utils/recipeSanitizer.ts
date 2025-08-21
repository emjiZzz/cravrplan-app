// Recipe Sanitizer - Cleans and validates recipe data for Firestore storage
// This file ensures recipe objects are safe to store in the database
// It removes undefined values and provides fallback values to prevent database errors

import type { Recipe } from '../types/recipeTypes';

/**
 * Sanitizes a recipe object for Firestore storage by removing undefined values
 * and ensuring all fields are valid for Firestore
 * @param recipe - The recipe object to sanitize
 * @returns Cleaned recipe object safe for Firestore storage
 * 
 * This function takes a recipe object and cleans it up so it can be safely stored
 * in the Firestore database. It removes any undefined values and provides
 * default values for required fields to prevent database errors.
 */
export function sanitizeRecipeForFirestore(recipe: Recipe): any {
  // const sanitized: any = {}; // Unused variable

  // Helper function to recursively remove undefined values from nested objects
  // This function goes through all properties of an object and removes any undefined values
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }

    // Handle arrays by cleaning each item
    // If the object is an array, clean each item in the array
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined).filter(item => item !== null);
    }

    // Handle objects by cleaning each property
    // If the object is a regular object, clean each property
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

    return obj;
  };

  // Remove all undefined values from the recipe
  const cleanedRecipe = removeUndefined(recipe);

  // Return sanitized recipe with fallback values for required fields
  // This ensures that even if some data is missing, we have sensible defaults
  return {
    // Required fields with fallbacks - these are the most important recipe data
    id: cleanedRecipe.id || 0,
    title: cleanedRecipe.title || '',
    image: cleanedRecipe.image || '',
    imageType: cleanedRecipe.imageType || 'jpg',
    readyInMinutes: cleanedRecipe.readyInMinutes || 0,
    servings: cleanedRecipe.servings || 1,

    // Rating and scoring fields - how users rate and score the recipe
    aggregateLikes: cleanedRecipe.aggregateLikes || 0,
    healthScore: cleanedRecipe.healthScore || 0,
    spoonacularScore: cleanedRecipe.spoonacularScore || 0,
    pricePerServing: cleanedRecipe.pricePerServing || 0,

    // Dietary and preference arrays - what diets and preferences this recipe fits
    cuisines: cleanedRecipe.cuisines || [],
    dishTypes: cleanedRecipe.dishTypes || [],
    diets: cleanedRecipe.diets || [],
    occasions: cleanedRecipe.occasions || [],
    extendedIngredients: cleanedRecipe.extendedIngredients || [],

    // Boolean flags - whether recipe meets certain dietary requirements
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

    // Additional fields - extra information about the recipe
    weightWatcherSmartPoints: cleanedRecipe.weightWatcherSmartPoints || 0,
    summary: cleanedRecipe.summary || '',

    // Optional fields - only include if they exist and are properly structured
    // These fields are not required but provide additional information
    ...(cleanedRecipe.nutrition && typeof cleanedRecipe.nutrition === 'object' ? {
      nutrition: cleanedRecipe.nutrition
    } : {}),
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
 * Validates if a recipe object is safe for Firestore storage
 * @param recipe - The recipe object to validate
 * @returns True if the recipe is safe for storage, false otherwise
 * 
 * This function checks if a recipe object has all the required fields and
 * proper data types before attempting to store it in the database.
 * It helps prevent database errors by catching problems early.
 * 
 * ⚠️ Possibly unused - please double check
 */
export function validateRecipeForFirestore(recipe: any): boolean {
  try {
    // Check for undefined values in critical fields
    // These fields are absolutely required for a valid recipe
    const criticalFields = ['id', 'title', 'image'];
    for (const field of criticalFields) {
      if (recipe[field] === undefined) {
        console.warn(`Recipe validation failed: ${field} is undefined`);
        return false;
      }
    }

    // Check nutrition field specifically for proper structure
    // The nutrition field is complex and needs special validation
    if (recipe.nutrition !== undefined && recipe.nutrition !== null) {
      if (typeof recipe.nutrition !== 'object') {
        console.warn('Recipe validation failed: nutrition is not an object');
        return false;
      }

      // Check if nutrition contains undefined values
      // Undefined values in nutrition can cause database errors
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
