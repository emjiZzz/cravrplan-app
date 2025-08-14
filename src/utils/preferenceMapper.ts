// Utility functions for converting user preferences to API search parameters

import type { RecipeSearchParams } from '../types/recipeTypes';

// Type definition for user preferences from onboarding
export interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  cookingLevel: string;
  timePreferences: string[];
  allergies: string[];
  spiceLevel: string;
  servingSize: string;
}

/**
 * Converts user preferences from onboarding into search parameters for the recipe API
 */
export function mapPreferencesToSearchParams(preferences: UserPreferences): Partial<RecipeSearchParams> {
  const searchParams: Partial<RecipeSearchParams> = {};

  // Map dietary restrictions to diet parameter
  if (preferences.dietaryRestrictions.length > 0) {
    const primaryDiet = preferences.dietaryRestrictions[0];
    searchParams.diet = primaryDiet;
  }

  // Map cuisine preferences to cuisine parameter
  if (preferences.cuisinePreferences.length > 0) {
    const primaryCuisine = preferences.cuisinePreferences[0];
    searchParams.cuisine = primaryCuisine;
  }

  // Map time preferences to maxReadyTime parameter
  if (preferences.timePreferences.length > 0) {
    const timePref = preferences.timePreferences[0];
    if (timePref.includes('15-30')) {
      searchParams.maxReadyTime = 30;
    } else if (timePref.includes('30-60')) {
      searchParams.maxReadyTime = 60;
    } else if (timePref.includes('60+')) {
      searchParams.maxReadyTime = 120;
    }
  }

  // Map allergies to intolerances parameter
  if (preferences.allergies.length > 0) {
    searchParams.intolerances = preferences.allergies;
  }

  return searchParams;
}
