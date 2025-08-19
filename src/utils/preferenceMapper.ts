// Preference Mapper - Converts user preferences to API search parameters
// This file maps user onboarding preferences to Spoonacular API parameters
// It helps translate what users select during onboarding into search terms the recipe API can understand

import type { RecipeSearchParams } from '../types/recipeTypes';

// User preferences interface from onboarding
// This defines the structure of user preferences collected during the onboarding process
export interface UserPreferences {
  dietaryRestrictions: string[];  // e.g., ["Vegetarian", "Gluten-Free"]
  cuisinePreferences: string[];   // e.g., ["Italian", "Mexican"]
  cookingLevel: string;           // e.g., "beginner", "intermediate", "advanced"
  timePreferences: string[];      // e.g., ["15-30", "30-60"]
}

/**
 * Maps user preferences from onboarding to Spoonacular API parameters
 * @param preferences - User preferences from onboarding form
 * @returns Partial search parameters for the API
 * 
 * This function takes the preferences users selected during onboarding and converts them
 * into search parameters that the recipe API can understand and use to find relevant recipes.
 */
export function mapPreferencesToSearchParams(preferences: UserPreferences): Partial<RecipeSearchParams> {
  const searchParams: Partial<RecipeSearchParams> = {};

  // Map dietary restrictions to diet parameter
  // If user selected dietary restrictions, use the first one as the main diet filter
  if (preferences.dietaryRestrictions.length > 0) {
    const mappedDiet = mapDietaryRestrictionsToDiet(preferences.dietaryRestrictions);
    if (mappedDiet) {
      searchParams.diet = mappedDiet;
    }
  }

  // Map cuisine preferences to cuisine parameter
  // If user selected cuisine preferences, use the first one as the main cuisine filter
  if (preferences.cuisinePreferences.length > 0) {
    const primaryCuisine = preferences.cuisinePreferences[0];
    const mappedCuisine = mapCuisinePreferenceToCuisine(primaryCuisine);
    if (mappedCuisine) {
      searchParams.cuisine = mappedCuisine;
    }
  }

  // Map time preferences to maxReadyTime parameter
  // Convert time preference strings into actual time limits for recipe search
  if (preferences.timePreferences.length > 0) {
    const timePref = preferences.timePreferences[0];
    if (timePref.includes('15-30')) {
      searchParams.maxReadyTime = 30;
    } else if (timePref.includes('30-60')) {
      searchParams.maxReadyTime = 60;
    } else if (timePref.includes('60+')) {
      searchParams.maxReadyTime = 120; // Set a reasonable upper limit
    }
  }

  // Note: cookingLevel doesn't have direct Spoonacular API mappings
  // This could be used for additional filtering logic if needed in the future

  return searchParams;
}

/**
 * Converts time preference string to maxReadyTime value
 * @param timePreference - Time preference string from user input
 * @returns Maximum ready time in minutes or undefined
 * 
 * This helper function converts user-friendly time preference strings
 * into actual time values that the API can use for filtering recipes.
 * 
 * ⚠️ Possibly unused - please double check
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
 * @param dietaryRestrictions - Array of dietary restriction strings
 * @returns Mapped diet string or undefined
 * 
 * This function takes dietary restrictions and maps them to the format
 * that the recipe API expects. For now, it returns the original value
 * since our mock data uses exact matches.
 * 
 * ⚠️ Possibly unused - please double check
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
 * @param cuisinePreference - Cuisine preference string from user input
 * @returns Mapped cuisine string or undefined
 * 
 * This function takes cuisine preferences and maps them to the format
 * that the recipe API expects. For now, it returns the original value
 * since our mock data uses exact matches.
 * 
 * ⚠️ Possibly unused - please double check
 */
export function mapCuisinePreferenceToCuisine(cuisinePreference: string): string | undefined {
  if (!cuisinePreference) return undefined;

  // For local filter service, return the original value since mock data uses exact matches
  // For API calls, this would map to lowercase values
  return cuisinePreference;
}


