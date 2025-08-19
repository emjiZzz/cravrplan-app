import { createContext } from 'react';

// ===== MEAL EVENT INTERFACE =====

/**
 * PlanEvent Interface
 * 
 * Defines the structure of a meal event in the meal plan.
 * Each event represents a single meal scheduled for a specific date.
 */
export interface PlanEvent {
  id: string;                    // Unique identifier for the meal event
  title: string;                 // Name of the meal/recipe
  date: string;                  // Date when the meal is scheduled (YYYY-MM-DD format)
  recipeId: number;              // ID of the recipe from the recipe database
  mealType: 'main course' | 'breakfast' | 'side dish' | 'dessert' | 'snack';  // Type of meal
  image?: string;                // URL of the meal image (optional)
  difficulty?: 'easy' | 'medium' | 'hard';  // Cooking difficulty level (optional)
  prepTime?: number;             // Preparation time in minutes (optional)
  cookTime?: number;             // Cooking time in minutes (optional)
  servings?: number;             // Number of servings (optional)
  nutrition?: {                  // Nutritional information per serving (optional)
    calories: number;            // Calories per serving
    protein: number;             // Protein in grams per serving
    carbs: number;               // Carbohydrates in grams per serving
    fat: number;                 // Fat in grams per serving
  };
  notes?: string;                // Additional notes about the meal (optional)
}

// ===== NUTRITIONAL STATISTICS INTERFACE =====

/**
 * NutritionalStats Interface
 * 
 * Defines the structure for nutritional statistics.
 * Used to track daily nutritional totals for the 4 main nutrition categories.
 */
export interface NutritionalStats {
  calories: number;              // Total calories for the day
  protein: number;               // Total protein in grams for the day
  carbs: number;                 // Total carbohydrates in grams for the day
  fat: number;                   // Total fat in grams for the day
}

// ===== PLAN CONTEXT INTERFACE =====

/**
 * PlanContextType Interface
 * 
 * Defines the complete interface for the meal planning context.
 * Contains all state data and functions that the context provides to components.
 */
export interface PlanContextType {
  // ===== STATE DATA =====

  events: PlanEvent[];           // Array of active meal events in the plan
  trashedEvents: PlanEvent[];    // Array of deleted events (in trash for potential restoration)

  // ===== MEAL PLAN MANAGEMENT FUNCTIONS =====

  addToPlan: (event: Omit<PlanEvent, 'id'>) => void;  // Add a new meal to the plan
  removeFromPlan: (id: string) => void;                // Permanently remove a meal from the plan
  updateEvent: (id: string, updatedEvent: PlanEvent) => void;  // Update an existing meal event
  moveEvent: (id: string, newDate: string) => void;    // Move a meal to a different date

  // ===== TRASH MANAGEMENT FUNCTIONS =====

  moveToTrash: (id: string) => void;                   // Move a meal to trash (soft delete)
  restoreFromTrash: (id: string) => void;              // Restore a meal from trash
  deleteFromTrash: (id: string) => void;               // Permanently delete a meal from trash
  clearTrash: () => void;                              // Clear all meals from trash

  // ===== BULK OPERATIONS =====

  clearAll: () => void;                                // Clear all meals from the plan
  clearAllToTrash: () => Promise<void>;                // Move all meals to trash

  // ===== UTILITY FUNCTIONS =====

  getEventsForDate: (date: string) => PlanEvent[];     // Get all meals for a specific date
  getNutritionalStats: (date: string) => NutritionalStats;  // Calculate daily nutrition totals
  getQuickSuggestions: (mealType: PlanEvent['mealType'], maxTime?: number) => Promise<PlanEvent[]>;  // Get meal suggestions
  ensureNutritionData: () => void;                     // Ensure all meals have nutrition data

  // ===== FEATURE CONTROL =====

  isFeatureRestricted: (feature: 'customRecipe' | 'dragAndDrop' | 'advancedPlanning') => boolean;  // Check if feature is available
}

// ===== CONTEXT CREATION =====

/**
 * PlanContext
 * 
 * React context for meal planning functionality.
 * Provides access to meal plan state and functions throughout the app.
 */
export const PlanContext = createContext<PlanContextType | undefined>(undefined); 