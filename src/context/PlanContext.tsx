import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PlanEvent {
  id: string;
  title: string;
  date: string;
  recipeId: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  image?: string;
}

interface PlanContextType {
  events: PlanEvent[];
  addToPlan: (event: Omit<PlanEvent, 'id'>) => void;
  removeFromPlan: (id: string) => void;
  getEventsForDate: (date: string) => PlanEvent[];
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<PlanEvent[]>([]);

  const addToPlan = (event: Omit<PlanEvent, 'id'>) => {
    const newEvent: PlanEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const removeFromPlan = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  return (
    <PlanContext.Provider value={{ events, addToPlan, removeFromPlan, getEventsForDate }}>
      {children}
    </PlanContext.Provider>
  );
}; 