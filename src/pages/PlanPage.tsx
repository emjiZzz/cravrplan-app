/* src/pages/PlanPage.tsx */

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from './PlanPage.module.css';
import { usePlan } from '../context/PlanContext';

const PlanPage: React.FC = () => {
  const { events, removeFromPlan, clearAll } = usePlan();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate stats
  const totalMeals = events.length;
  const thisWeekMeals = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return eventDate >= weekStart && eventDate <= weekEnd;
  }).length;

  const handleClearAll = () => {
    if (events.length === 0) return;
    
    if (showClearConfirm) {
      // Clear all events using the context function
      clearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.title === clickInfo.event.title);
    if (event) {
      if (confirm(`Remove "${event.title}" from your meal plan?`)) {
        removeFromPlan(event.id);
      }
    }
  };

  return (
    <div className={styles.planPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.pageTitle}>My Meal Plan</h1>
            <p className={styles.pageSubtitle}>
              Organize your weekly meals and track your culinary journey
            </p>
          </div>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalMeals}</span>
              <span className={styles.statLabel}>Total Meals</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{thisWeekMeals}</span>
              <span className={styles.statLabel}>This Week</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.clearAllButton} ${showClearConfirm ? styles.confirmMode : ''}`}
            onClick={handleClearAll}
            disabled={events.length === 0}
          >
            {showClearConfirm ? 'Click to Confirm' : 'Clear All'}
          </button>
        </div>
      </div>
      
      {/* Calendar Container */}
      <div className={styles.calendarContainer}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'prev,next today',
          }}
          dayCellContent={(arg) => {
            return <div>{arg.dayNumberText}</div>;
          }}
          eventContent={(arg) => {
            const event = events.find(e => e.title === arg.event.title);
            if (!event) return null;

            return (
              <div className={`${styles.eventItem} ${styles[`meal${event.mealType.charAt(0).toUpperCase() + event.mealType.slice(1)}`]}`}>
                <div className={styles.eventTitle}>{arg.event.title}</div>
                <div className={styles.eventMealType}>
                  {event.mealType.charAt(0).toUpperCase() + event.mealType.slice(1)}
                </div>
              </div>
            );
          }}
          events={events}
          eventClick={handleEventClick}
        />
      </div>
    </div>
  );
};

export default PlanPage;