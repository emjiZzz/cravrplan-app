
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { PlanContext, type PlanContextType } from './PlanContextTypes';

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<PlanContextType['events']>([]);

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

  return (
    <PlanContext.Provider value={{ events, addToPlan, removeFromPlan, updateEvent, clearAll, getEventsForDate }}>
      {children}
    </PlanContext.Provider>
  );

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