import { createContext } from 'react';

export interface PlanEvent {
  id: string;
  title: string;
  date: string;
  recipeId: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  image?: string;
}

export interface PlanContextType {
  events: PlanEvent[];
  addToPlan: (event: Omit<PlanEvent, 'id'>) => void;
  removeFromPlan: (id: string) => void;
  updateEvent: (id: string, updatedEvent: PlanEvent) => void;
  clearAll: () => void;
  getEventsForDate: (date: string) => PlanEvent[];
}

export const PlanContext = createContext<PlanContextType | undefined>(undefined); 