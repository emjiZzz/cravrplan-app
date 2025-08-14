
import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { PlanContext, type PlanContextType, type PlanEvent } from './PlanContextTypes';
import { searchRecipes } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useGuest } from './GuestContext';
import { firestoreService } from '../services/firestoreService';

// Generate nutrition data for recipes that don't have it
// This gives reasonable estimates based on meal type and recipe name
const generateNutritionData = (recipe: { title?: string; vegetarian?: boolean; readyInMinutes?: number; servings?: number }, mealType: string) => {
  // Base nutrition values for different meal types
  const baseNutrition = {
    breakfast: { calories: 350, protein: 15, carbs: 45, fat: 12 },
    'main course': { calories: 500, protein: 22, carbs: 55, fat: 20 },
    'side dish': { calories: 200, protein: 8, carbs: 25, fat: 8 },
    dessert: { calories: 300, protein: 5, carbs: 45, fat: 12 },
    snack: { calories: 200, protein: 8, carbs: 25, fat: 8 }
  };

  const base = baseNutrition[mealType as keyof typeof baseNutrition] || baseNutrition['main course'];

  let calories = base.calories;
  let protein = base.protein;
  let carbs = base.carbs;
  let fat = base.fat;

  const title = recipe.title?.toLowerCase() || '';

  // Adjust based on ingredients in the title
  if (title.includes('chicken') || title.includes('fish') || title.includes('salmon') ||
    title.includes('beef') || title.includes('meat') || title.includes('protein')) {
    protein += 10;
    calories += 50;
  }

  if (title.includes('pasta') || title.includes('rice') || title.includes('bread') ||
    title.includes('potato') || title.includes('noodle')) {
    carbs += 15;
    calories += 80;
  }

  if (title.includes('salad') || title.includes('soup') || title.includes('light') ||
    title.includes('vegetable')) {
    calories -= 100;
    fat -= 5;
  }

  if (title.includes('cheese') || title.includes('cream') || title.includes('butter') ||
    title.includes('fried') || title.includes('bacon')) {
    fat += 8;
    calories += 60;
  }

  // Vegetarian dishes usually have less protein and more carbs
  if (recipe.vegetarian || title.includes('vegetarian') || title.includes('vegan')) {
    protein -= 5;
    carbs += 10;
  }

  // Quick meals are usually smaller portions
  if (recipe.readyInMinutes && recipe.readyInMinutes <= 15) {
    calories -= 50;
    protein -= 3;
  }

  // Adjust for number of servings
  if (recipe.servings) {
    const servingFactor = recipe.servings;
    calories = Math.round(calories / servingFactor);
    protein = Math.round(protein / servingFactor);
    carbs = Math.round(carbs / servingFactor);
    fat = Math.round(fat / servingFactor);
  }

  // Make sure we don't return negative or too small values
  return {
    calories: Math.max(150, Math.round(calories)),
    protein: Math.max(5, Math.round(protein)),
    carbs: Math.max(10, Math.round(carbs)),
    fat: Math.max(3, Math.round(fat))
  };
};

// Hook to use the plan context
export const usePlan = () => {
  const context = React.useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}



export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<PlanContextType['events']>([]);
  const [trashedEvents, setTrashedEvents] = useState<PlanEvent[]>([]);

  const { user, isAuthenticated } = useAuth();
  const { isGuestMode, saveGuestMealPlan, deleteGuestMealPlan, guestData } = useGuest();

  // Load meal plans when the component mounts or user changes
  useEffect(() => {
    const loadMealPlans = async () => {
      if (isAuthenticated && user) {
        // For logged-in users, load from the database
        try {
          const firestoreMealPlans = await firestoreService.getMealPlans(user.id);
          if (firestoreMealPlans.length > 0) {
            const eventsData = firestoreMealPlans.flatMap(plan => plan.events || []);
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
        // For guest users, load from local storage
        setEvents(guestData.mealPlans || []);
      } else {
        // Clear everything if not logged in and not in guest mode
        setEvents([]);
        setTrashedEvents([]);
      }
    };

    loadMealPlans();
  }, [user, isAuthenticated, isGuestMode]);

  // Function to add a new meal to the plan
  const addToPlan: PlanContextType['addToPlan'] = async (event) => {
    const nutrition = event.nutrition || generateNutritionData(event, event.mealType);

    const newEvent = {
      ...event,
      id: Date.now().toString(),
      nutrition
    };

    if (isAuthenticated && user) {
      // Save to database for logged-in users
      try {
        const existingPlans = await firestoreService.getMealPlans(user.id);
        let mealPlan;

        if (existingPlans.length > 0) {
          mealPlan = {
            ...existingPlans[0],
            events: [...existingPlans[0].events, newEvent]
          };
        } else {
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
      // Save to local storage for guest users
      saveGuestMealPlan(newEvent);
      setEvents(prev => [...prev, newEvent]);
    }
  };

  // Function to remove a meal from the plan
  const removeFromPlan: PlanContextType['removeFromPlan'] = async (id) => {
    if (isAuthenticated && user) {
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
      deleteGuestMealPlan(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  // Function to move a meal to trash (soft delete)
  const moveToTrash: PlanContextType['moveToTrash'] = async (id) => {
    const eventToTrash = events.find(event => event.id === id);
    if (eventToTrash) {
      const alreadyInTrash = trashedEvents.find(event => event.id === id);
      if (alreadyInTrash) {
        console.warn('Event is already in trash:', id);
        return;
      }

      const updatedEvents = events.filter(event => event.id !== id);

      if (isAuthenticated && user) {
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

  // Function to restore a meal from trash
  const restoreFromTrash: PlanContextType['restoreFromTrash'] = async (id) => {
    const eventToRestore = trashedEvents.find(event => event.id === id);
    if (eventToRestore) {
      const updatedEvents = [...events, eventToRestore];

      if (isAuthenticated && user) {
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

  // Function to permanently delete from trash
  const deleteFromTrash: PlanContextType['deleteFromTrash'] = async (id) => {
    setTrashedEvents(prev => prev.filter(event => event.id !== id));
  };

  // Function to empty the trash
  const clearTrash: PlanContextType['clearTrash'] = async () => {
    setTrashedEvents([]);
  };

  // Function to update an existing meal
  const updateEvent: PlanContextType['updateEvent'] = (id, updatedEvent) => {
    setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
  };

  // Function to move a meal to a different date
  const moveEvent: PlanContextType['moveEvent'] = async (id, newDate) => {
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, date: newDate } : event
    );

    if (isAuthenticated && user) {
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

  // Function to clear all meals from the plan
  const clearAll: PlanContextType['clearAll'] = async () => {
    if (isAuthenticated && user) {
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
        console.error('Error clearing meal plan from Firestore:', error);
      }
    }

    setEvents([]);
  };

  // Function to get all meals for a specific date
  const getEventsForDate: PlanContextType['getEventsForDate'] = (date) => {
    return events.filter(event => event.date === date);
  };



  // Function to calculate total nutrition for a day
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

  // Function to make sure all events have nutrition data
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

  // Function to get quick recipe suggestions
  const getQuickSuggestions: PlanContextType['getQuickSuggestions'] = async (mealType, maxTime = 30) => {
    try {
      const searchParams = {
        query: mealType,
        maxReadyTime: maxTime,
        number: 5
      };

      const response = await searchRecipes(searchParams);
      const recipes = response.results || [];

      return recipes.map(recipe => ({
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

  // Function to check if a feature is restricted for guest users
  const isFeatureRestricted: PlanContextType['isFeatureRestricted'] = () => {
    return false;
  };

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