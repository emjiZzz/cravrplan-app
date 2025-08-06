/* src/pages/PlanPage.tsx */

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from './PlanPage.module.css';
import { usePlan } from '../context/PlanContext';

const PlanPage: React.FC = () => {
  const { events } = usePlan();

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

  return (
    <div className={styles.planPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Meal Plan</h1>
        <p className={styles.pageSubtitle}>Plan your weekly meals and stay organized</p>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{totalMeals}</div>
          <div className={styles.statLabel}>Total Meals Planned</div>
          <div className={styles.statIcon}>🍽️</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{thisWeekMeals}</div>
          <div className={styles.statLabel}>This Week</div>
          <div className={styles.statIcon}>📅</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{Math.ceil(totalMeals / 7)}</div>
          <div className={styles.statLabel}>Avg per Week</div>
          <div className={styles.statIcon}>📊</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className={styles.actionsBar}>
        <div className={styles.actionsLeft}>
          <button className={styles.actionButton}>
            <span className={styles.buttonIcon}>➕</span>
            Add Meal
          </button>
          <button className={styles.actionButton}>
            <span className={styles.buttonIcon}>📋</span>
            View Templates
          </button>
        </div>
        <div className={styles.actionsRight}>
          <button className={styles.clearAllButton}>
            <span className={styles.buttonIcon}>🗑️</span>
            Clear All
          </button>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Monthly View</h2>
          <div className={styles.mealTypeLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.breakfast}`}></div>
              <span>Breakfast</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.lunch}`}></div>
              <span>Lunch</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.dinner}`}></div>
              <span>Dinner</span>
            </div>
          </div>
        </div>
        
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
              return <div className={styles.dayNumber}>{arg.dayNumberText}</div>;
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
            height="auto"
            dayMaxEvents={3}
            moreLinkText="more"
          />
        </div>
      </div>
    </div>
  );
};

export default PlanPage;