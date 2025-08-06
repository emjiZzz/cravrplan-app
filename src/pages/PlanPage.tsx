
/* src/pages/PlanPage.tsx */

import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import styles from './PlanPage.module.css';
import { usePlan } from '../hooks/usePlan';
import type { PlanEvent } from '../context/PlanContextTypes';
import { searchRecipes } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';

interface SwapRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwap: (recipe: Recipe) => void;
  currentEvent: PlanEvent | null;
}

const SwapRecipeModal: React.FC<SwapRecipeModalProps> = ({ isOpen, onClose, onSwap }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      searchRecipes({ query: '', number: 12 }).then((res) => {
        setRecipes(res.results || res);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.swapModalBackdrop} onClick={onClose}>
      <div className={styles.swapModal} onClick={e => e.stopPropagation()}>
        <h3 className={styles.swapModalTitle}>Swap Recipe</h3>
        <p className={styles.swapModalSubtitle}>Pick a new recipe for this meal slot</p>
        {loading ? (
          <div className={styles.swapModalLoading}>Loading...</div>
        ) : (
          <div className={styles.swapModalList}>
            {recipes.map((recipe: Recipe) => (
              <div
                key={recipe.id}
                className={styles.swapModalRecipe}
                onClick={() => onSwap(recipe)}
              >
                <img src={recipe.image} alt={recipe.title} className={styles.swapModalRecipeImg} />
                <div className={styles.swapModalRecipeInfo}>
                  <div className={styles.swapModalRecipeTitle}>{recipe.title}</div>
                  <div className={styles.swapModalRecipeMeta}>{recipe.readyInMinutes} min • {recipe.servings} servings</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button className={styles.swapModalClose} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const PlanPage: React.FC = () => {
  const { events, removeFromPlan, clearAll, updateEvent, addToPlan } = usePlan();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

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

  // Calculate nutritional overview
  const nutritionalStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = events.filter(event => event.date === today);

    // Mock nutritional data (in real app, this would come from recipe API)
    const totalCalories = todayMeals.length * 450; // Average calories per meal
    const totalProtein = todayMeals.length * 25; // Average protein per meal
    const totalCarbs = todayMeals.length * 45; // Average carbs per meal
    const totalFat = todayMeals.length * 15; // Average fat per meal

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      mealCount: todayMeals.length
    };
  }, [events]);

  const handleClearAll = () => {
    if (events.length === 0) return;

    if (showClearConfirm) {
      clearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.title === clickInfo.event.title);
    if (event) {
      if (confirm(`Remove "${event.title}" from your meal plan?`)) {
        removeFromPlan(event.id);
      }
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const event = events.find(e => e.title === dropInfo.event.title);
    if (event && dropInfo.event.start) {
      const newDate = dropInfo.event.start.toISOString().split('T')[0];
      updateEvent(event.id, { ...event, date: newDate });
    }
  };

  const handleCopyMeal = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const newEvent = {
        title: event.title,
        date: tomorrowStr,
        recipeId: event.recipeId,
        mealType: event.mealType,
        image: event.image
      };

      addToPlan(newEvent);
    }
  };

  const handleBulkCopy = () => {
    if (selectedEvents.length === 0) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    selectedEvents.forEach(eventId => {
      const event = events.find(e => e.id === eventId);
      if (event) {
        const newEvent = {
          title: event.title,
          date: tomorrowStr,
          recipeId: event.recipeId,
          mealType: event.mealType,
          image: event.image
        };
        addToPlan(newEvent);
      }
    });

    setSelectedEvents([]);
  };

  const handleBulkDelete = () => {
    if (selectedEvents.length === 0) return;

    if (confirm(`Delete ${selectedEvents.length} selected meals?`)) {
      selectedEvents.forEach(eventId => {
        removeFromPlan(eventId);
      });
      setSelectedEvents([]);
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSwap = (recipe: Recipe) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, {
        ...selectedEvent,
        title: recipe.title,
        recipeId: recipe.id,
        image: recipe.image,
      });
      setSelectedEvent(null);
    }
  };

  return (
    <div className={styles.planPageContainer}>
      <div className={styles.contentWrapper}>
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
            {selectedEvents.length > 0 && (
              <div className={styles.bulkOperations}>
                <span className={styles.selectedCount}>
                  {selectedEvents.length} selected
                </span>
                <button
                  className={styles.bulkCopyButton}
                  onClick={handleBulkCopy}
                >
                  Copy to Tomorrow
                </button>
                <button
                  className={styles.bulkDeleteButton}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </button>
              </div>
            )}
            <button
              className={`${styles.clearAllButton} ${showClearConfirm ? styles.confirmMode : ''}`}
              onClick={handleClearAll}
              disabled={events.length === 0}
            >
              {showClearConfirm ? 'Click to Confirm' : 'Clear All'}
            </button>
          </div>
        </div>

        {/* Nutritional Overview */}
        {nutritionalStats.mealCount > 0 && (
          <div className={styles.nutritionalOverview}>
            <h3 className={styles.nutritionTitle}>Today's Nutrition</h3>
            <div className={styles.nutritionGrid}>
              <div className={styles.nutritionItem}>
                <span className={styles.nutritionValue}>{nutritionalStats.calories}</span>
                <span className={styles.nutritionLabel}>Calories</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.nutritionValue}>{nutritionalStats.protein}g</span>
                <span className={styles.nutritionLabel}>Protein</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.nutritionValue}>{nutritionalStats.carbs}g</span>
                <span className={styles.nutritionLabel}>Carbs</span>
              </div>
              <div className={styles.nutritionItem}>
                <span className={styles.nutritionValue}>{nutritionalStats.fat}g</span>
                <span className={styles.nutritionLabel}>Fat</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Container */}
        <div className={styles.calendarContainer}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'prev,next today',
            }}
            editable={true}
            droppable={true}
            dayCellContent={(arg) => {
              return <div>{arg.dayNumberText}</div>;
            }}
            eventContent={(arg) => {
              const event = events.find(e => e.title === arg.event.title);
              if (!event) return null;

              const isSelected = selectedEvents.includes(event.id);

              return (
                <div className={`${styles.eventItem} ${styles[`meal${event.mealType.charAt(0).toUpperCase() + event.mealType.slice(1)}`]} ${isSelected ? styles.selected : ''}`}>
                  <div className={styles.eventHeader}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEventSelection(event.id)}
                      className={styles.eventCheckbox}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={styles.eventTitle}>{arg.event.title}</div>
                  </div>
                  <div className={styles.eventMealType}>
                    {event.mealType.charAt(0).toUpperCase() + event.mealType.slice(1)}
                  </div>
                  <div className={styles.eventActions}>
                    <button
                      className={styles.copyButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyMeal(event.id);
                      }}
                      title="Copy to tomorrow"
                    >
                      📋
                    </button>
                    <button
                      className={styles.swapButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      title="Swap recipe"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              );
            }}
            events={events}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
          />
        </div>
      </div>
      <SwapRecipeModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSwap={handleSwap}
        currentEvent={selectedEvent}
      />
    </div>
  );
};


/* src/pages/PlanPage.tsx */

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from './PlanPage.module.css';
import { usePlan } from '../context/PlanContext';

const PlanPage: React.FC = () => {
  const { events, removeFromPlan } = usePlan();

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
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>My Meal Plan</h1>
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
            className={styles.clearAllButton}
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all meals?')) {
                events.forEach(event => removeFromPlan(event.id));
              }
            }}
          >
            Clear All
          </button>
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
        />
      </div>
    </div>
  );
};

export default PlanPage;