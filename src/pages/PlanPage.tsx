/* src/pages/PlanPage.tsx */

import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import styles from './PlanPage.module.css';
import { usePlan } from '../hooks/usePlan';
import type { PlanEvent, MealPlanTemplate } from '../context/PlanContextTypes';
import { searchRecipes } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';
import TemplateModal from '../components/TemplateModal';
import QuickSuggestionsModal from '../components/QuickSuggestionsModal';

interface SwapRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwap: (recipe: Recipe) => void;
  currentEvent: PlanEvent | null;
}

const SwapRecipeModal: React.FC<SwapRecipeModalProps> = ({ isOpen, onClose, onSwap }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await searchRecipes({ query: searchTerm, number: 10 });
      setRecipes(response.results || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    onSwap(recipe);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.swapModalBackdrop} onClick={onClose}>
      <div className={styles.swapModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.swapModalHeader}>
          <h3>Swap Recipe</h3>
          <button className={styles.swapModalClose} onClick={onClose}>×</button>
        </div>

        <div className={styles.swapModalSearch}>
          <input
            type="text"
            placeholder="Search for a recipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.swapModalInput}
          />
          <button onClick={handleSearch} className={styles.swapModalSearchBtn}>
            Search
          </button>
        </div>

        <div className={styles.swapModalResults}>
          {loading ? (
            <div className={styles.swapModalLoading}>Searching...</div>
          ) : (
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                className={styles.swapModalRecipe}
                onClick={() => handleRecipeSelect(recipe)}
              >
                <img src={recipe.image} alt={recipe.title} />
                <div className={styles.swapModalRecipeInfo}>
                  <h4>{recipe.title}</h4>
                  <p>Ready in {recipe.readyInMinutes} minutes</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const PlanPage: React.FC = () => {
  const { events, removeFromPlan, clearAll, updateEvent, addToPlan, templates, applyTemplate, getNutritionalStats, getQuickSuggestions } = usePlan();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<PlanEvent['mealType']>('dinner');

  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      backgroundColor: getMealTypeColor(event.mealType),
      borderColor: getMealTypeColor(event.mealType),
      extendedProps: {
        mealType: event.mealType,
        difficulty: event.difficulty,
        prepTime: event.prepTime,
        cookTime: event.cookTime,
        nutrition: event.nutrition
      }
    }));
  }, [events]);

  const today = new Date().toISOString().split('T')[0];
  const todayStats = getNutritionalStats(today);
  const todayEvents = events.filter(event => event.date === today);

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '#FF6B6B';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#45B7D1';
      case 'snack': return '#96CEB4';
      default: return '#546A04';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#546A04';
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.title === clickInfo.event.title);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const event = events.find(e => e.title === dropInfo.event.title);
    if (event && dropInfo.event.start) {
      const newDate = dropInfo.event.start.toISOString().split('T')[0];
      updateEvent(event.id, { ...event, date: newDate });
    }
  };

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  const handleSwapRecipe = (recipe: Recipe) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, { ...selectedEvent, title: recipe.title, recipeId: recipe.id, image: recipe.image });
    }
  };

  const handleApplyTemplate = (template: MealPlanTemplate, startDate: string) => {
    applyTemplate(template, startDate);
  };

  const handleQuickSuggestion = (mealType: PlanEvent['mealType']) => {
    setSelectedMealType(mealType);
    setShowQuickSuggestions(true);
  };

  const handleAddQuickMeal = (meal: Omit<PlanEvent, 'id'>) => {
    addToPlan(meal);
  };

  return (
    <div className={styles.planPageContainer}>
      <div className={styles.contentWrapper}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Meal Planner</h1>
            <p className={styles.pageSubtitle}>Plan your meals, track nutrition, and discover new recipes</p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.templateButton}
              onClick={() => setShowTemplateModal(true)}
            >
              📋 Use Template
            </button>
            <button
              className={styles.quickSuggestButton}
              onClick={() => handleQuickSuggestion('dinner')}
            >
              ⚡ Quick Ideas
            </button>
            <button
              className={styles.clearAllButton}
              onClick={() => setShowClearConfirm(true)}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3>{events.length}</h3>
              <p>Planned Meals</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>🍽️</div>
            <div className={styles.statContent}>
              <h3>{todayEvents.length}</h3>
              <p>Today's Meals</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statContent}>
              <h3>{Math.round(todayStats.calories)}</h3>
              <p>Today's Calories</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>💪</div>
            <div className={styles.statContent}>
              <h3>{Math.round(todayStats.protein)}g</h3>
              <p>Protein Today</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3 className={styles.quickActionsTitle}>Quick Add Meals</h3>
          <div className={styles.quickActionButtons}>
            <button
              className={styles.quickActionBtn}
              onClick={() => handleQuickSuggestion('breakfast')}
            >
              🌅 Breakfast
            </button>
            <button
              className={styles.quickActionBtn}
              onClick={() => handleQuickSuggestion('lunch')}
            >
              ☀️ Lunch
            </button>
            <button
              className={styles.quickActionBtn}
              onClick={() => handleQuickSuggestion('dinner')}
            >
              🌙 Dinner
            </button>
            <button
              className={styles.quickActionBtn}
              onClick={() => handleQuickSuggestion('snack')}
            >
              🍎 Snack
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className={styles.calendarContainer}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            selectable={true}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            dayMaxEvents={true}
            eventDisplay="block"
            eventClassNames={styles.calendarEvent}
          />
        </div>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <div className={styles.todayEvents}>
            <h3 className={styles.todayEventsTitle}>Today's Meals</h3>
            <div className={styles.eventsList}>
              {todayEvents.map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventHeader}>
                    <span className={styles.mealTypeIcon}>
                      {getMealTypeIcon(event.mealType)}
                    </span>
                    <h4 className={styles.eventTitle}>{event.title}</h4>
                    {event.difficulty && (
                      <span
                        className={styles.difficultyBadge}
                        style={{ backgroundColor: getDifficultyColor(event.difficulty) }}
                      >
                        {event.difficulty}
                      </span>
                    )}
                  </div>

                  <div className={styles.eventDetails}>
                    {(event.prepTime || event.cookTime) && (
                      <div className={styles.timeInfo}>
                        <span>⏱️</span>
                        <span>
                          {event.prepTime && event.cookTime
                            ? `${event.prepTime + event.cookTime} min`
                            : 'Quick'
                          }
                        </span>
                      </div>
                    )}

                    {event.nutrition && (
                      <div className={styles.nutritionInfo}>
                        <span>🔥 {Math.round(event.nutrition.calories)} cal</span>
                        <span>💪 {Math.round(event.nutrition.protein)}g protein</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.eventActions}>
                    <button
                      className={styles.swapButton}
                      onClick={() => setSelectedEvent(event)}
                    >
                      🔄 Swap
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromPlan(event.id)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Nutritional Overview */}
        <div className={styles.nutritionalOverview}>
          <h3 className={styles.nutritionTitle}>Today's Nutrition</h3>
          <div className={styles.nutritionGrid}>
            <div className={styles.nutritionItem}>
              <div className={styles.nutritionIcon}>🔥</div>
              <div className={styles.nutritionContent}>
                <h4>{Math.round(todayStats.calories)}</h4>
                <p>Calories</p>
              </div>
            </div>

            <div className={styles.nutritionItem}>
              <div className={styles.nutritionIcon}>💪</div>
              <div className={styles.nutritionContent}>
                <h4>{Math.round(todayStats.protein)}g</h4>
                <p>Protein</p>
              </div>
            </div>

            <div className={styles.nutritionItem}>
              <div className={styles.nutritionIcon}>🌾</div>
              <div className={styles.nutritionContent}>
                <h4>{Math.round(todayStats.carbs)}g</h4>
                <p>Carbs</p>
              </div>
            </div>

            <div className={styles.nutritionItem}>
              <div className={styles.nutritionIcon}>🥑</div>
              <div className={styles.nutritionContent}>
                <h4>{Math.round(todayStats.fat)}g</h4>
                <p>Fat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className={styles.confirmModalBackdrop} onClick={() => setShowClearConfirm(false)}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <h3>Clear All Meals?</h3>
              <p>This will remove all planned meals. This action cannot be undone.</p>
              <div className={styles.confirmModalActions}>
                <button onClick={() => setShowClearConfirm(false)}>Cancel</button>
                <button onClick={handleClearAll} className={styles.confirmButton}>Clear All</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SwapRecipeModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSwap={handleSwapRecipe}
        currentEvent={selectedEvent}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onApplyTemplate={handleApplyTemplate}
        templates={templates}
      />

      <QuickSuggestionsModal
        isOpen={showQuickSuggestions}
        onClose={() => setShowQuickSuggestions(false)}
        onAddMeal={handleAddQuickMeal}
        mealType={selectedMealType}
        maxTime={30}
        getQuickSuggestions={getQuickSuggestions}
      />
    </div>
  );
};

export default PlanPage;