
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { PlanContext, type PlanContextType, type MealPlanTemplate } from './PlanContextTypes';
import { searchRecipes } from '../services/apiService';

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
        mealType: 'lunch',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 0,
        servings: 1,
        nutrition: { calories: 420, protein: 18, carbs: 38, fat: 22 }
      },
      {
        title: 'One-Pan Dinner',
        recipeId: 3,
        mealType: 'dinner',
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
        mealType: 'lunch',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 15,
        servings: 2,
        nutrition: { calories: 380, protein: 16, carbs: 48, fat: 14 }
      },
      {
        title: 'Grilled Salmon with Vegetables',
        recipeId: 6,
        mealType: 'dinner',
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
        mealType: 'dinner',
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
  const [templates] = useState<MealPlanTemplate[]>(defaultTemplates);

  const addToPlan: PlanContextType['addToPlan'] = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const removeFromPlan: PlanContextType['removeFromPlan'] = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent: PlanContextType['updateEvent'] = (id, updatedEvent) => {
    setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
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

      return {
        ...event,
        id: Date.now().toString() + index,
        date: eventDate.toISOString().split('T')[0],
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
        nutrition: {
          calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 400,
          protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 20,
          carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 45,
          fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 15
        }
      }));
    } catch (error) {
      console.error('Error getting quick suggestions:', error);
      return [];
    }
  };

  return (
    <PlanContext.Provider value={{
      events,
      templates,
      addToPlan,
      removeFromPlan,
      updateEvent,
      clearAll,
      getEventsForDate,
      applyTemplate,
      getNutritionalStats,
      getQuickSuggestions
    }}>
      {children}
    </PlanContext.Provider>
  );
}; 