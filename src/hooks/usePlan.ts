import { useContext } from 'react';
import { PlanContext } from '../context/PlanContextTypes';

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}; 