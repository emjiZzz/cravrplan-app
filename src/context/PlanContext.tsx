
import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { PlanContext, type PlanContextType, type PlanEvent } from './PlanContextTypes';
// API-First filter service with seamless mock data fallback
import { filterRecipes as localFilterRecipes } from '../services/filterService';
import { useAuth } from './AuthContext';
import { useGuest } from './GuestContext';
import { firestoreService } from '../services/firestoreService';

// ===== NUTRITION DATA GENERATION =====

/**
 * Generate nutrition data based on recipe characteristics
 * Creates realistic nutrition values when actual data is not available
 */
const generateNutritionData = (recipe: { title?: string; vegetarian?: boolean; readyInMinutes?: number; servings?: number }, mealType: string) => {
  // Base nutrition values for different meal types
  const baseNutrition = {
    breakfast: { calories: 350, protein: 15, carbs: 45, fat: 12 },
    'main course': { calories: 500, protein: 22, carbs: 55, fat: 20 },
    'side dish': { calories: 200, protein: 8, carbs: 25, fat: 8 },
    dessert: { calories: 300, protein: 5, carbs: 45, fat: 12 },
    snack: { calories: 200, protein: 8, carbs: 25, fat: 8 }
  };

  // Get base values for the meal type
  const base = baseNutrition[mealType as keyof typeof baseNutrition] || baseNutrition['main course'];

  // Start with base values
  let calories = base.calories;
  let protein = base.protein;
  let carbs = base.carbs;
  let fat = base.fat;

  // Adjust based on recipe title/keywords
  const title = recipe.title?.toLowerCase() || '';

  // High protein indicators
  if (title.includes('chicken') || title.includes('fish') || title.includes('salmon') ||
    title.includes('beef') || title.includes('meat') || title.includes('protein')) {
    protein += 10;
    calories += 50;
  }

  // High carb indicators
  if (title.includes('pasta') || title.includes('rice') || title.includes('bread') ||
    title.includes('potato') || title.includes('noodle')) {
    carbs += 15;
    calories += 80;
  }

  // Low calorie indicators
  if (title.includes('salad') || title.includes('soup') || title.includes('light') ||
    title.includes('vegetable')) {
    calories -= 100;
    fat -= 5;
  }

  // High fat indicators
  if (title.includes('cheese') || title.includes('cream') || title.includes('butter') ||
    title.includes('fried') || title.includes('bacon')) {
    fat += 8;
    calories += 60;
  }

  // Vegetarian adjustments
  if (recipe.vegetarian || title.includes('vegetarian') || title.includes('vegan')) {
    protein -= 5;
    carbs += 10;
  }

  // Quick/easy meal adjustments (usually lower calories)
  if (recipe.readyInMinutes && recipe.readyInMinutes <= 15) {
    calories -= 50;
    protein -= 3;
  }

  // Servings adjustment
  if (recipe.servings) {
    const servingFactor = recipe.servings;
    calories = Math.round(calories / servingFactor);
    protein = Math.round(protein / servingFactor);
    carbs = Math.round(carbs / servingFactor);
    fat = Math.round(fat / servingFactor);
  }

  // Return nutrition data with minimum values
  return {
    calories: Math.max(150, Math.round(calories)),
    protein: Math.max(5, Math.round(protein)),
    carbs: Math.max(10, Math.round(carbs)),
    fat: Math.max(3, Math.round(fat))
  };
};

// ===== CONTEXT HOOK =====

/**
 * Custom hook to use the plan context
 * Provides easy access to plan functions and state from any component
 */
export const usePlan = () => {
  const context = React.useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

// ===== PROVIDER PROPS =====

/**
 * Props for the PlanProvider component
 */
interface PlanProviderProps {
  children: ReactNode;  // React components that will have access to plan context
}

// ===== PLAN PROVIDER COMPONENT =====

/**
 * PlanProvider Component
 * 
 * Provides meal planning functionality to the entire app.
 * Manages meal plans for both authenticated users (Firestore) and guest users (local storage).
 * Handles adding, removing, moving, and organizing meal events.
 */
export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  // ===== STATE MANAGEMENT =====

  const [events, setEvents] = useState<PlanContextType['events']>([]);           // Active meal events
  const [trashedEvents, setTrashedEvents] = useState<PlanEvent[]>([]);          // Deleted events (trash)
  const { user, isAuthenticated } = useAuth();                                  // Authentication state
  const { isGuestMode, saveGuestMealPlan, deleteGuestMealPlan, guestData } = useGuest();  // Guest mode state

  // ===== LOAD MEAL PLANS =====

  /**
   * Load meal plans based on user mode (authenticated or guest)
   * This runs when the component mounts and when user/guest state changes
   */
  useEffect(() => {
    const loadMealPlans = async () => {
      if (isAuthenticated && user) {
        // Load from Firestore for authenticated users
        try {
          const firestoreMealPlans = await firestoreService.getMealPlans(user.id);
          if (firestoreMealPlans.length > 0) {
            // Convert Firestore data to events format
            const eventsData = firestoreMealPlans.flatMap(plan => plan.events || []);
            // Ensure all events have the required PlanEvent structure
            const validEvents = eventsData.filter(event =>
              event &&
              event.id &&
              event.title &&
              event.date &&
              event.mealType
            );
            setEvents(validEvents);
          }
        } catch (error) {
          console.error('Error loading meal plans from Firestore:', error);
        }
      } else if (isGuestMode) {
        // Load from guest context for guest users
        setEvents(guestData.mealPlans || []);
      } else {
        // Clear events when not authenticated and not in guest mode
        setEvents([]);
        setTrashedEvents([]);
      }
    };

    // Only load meal plans when user state changes, not on every guest data change
    loadMealPlans();
  }, [user, isAuthenticated, isGuestMode]);

  // ===== MEAL PLAN FUNCTIONS =====

  /**
   * Add a meal event to the plan
   * Automatically generates nutrition data if missing
   */
  const addToPlan: PlanContextType['addToPlan'] = async (event) => {
    // Automatically add nutrition data if missing
    const nutrition = event.nutrition || generateNutritionData(event, event.mealType);

    const newEvent = {
      ...event,
      id: Date.now().toString(),
      nutrition
    };

    if (isAuthenticated && user) {
      // Save to Firestore for authenticated users
      try {
        // Check if user already has a meal plan, if not create one
        const existingPlans = await firestoreService.getMealPlans(user.id);
        let mealPlan;

        if (existingPlans.length > 0) {
          // Update existing plan
          mealPlan = {
            ...existingPlans[0],
            events: [...existingPlans[0].events, newEvent]
          };
        } else {
          // Create new plan
          mealPlan = {
            id: `plan-${Date.now()}`,
            userId: user.id,
            title: 'My Meal Plan',
            events: [newEvent]
          };
        }

        await firestoreService.saveMealPlan(mealPlan);
        setEvents(prev => [...prev, newEvent]);
      } catch (error) {
        console.error('Error saving meal plan to Firestore:', error);
      }
    } else if (isGuestMode) {
      // Save to guest context for guest users
      saveGuestMealPlan(newEvent);
      setEvents(prev => [...prev, newEvent]);
    }
  };

  /**
   * Remove a meal event from the plan
   * Permanently deletes the event (doesn't move to trash)
   */
  const removeFromPlan: PlanContextType['removeFromPlan'] = async (id) => {
    if (isAuthenticated && user) {
      // Remove from Firestore for authenticated users
      try {
        const existingPlans = await firestoreService.getMealPlans(user.id);
        if (existingPlans.length > 0) {
          const updatedEvents = existingPlans[0].events.filter(event => event.id !== id);
          const mealPlan = {
            ...existingPlans[0],
            events: updatedEvents
          };
          await firestoreService.saveMealPlan(mealPlan);
          setEvents(updatedEvents);
        }
      } catch (error) {
        console.error('Error removing meal from Firestore:', error);
      }
    } else if (isGuestMode) {
      // Remove from guest context for guest users
      deleteGuestMealPlan(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  /**
   * Move a meal event to trash
   * Removes from active events and adds to trash for potential restoration
   */
  const moveToTrash: PlanContextType['moveToTrash'] = async (id) => {
    const eventToTrash = events.find(event => event.id === id);
    if (eventToTrash) {
      // Check if the event is already in trash to prevent duplication
      const alreadyInTrash = trashedEvents.find(event => event.id === id);
      if (alreadyInTrash) {
        console.warn('Event is already in trash:', id);
        return;
      }

      const updatedEvents = events.filter(event => event.id !== id);

      if (isAuthenticated && user) {
        // Update in Firestore for authenticated users
        try {
          const existingPlans = await firestoreService.getMealPlans(user.id);
          if (existingPlans.length > 0) {
            const mealPlan = {
              ...existingPlans[0],
              events: updatedEvents
            };
            await firestoreService.saveMealPlan(mealPlan);
          }
        } catch (error) {
          console.error('Error updating meal plan in Firestore:', error);
        }
      }

      setEvents(updatedEvents);
      setTrashedEvents(prev => [...prev, eventToTrash]);
    }
  };

  /**
   * Restore a meal event from trash
   * Moves event back to active events
   */
  const restoreFromTrash: PlanContextType['restoreFromTrash'] = async (id) => {
    const eventToRestore = trashedEvents.find(event => event.id === id);
    if (eventToRestore) {
      const updatedEvents = [...events, eventToRestore];

      if (isAuthenticated && user) {
        // Update in Firestore for authenticated users
        try {
          const existingPlans = await firestoreService.getMealPlans(user.id);
          if (existingPlans.length > 0) {
            const mealPlan = {
              ...existingPlans[0],
              events: updatedEvents
            };
            await firestoreService.saveMealPlan(mealPlan);
          }
        } catch (error) {
          console.error('Error updating meal plan in Firestore:', error);
        }
      }

      setTrashedEvents(prev => prev.filter(event => event.id !== id));
      setEvents(updatedEvents);
    }
  };

  /**
   * Permanently delete a meal event from trash
   * Cannot be restored after this operation
   */
  const deleteFromTrash: PlanContextType['deleteFromTrash'] = async (id) => {
    setTrashedEvents(prev => prev.filter(event => event.id !== id));
  };

  /**
   * Clear all events from trash
   * Permanently deletes all trashed events
   */
  const clearTrash: PlanContextType['clearTrash'] = async () => {
    if (isAuthenticated && user) {
      // Clear trash from Firestore for authenticated users
      try {
        // Note: Firestore doesn't store trash separately, so we just clear the local state
        // The trash is only stored locally in the app state
        setTrashedEvents([]);
      } catch (error) {
        console.error('Error clearing trash from Firestore:', error);
      }
    } else if (isGuestMode) {
      // Clear trash from guest context for guest users
      // Note: Guest context doesn't store trash separately, so we just clear the local state
      setTrashedEvents([]);
    } else {
      // For any other case, just clear the local state
      setTrashedEvents([]);
    }
  };

  // ===== EVENT MANAGEMENT FUNCTIONS =====

  /**
   * Update an existing meal event
   * Modifies event properties while keeping the same ID
   */
  const updateEvent: PlanContextType['updateEvent'] = (id, updatedEvent) => {
    setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
  };

  /**
   * Move a meal event to a different date
   * Updates the event's date while keeping all other properties
   */
  const moveEvent: PlanContextType['moveEvent'] = async (id, newDate) => {
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, date: newDate } : event
    );

    if (isAuthenticated && user) {
      // Update in Firestore for authenticated users
      try {
        const existingPlans = await firestoreService.getMealPlans(user.id);
        if (existingPlans.length > 0) {
          const mealPlan = {
            ...existingPlans[0],
            events: updatedEvents
          };
          await firestoreService.saveMealPlan(mealPlan);
        }
      } catch (error) {
        console.error('Error updating meal plan in Firestore:', error);
      }
    }

    setEvents(updatedEvents);
  };

  /**
   * Clear all meal events from the plan
   * Removes all events but doesn't move them to trash
   */
  const clearAll: PlanContextType['clearAll'] = () => {
    setEvents([]);
  };

  /**
   * Clear all meal events and move them to trash
   * Allows for potential restoration of all events
   */
  const clearAllToTrash: PlanContextType['clearAllToTrash'] = async () => {
    if (events.length === 0) return;

    // Move all events to trash at once
    const eventsToMove = [...events];

    if (isAuthenticated && user) {
      // Update in Firestore for authenticated users
      try {
        const existingPlans = await firestoreService.getMealPlans(user.id);
        if (existingPlans.length > 0) {
          const mealPlan = {
            ...existingPlans[0],
            events: []
          };
          await firestoreService.saveMealPlan(mealPlan);
        }
      } catch (error) {
        console.error('Error updating meal plan in Firestore:', error);
      }
    }

    // Clear events and add all to trash
    setEvents([]);
    setTrashedEvents(prev => [...prev, ...eventsToMove]);
  };

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get all meal events for a specific date
   * Returns an array of events scheduled for the given date
   */
  const getEventsForDate: PlanContextType['getEventsForDate'] = (date) => {
    return events.filter(event => event.date === date);
  };

  /**
   * Calculate nutritional statistics for a specific date
   * Sums up all nutrition data from events on the given date
   */
  const getNutritionalStats: PlanContextType['getNutritionalStats'] = (date) => {
    const dayEvents = getEventsForDate(date);

    return dayEvents.reduce((stats, event) => {
      if (event.nutrition) {
        stats.calories += event.nutrition.calories;
        stats.protein += event.nutrition.protein;
        stats.carbs += event.nutrition.carbs;
        stats.fat += event.nutrition.fat;
      }
      return stats;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  /**
   * Ensure all events have nutrition data
   * Generates nutrition data for events that don't have it
   */
  const ensureNutritionData = () => {
    setEvents(prev => prev.map(event => {
      if (!event.nutrition) {
        return {
          ...event,
          nutrition: generateNutritionData(event, event.mealType)
        };
      }
      return event;
    }));
  };

  /**
   * Get quick meal suggestions based on meal type and time constraint
   * Uses API-first approach with seamless mock data fallback
   */
  const getQuickSuggestions: PlanContextType['getQuickSuggestions'] = async (mealType, maxTime = 30) => {
    try {
      // Search for quick recipes based on meal type and time constraint
      const searchParams = {
        query: mealType,
        maxReadyTime: maxTime,
        number: 5
      };

      // API-first approach - tries API, falls back to mock data seamlessly
      const response = await localFilterRecipes(searchParams);
      const recipes = response.recipes || [];

      return recipes.map((recipe: any) => ({
        id: `suggestion-${Date.now()}-${recipe.id}`,
        title: recipe.title,
        date: new Date().toISOString().split('T')[0],
        recipeId: recipe.id,
        mealType,
        image: recipe.image,
        difficulty: recipe.readyInMinutes <= 15 ? 'easy' :
          recipe.readyInMinutes <= 30 ? 'medium' : 'hard',
        prepTime: Math.floor(recipe.readyInMinutes * 0.4),
        cookTime: Math.floor(recipe.readyInMinutes * 0.6),
        servings: recipe.servings,
        nutrition: generateNutritionData(recipe, mealType)
      }));
    } catch (error) {
      console.error('Error getting quick suggestions:', error);
      return [];
    }
  };

  /**
   * Check if a feature is restricted for guest users
   * Currently all features are enabled for both guest and member modes
   */
  const isFeatureRestricted: PlanContextType['isFeatureRestricted'] = (_feature) => {
    // All features are now enabled for both guest and member modes
    return false;
  };

  // ===== CONTEXT VALUE =====

  /**
   * What we provide to other components through the context
   */
  return (
    <PlanContext.Provider value={{
      events,
      trashedEvents,
      addToPlan,
      removeFromPlan,
      moveToTrash,
      restoreFromTrash,
      deleteFromTrash,
      clearTrash,
      updateEvent,
      moveEvent,
      clearAll,
      clearAllToTrash,
      getEventsForDate,
      getNutritionalStats,
      getQuickSuggestions,
      ensureNutritionData,
      isFeatureRestricted,
    }}>
      {children}
    </PlanContext.Provider>
  );
}; 