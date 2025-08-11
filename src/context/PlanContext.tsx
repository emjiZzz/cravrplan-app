
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { PlanContext, type PlanContextType, type MealPlanTemplate, type PlanEvent } from './PlanContextTypes';
import { searchRecipes } from '../services/apiService';

// Function to automatically generate nutrition data based on recipe characteristics
const generateNutritionData = (recipe: any, mealType: string) => {
  // Base nutrition values based on meal type
  const baseNutrition = {
    breakfast: { calories: 350, protein: 15, carbs: 45, fat: 12 },
    'main course': { calories: 500, protein: 22, carbs: 55, fat: 20 },
    'side dish': { calories: 200, protein: 8, carbs: 25, fat: 8 },
    dessert: { calories: 300, protein: 5, carbs: 45, fat: 12 },
    snack: { calories: 200, protein: 8, carbs: 25, fat: 8 }
  };

  // Get base values for the meal type
  const base = baseNutrition[mealType as keyof typeof baseNutrition] || baseNutrition['main course'];

  // Adjust based on recipe characteristics
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

// Predefined meal plan templates
const defaultTemplates: MealPlanTemplate[] = [
  {
    id: 'quick-week',
    name: 'Quick & Easy Week',
    description: 'Simple meals that can be prepared in 30 minutes or less',
    icon: '⚡',
    category: 'weekly',
    events: [
      {
        title: 'Quick Breakfast Bowl',
        recipeId: 1,
        mealType: 'breakfast',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 5,
        servings: 2,
        nutrition: { calories: 350, protein: 15, carbs: 45, fat: 12 }
      },
      {
        title: 'Simple Lunch Wrap',
        recipeId: 2,
        mealType: 'main course',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 0,
        servings: 1,
        nutrition: { calories: 420, protein: 18, carbs: 38, fat: 22 }
      },
      {
        title: 'One-Pan Dinner',
        recipeId: 3,
        mealType: 'main course',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        nutrition: { calories: 480, protein: 28, carbs: 35, fat: 18 }
      }
    ]
  },
  {
    id: 'healthy-week',
    name: 'Healthy & Balanced',
    description: 'Nutritious meals focused on whole foods and balanced nutrition',
    icon: '🥗',
    category: 'diet',
    events: [
      {
        title: 'Overnight Oats',
        recipeId: 4,
        mealType: 'breakfast',
        difficulty: 'easy',
        prepTime: 5,
        cookTime: 0,
        servings: 2,
        nutrition: { calories: 280, protein: 12, carbs: 42, fat: 8 }
      },
      {
        title: 'Quinoa Salad Bowl',
        recipeId: 5,
        mealType: 'main course',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 15,
        servings: 2,
        nutrition: { calories: 380, protein: 16, carbs: 48, fat: 14 }
      },
      {
        title: 'Grilled Salmon with Vegetables',
        recipeId: 6,
        mealType: 'main course',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 20,
        servings: 2,
        nutrition: { calories: 520, protein: 42, carbs: 18, fat: 28 }
      }
    ]
  },
  {
    id: 'weekend-special',
    name: 'Weekend Special',
    description: 'More elaborate meals perfect for relaxed weekend cooking',
    icon: '🍳',
    category: 'occasion',
    events: [
      {
        title: 'Brunch Frittata',
        recipeId: 7,
        mealType: 'breakfast',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 25,
        servings: 4,
        nutrition: { calories: 380, protein: 22, carbs: 8, fat: 28 }
      },
      {
        title: 'Homemade Pizza',
        recipeId: 8,
        mealType: 'main course',
        difficulty: 'hard',
        prepTime: 30,
        cookTime: 20,
        servings: 4,
        nutrition: { calories: 650, protein: 24, carbs: 68, fat: 32 }
      }
    ]
  }
];

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<PlanContextType['events']>([]);
  const [trashedEvents, setTrashedEvents] = useState<PlanEvent[]>([]);
  const [templates] = useState<MealPlanTemplate[]>(defaultTemplates);

  const addToPlan: PlanContextType['addToPlan'] = (event) => {
    // Automatically add nutrition data if missing
    const nutrition = event.nutrition || generateNutritionData(event, event.mealType);

    const newEvent = {
      ...event,
      id: Date.now().toString(),
      nutrition
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const removeFromPlan: PlanContextType['removeFromPlan'] = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const moveToTrash: PlanContextType['moveToTrash'] = (id) => {
    const eventToTrash = events.find(event => event.id === id);
    if (eventToTrash) {
      setEvents(prev => prev.filter(event => event.id !== id));
      setTrashedEvents(prev => [...prev, eventToTrash]);
    }
  };

  const restoreFromTrash: PlanContextType['restoreFromTrash'] = (id) => {
    const eventToRestore = trashedEvents.find(event => event.id === id);
    if (eventToRestore) {
      setTrashedEvents(prev => prev.filter(event => event.id !== id));
      setEvents(prev => [...prev, eventToRestore]);
    }
  };

  const deleteFromTrash: PlanContextType['deleteFromTrash'] = (id) => {
    setTrashedEvents(prev => prev.filter(event => event.id !== id));
  };

  const clearTrash: PlanContextType['clearTrash'] = () => {
    setTrashedEvents([]);
  };

  const updateEvent: PlanContextType['updateEvent'] = (id, updatedEvent) => {
    setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
  };

  const moveEvent: PlanContextType['moveEvent'] = (id, newDate) => {
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, date: newDate } : event
    ));
  };

  const clearAll: PlanContextType['clearAll'] = () => {
    setEvents([]);
  };

  const getEventsForDate: PlanContextType['getEventsForDate'] = (date) => {
    return events.filter(event => event.date === date);
  };

  const applyTemplate: PlanContextType['applyTemplate'] = (template, startDate) => {
    const start = new Date(startDate);
    const newEvents = template.events.map((event, index) => {
      const eventDate = new Date(start);
      eventDate.setDate(start.getDate() + index);

      // Ensure nutrition data is included
      const nutrition = event.nutrition || generateNutritionData(event, event.mealType);

      return {
        ...event,
        id: Date.now().toString() + index,
        date: eventDate.toISOString().split('T')[0],
        nutrition
      };
    });

    setEvents(prev => [...prev, ...newEvents]);
  };

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

  // Function to ensure all events have nutrition data
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

  const getQuickSuggestions: PlanContextType['getQuickSuggestions'] = async (mealType, maxTime = 30) => {
    try {
      // Search for quick recipes based on meal type and time constraint
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

  return (
    <PlanContext.Provider value={{
      events,
      trashedEvents,
      templates,
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
      applyTemplate,
      getNutritionalStats,
      getQuickSuggestions,
      ensureNutritionData,
    }}>
      {children}
    </PlanContext.Provider>
  );
}; 