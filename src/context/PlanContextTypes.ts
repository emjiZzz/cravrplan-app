import { createContext } from 'react';

export interface PlanEvent {
  id: string;
  title: string;
  date: string;
  recipeId: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  events: Omit<PlanEvent, 'id' | 'date'>[];
  category: 'weekly' | 'occasion' | 'diet';
}

export interface NutritionalStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface PlanContextType {
  events: PlanEvent[];
  templates: MealPlanTemplate[];
  addToPlan: (event: Omit<PlanEvent, 'id'>) => void;
  removeFromPlan: (id: string) => void;
  updateEvent: (id: string, updatedEvent: PlanEvent) => void;
  clearAll: () => void;
  getEventsForDate: (date: string) => PlanEvent[];
  applyTemplate: (template: MealPlanTemplate, startDate: string) => void;
  getNutritionalStats: (date: string) => NutritionalStats;
  getQuickSuggestions: (mealType: PlanEvent['mealType'], maxTime?: number) => Promise<PlanEvent[]>;
}

export const PlanContext = createContext<PlanContextType | undefined>(undefined); 