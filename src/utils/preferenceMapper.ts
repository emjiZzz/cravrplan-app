import type { RecipeSearchParams } from '../types/recipeTypes';

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
 * Maps user preferences from onboarding to Spoonacular API parameters
 */
export function mapPreferencesToSearchParams(preferences: UserPreferences): Partial<RecipeSearchParams> {
  const searchParams: Partial<RecipeSearchParams> = {};

  // Map dietary restrictions to diet parameter
  if (preferences.dietaryRestrictions.length > 0) {
    // Spoonacular only supports one diet at a time, so we'll use the first one
    // or combine them if possible
    const primaryDiet = preferences.dietaryRestrictions[0];
    searchParams.diet = primaryDiet;
  }

  // Map cuisine preferences to cuisine parameter
  if (preferences.cuisinePreferences.length > 0) {
    // Spoonacular only supports one cuisine at a time, so we'll use the first one
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
      searchParams.maxReadyTime = 120; // Set a reasonable upper limit
    }
    // Note: 'Meal Prep' and 'Weekend Cooking' don't have direct time mappings
    // but we can still apply them as general time preferences
  }

  // Map allergies to intolerances parameter
  if (preferences.allergies.length > 0) {
    searchParams.intolerances = preferences.allergies;
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

  // Spoonacular diet values
  const dietMapping: Record<string, string> = {
    'Vegetarian': 'vegetarian',
    'Vegan': 'vegan',
    'Gluten-Free': 'gluten-free',
    'Dairy-Free': 'dairy-free',
    'Keto': 'ketogenic',
    'Paleo': 'paleo',
    'Low-Carb': 'low-carb',
    'High-Protein': 'high-protein'
  };

  const primaryDiet = dietaryRestrictions[0];
  return dietMapping[primaryDiet] || primaryDiet;
}

/**
 * Maps allergies to Spoonacular intolerances
 */
export function mapAllergiesToIntolerances(allergies: string[]): string[] {
  const intoleranceMapping: Record<string, string> = {
    'Nuts': 'tree nut',
    'Dairy': 'dairy',
    'Shellfish': 'shellfish',
    'Eggs': 'egg',
    'Soy': 'soy',
    'Wheat': 'wheat',
    'Fish': 'fish',
    'Sesame': 'sesame'
  };

  return allergies.map(allergy => intoleranceMapping[allergy] || allergy);
}
