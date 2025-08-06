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
}; 