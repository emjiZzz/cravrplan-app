
/* src/pages/PlanPage.tsx */

import React, { useState, useMemo, useEffect } from 'react';
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

const SwapRecipeModal: React.FC<SwapRecipeModalProps> = ({ isOpen, onClose, onSwap, currentEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'suggestions'>('suggestions');

  useEffect(() => {
    if (isOpen && currentEvent) {
      loadSuggestedRecipes();
    }
  }, [isOpen, currentEvent]);

  const loadSuggestedRecipes = async () => {
    if (!currentEvent) return;

    setLoadingSuggestions(true);
    try {
      const mealType = currentEvent.mealType;
      const searchParams: any = {
        number: 8,
        addRecipeInformation: true,
        fillIngredients: true
      };

      switch (mealType) {
        case 'breakfast':
          searchParams.query = 'breakfast healthy';
          searchParams.diet = 'vegetarian';
          searchParams.maxReadyTime = 20;
          break;
        case 'lunch':
          searchParams.query = 'lunch quick';
          searchParams.maxReadyTime = 30;
          break;
        case 'dinner':
          searchParams.query = 'dinner family';
          searchParams.maxReadyTime = 45;
          break;
        case 'snack':
          searchParams.query = 'snack healthy';
          searchParams.diet = 'vegetarian';
          searchParams.maxReadyTime = 15;
          break;
        default:
          searchParams.query = 'quick easy';
      }

      const response = await searchRecipes(searchParams);
      setSuggestedRecipes(response.results || []);
    } catch (error) {
      console.error('Error loading suggested recipes:', error);
      setSuggestedRecipes([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

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

        <div className={styles.swapModalTabs}>
          <button
            className={`${styles.swapModalTab} ${activeTab === 'suggestions' ? styles.active : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Smart Suggestions
          </button>
          <button
            className={`${styles.swapModalTab} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Recipes
          </button>
        </div>

        {activeTab === 'suggestions' && (
          <div className={styles.swapModalContent}>
            <div className={styles.swapModalSection}>
              <h4>Perfect for {currentEvent?.mealType || 'meal'}</h4>
              {loadingSuggestions ? (
                <div className={styles.swapModalLoading}>Finding perfect recipes...</div>
              ) : (
                <div className={styles.swapModalResults}>
                  {suggestedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className={styles.swapModalRecipe}
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <img
                        src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwTDIwMCAxMDBMMzAwIDE1MEwyMDAgMjAwTDEwMCAxNTBaIiBmaWxsPSIjRENEQ0RDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                        alt={recipe.title}
                      />
                      <div className={styles.swapModalRecipeInfo}>
                        <h4>{recipe.title}</h4>
                        <p>{recipe.readyInMinutes} min • {recipe.servings || 2} servings</p>
                        {recipe.diets && recipe.diets.length > 0 && (
                          <p>{recipe.diets.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {suggestedRecipes.length === 0 && !loadingSuggestions && (
                    <div className={styles.swapModalEmpty}>
                      <p>No suggestions available. Try searching instead.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className={styles.swapModalContent}>
            <div className={styles.swapModalSearch}>
              <input
                type="text"
                placeholder="Search for recipes..."
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
                <div className={styles.swapModalLoading}>Searching recipes...</div>
              ) : (
                recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={styles.swapModalRecipe}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <img
                      src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwTDIwMCAxMDBMMzAwIDE1MEwyMDAgMjAwTDEwMCAxNTBaIiBmaWxsPSIjRENEQ0RDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                      alt={recipe.title}
                    />
                    <div className={styles.swapModalRecipeInfo}>
                      <h4>{recipe.title}</h4>
                      <p>{recipe.readyInMinutes} min • {recipe.servings || 2} servings</p>
                      {recipe.diets && recipe.diets.length > 0 && (
                        <p>{recipe.diets.join(', ')}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {recipes.length === 0 && !loading && searchTerm && (
                <div className={styles.swapModalEmpty}>
                  <p>No recipes found. Try a different search term.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanPage: React.FC = () => {
  const {
    events,
    removeFromPlan,
    clearAll,
    updateEvent,
    addToPlan,
    templates,
    applyTemplate,
    getNutritionalStats,
    getQuickSuggestions
  } = usePlan();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<PlanEvent['mealType']>('dinner');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Enhanced color scheme
  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '#FF6B6B';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#45B7D1';
      case 'snack': return '#96CEB4';
      default: return '#546A04';
    }
  };

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
      updateEvent(selectedEvent.id, {
        ...selectedEvent,
        title: recipe.title,
        recipeId: recipe.id,
        image: recipe.image,
        nutrition: {
          calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
          protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
          carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
          fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0
        }
      });
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

  const getWeeklyStats = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const stats = getNutritionalStats(dateStr);
      totalCalories += stats.calories;
      totalProtein += stats.protein;
      totalCarbs += stats.carbs;
      totalFat += stats.fat;
    }

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className={styles.planPageContainer}>
      {/* Enhanced Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Smart Meal Planner</h1>
          <p className={styles.pageSubtitle}>Plan, track, and optimize your nutrition journey</p>
        </div>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.actionGroup}>
          <button
            className={styles.primaryButton}
            onClick={() => setShowTemplateModal(true)}
          >
            Templates
          </button>
          <button
            className={styles.primaryButton}
            onClick={() => handleQuickSuggestion('dinner')}
          >
            Quick Add
          </button>
        </div>



        <div className={styles.actionGroup}>
          <button
            className={styles.clearAllButton}
            onClick={() => setShowClearConfirm(true)}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Plan Analytics */}
      <div className={styles.analyticsHeader}>
        <h2 className={styles.analyticsTitle}>
          Plan Analytics
        </h2>

        {/* Enhanced Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3>{events.length}</h3>
              <p>Total Meals</p>
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
      </div>

      {/* Main Dashboard */}
      <div className={styles.mainContent}>
        {/* Calendar & Events */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            Smart Calendar
          </h2>



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

          {/* Today's Smart Events */}
          {todayEvents.length > 0 && (
            <div className={styles.todayEvents}>
              <h3 className={styles.todayEventsTitle}>Today's Meal Plan</h3>
              <div className={styles.eventsList}>
                {todayEvents.map((event) => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={styles.eventHeader}>
                      <div className={styles.mealTypeIcon}>
                        {getMealTypeIcon(event.mealType)}
                      </div>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      <span
                        className={styles.difficultyBadge}
                        style={{ backgroundColor: getDifficultyColor(event.difficulty || 'easy') }}
                      >
                        {event.difficulty || 'Easy'}
                      </span>
                    </div>

                    <div className={styles.eventDetails}>
                      <div className={styles.timeInfo}>
                        <span>⏱️</span>
                        <span>
                          {event.prepTime && event.cookTime
                            ? `${event.prepTime + event.cookTime} min`
                            : 'Quick'
                          }
                        </span>
                      </div>
                      <div className={styles.nutritionInfo}>
                        <span>🔥</span>
                        <span>{event.nutrition ? Math.round(event.nutrition.calories) : 0} cal</span>
                      </div>
                      <div className={styles.nutritionInfo}>
                        <span>💪</span>
                        <span>{event.nutrition ? Math.round(event.nutrition.protein) : 0}g protein</span>
                      </div>
                    </div>

                    <div className={styles.eventActions}>
                      <button
                        className={styles.swapButton}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowSwapModal(true);
                        }}
                      >
                        Swap
                      </button>
                      <button
                        className={styles.removeButton}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRemoveConfirm(true);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {todayEvents.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🍽️</div>
              <h3>No meals planned for today</h3>
              <p>Start by adding some delicious meals to your plan!</p>
              <button
                className={styles.addMealButton}
                onClick={() => handleQuickSuggestion('dinner')}
              >
                Add Your First Meal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modals */}
      <SwapRecipeModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
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

      {/* Enhanced Confirmation Modals */}
      {showClearConfirm && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowClearConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Clear All Meals?</h3>
            <p>This will remove all planned meals from your calendar. This action cannot be undone.</p>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button onClick={handleClearAll} className={styles.confirmButton}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveConfirm && selectedEvent && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowRemoveConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Remove Meal?</h3>
            <p>Are you sure you want to remove "{selectedEvent.title}" from your meal plan?</p>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
              <button
                onClick={() => {
                  removeFromPlan(selectedEvent.id);
                  setShowRemoveConfirm(false);
                  setSelectedEvent(null);
                }}
                className={styles.confirmButton}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Analytics Modal */}
      {showNutritionModal && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowNutritionModal(false)}>
          <div className={styles.nutritionModal} onClick={(e) => e.stopPropagation()}>
            <h3>Nutrition Analytics</h3>
            <div className={styles.nutritionAnalytics}>
              <div className={styles.analyticsSection}>
                <h4>Weekly Overview</h4>
                <div className={styles.analyticsGrid}>
                  <div className={styles.analyticsItem}>
                    <span>Total Calories</span>
                    <span>{Math.round(weeklyStats.totalCalories)}</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span>Total Protein</span>
                    <span>{Math.round(weeklyStats.totalProtein)}g</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span>Total Carbs</span>
                    <span>{Math.round(weeklyStats.totalCarbs)}g</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span>Total Fat</span>
                    <span>{Math.round(weeklyStats.totalFat)}g</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowNutritionModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanPage;