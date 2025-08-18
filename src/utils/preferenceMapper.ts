import type { RecipeSearchParams } from '../types/recipeTypes';

export interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  cookingLevel: string;
  timePreferences: string[];
  spiceLevel: string;
  servingSize: string;
}

/**
 * Maps user preferences from onboarding to Spoonacular API parameters
 */
export function mapPreferencesToSearchParams(preferences: UserPreferences): Partial<RecipeSearchParams> {
  const searchParams: Partial<RecipeSearchParams> = {};

  // Map dietary restrictions to diet parameter
  if (preferences.dietaryRestrictions.length > 0) {
    // Use the existing mapping function to convert to API format
    const mappedDiet = mapDietaryRestrictionsToDiet(preferences.dietaryRestrictions);
    if (mappedDiet) {
      searchParams.diet = mappedDiet;
    }
  }

  // Map cuisine preferences to cuisine parameter
  if (preferences.cuisinePreferences.length > 0) {
    // Use the first cuisine preference and map it to API format
    const primaryCuisine = preferences.cuisinePreferences[0];
    const mappedCuisine = mapCuisinePreferenceToCuisine(primaryCuisine);
    if (mappedCuisine) {
      searchParams.cuisine = mappedCuisine;
    }
  }

  // Map time preferences to maxReadyTime parameter
  if (preferences.timePreferences.length > 0) {
    const timePref = preferences.timePreferences[0];
    if (timePref.includes('15-30')) {
      searchParams.maxReadyTime = 30;
    } else if (timePref.includes('30-60')) {
      searchParams.maxReadyTime = 60;
    } else if (timePref.includes('60+')) {
      searchParams.maxReadyTime = 120; // Set a reasonable upper limit
    }
    // Note: Time preferences are mapped to maxReadyTime for API compatibility
  }



  // Note: cookingLevel, spiceLevel, and servingSize don't have direct Spoonacular API mappings
  // These could be used for additional filtering logic if needed

  return searchParams;
}

/**
 * Converts time preference string to maxReadyTime value
 */
export function convertTimePreferenceToMaxTime(timePreference: string): number | undefined {
  if (timePreference.includes('15-30') || timePreference === '15-30') {
    return 30;
  } else if (timePreference.includes('30-60') || timePreference === '30-60') {
    return 60;
  } else if (timePreference.includes('60+') || timePreference === '60+') {
    return 120;
  }
  return undefined;
}

/**
 * Maps dietary restrictions to Spoonacular diet parameter
 */
export function mapDietaryRestrictionsToDiet(dietaryRestrictions: string[]): string | undefined {
  if (dietaryRestrictions.length === 0) return undefined;

  // For local filter service, return the original value since mock data uses exact matches
  // For API calls, this would map to lowercase values
  const primaryDiet = dietaryRestrictions[0];
  return primaryDiet;
}

/**
 * Maps cuisine preferences to Spoonacular cuisine parameter
 */
export function mapCuisinePreferenceToCuisine(cuisinePreference: string): string | undefined {
  if (!cuisinePreference) return undefined;

  // For local filter service, return the original value since mock data uses exact matches
  // For API calls, this would map to lowercase values
  return cuisinePreference;
}


