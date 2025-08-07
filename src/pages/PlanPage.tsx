
/* src/pages/PlanPage.tsx */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlanPage.module.css';
import { usePlan } from '../context/PlanContext';
import type { Recipe } from '../types/recipeTypes';
import type { PlanEvent, MealPlanTemplate } from '../context/PlanContextTypes';
import type { EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';

interface SwapRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwap: (recipe: Recipe) => void;
  currentEvent: PlanEvent | null;
}

const SwapRecipeModal: React.FC<SwapRecipeModalProps> = ({ isOpen, onClose, onSwap, currentEvent }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'suggestions'>('search');

  const loadSuggestedRecipes = async () => {
    if (!currentEvent) return;

    setLoading(true);
    try {
      // Mock suggested recipes based on meal type
      const suggestions: Recipe[] = [
        {
          id: 101,
          title: "Quick Breakfast Bowl",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
          imageType: "jpg",
          servings: 1,
          readyInMinutes: 10,
          aggregateLikes: 45,
          healthScore: 85,
          spoonacularScore: 92,
          pricePerServing: 250,
          analyzedInstructions: [],
          cheap: false,
          cuisines: ["American"],
          dairyFree: false,
          diets: ["Vegetarian"],
          gaps: "GAPS",
          glutenFree: false,
          instructions: "Quick and healthy breakfast bowl",
          ketogenic: false,
          lowFodmap: false,
          occasions: ["Breakfast"],
          sustainable: true,
          vegan: false,
          vegetarian: true,
          veryHealthy: true,
          veryPopular: false,
          whole30: false,
          weightWatcherSmartPoints: 8,
          dishTypes: ["Breakfast"],
          extendedIngredients: [],
          summary: "A quick and nutritious breakfast bowl"
        },
        {
          id: 102,
          title: "Light Lunch Salad",
          image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
          imageType: "jpg",
          servings: 2,
          readyInMinutes: 15,
          aggregateLikes: 67,
          healthScore: 78,
          spoonacularScore: 88,
          pricePerServing: 320,
          analyzedInstructions: [],
          cheap: false,
          cuisines: ["Mediterranean"],
          dairyFree: true,
          diets: ["Vegetarian"],
          gaps: "GAPS",
          glutenFree: true,
          instructions: "Fresh and light lunch salad",
          ketogenic: false,
          lowFodmap: false,
          occasions: ["Lunch"],
          sustainable: true,
          vegan: true,
          vegetarian: true,
          veryHealthy: true,
          veryPopular: false,
          whole30: false,
          weightWatcherSmartPoints: 12,
          dishTypes: ["Main Course"],
          extendedIngredients: [],
          summary: "A refreshing and healthy lunch option"
        }
      ];

      setRecipes(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Mock search results
      const searchResults: Recipe[] = [
        {
          id: 201,
          title: `Search Result: ${searchTerm}`,
          image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
          imageType: "jpg",
          servings: 2,
          readyInMinutes: 25,
          aggregateLikes: 89,
          healthScore: 72,
          spoonacularScore: 85,
          pricePerServing: 280,
          analyzedInstructions: [],
          cheap: true,
          cuisines: ["International"],
          dairyFree: true,
          diets: ["High-Protein"],
          gaps: "GAPS",
          glutenFree: false,
          instructions: "Search result recipe",
          ketogenic: false,
          lowFodmap: false,
          occasions: ["Dinner"],
          sustainable: false,
          vegan: false,
          vegetarian: false,
          veryHealthy: false,
          veryPopular: true,
          whole30: false,
          weightWatcherSmartPoints: 10,
          dishTypes: ["Main Course"],
          extendedIngredients: [],
          summary: "A search result recipe"
        }
      ];

      setRecipes(searchResults);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    onSwap(recipe);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && activeTab === 'suggestions') {
      loadSuggestedRecipes();
    }
  }, [isOpen, activeTab]);

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
            className={`${styles.swapModalTab} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Recipes
          </button>
          <button
            className={`${styles.swapModalTab} ${activeTab === 'suggestions' ? styles.active : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggested Recipes
          </button>
        </div>

        <div className={styles.swapModalContent}>
          {activeTab === 'search' && (
            <div className={styles.swapModalSection}>
              <h4>Search for a new recipe</h4>
              <div className={styles.swapModalSearch}>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.swapModalInput}
                />
                <button
                  onClick={handleSearch}
                  className={styles.swapModalSearchBtn}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.swapModalResults}>
            {loading ? (
              <div className={styles.swapModalLoading}>Loading...</div>
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
                    <p>{recipe.summary}</p>
                    {recipe.diets.length > 0 && (
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
      </div>
    </div>
  );
};

// Custom Grid Calendar Component
const GridCalendar: React.FC<{ events: PlanEvent[]; onEventClick: (event: PlanEvent) => void }> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState<PlanEvent | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const navigate = useNavigate();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    return { daysInMonth, firstDayOfWeek };
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getNutritionColor = (nutrition: any, type: 'calories' | 'protein' | 'carbs' | 'fat') => {
    const colors = {
      calories: '#9C27B0', // Purple
      protein: '#4CAF50',  // Green
      carbs: '#FFC107',    // Yellow
      fat: '#F44336'       // Red
    };

    const maxValues = {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65
    };

    const percentage = Math.min((nutrition?.[type] || 0) / maxValues[type], 1);
    const color = colors[type];

    return {
      backgroundColor: color,
      opacity: 0.3 + (percentage * 0.7),
      percentage: Math.round(percentage * 100)
    };
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

  const handleImageClick = (event: PlanEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRecipe(event);
    setShowRecipeModal(true);
  };

  const handleViewRecipeInstructions = () => {
    if (selectedRecipe) {
      setShowRecipeModal(false);
      navigate(`/recipes/${selectedRecipe.recipeId}`);
    }
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendarDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add day headers
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className={styles.calendarDayHeader}>
          {day}
        </div>
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = getEventsForDate(dateString);

      days.push(
        <div key={day} className={styles.calendarDay}>
          <div className={styles.calendarDayNumber}>{day}</div>
          <div className={styles.calendarDayEvents}>
            {dayEvents.map((event, index) => {
              const caloriesColor = getNutritionColor(event.nutrition, 'calories');
              const proteinColor = getNutritionColor(event.nutrition, 'protein');
              const carbsColor = getNutritionColor(event.nutrition, 'carbs');
              const fatColor = getNutritionColor(event.nutrition, 'fat');

              return (
                <div
                  key={event.id}
                  className={styles.calendarEventCard}
                  onClick={() => onEventClick(event)}
                >
                  <div className={`${styles.mealTypeIndicator} ${styles[event.mealType]}`}>
                    {getMealTypeIcon(event.mealType)}
                  </div>
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className={styles.calendarEventImage}
                      onClick={(e) => handleImageClick(event, e)}
                    />
                  )}
                  <div className={styles.calendarEventInfo}>
                    <div className={styles.calendarEventNutrition}>
                      {event.nutrition && (
                        <>
                          <div
                            className={styles.nutritionIndicator}
                            style={{ backgroundColor: caloriesColor.backgroundColor, opacity: caloriesColor.opacity }}
                            data-percentage={`${caloriesColor.percentage}% Calories`}
                            title={`${Math.round(event.nutrition.calories)} calories (${caloriesColor.percentage}%)`}
                          />
                          <div
                            className={styles.nutritionIndicator}
                            style={{ backgroundColor: proteinColor.backgroundColor, opacity: proteinColor.opacity }}
                            data-percentage={`${proteinColor.percentage}% Protein`}
                            title={`${Math.round(event.nutrition.protein)}g protein (${proteinColor.percentage}%)`}
                          />
                          <div
                            className={styles.nutritionIndicator}
                            style={{ backgroundColor: carbsColor.backgroundColor, opacity: carbsColor.opacity }}
                            data-percentage={`${carbsColor.percentage}% Carbs`}
                            title={`${Math.round(event.nutrition.carbs)}g carbs (${carbsColor.percentage}%)`}
                          />
                          <div
                            className={styles.nutritionIndicator}
                            style={{ backgroundColor: fatColor.backgroundColor, opacity: fatColor.opacity }}
                            data-percentage={`${fatColor.percentage}% Fat`}
                            title={`${Math.round(event.nutrition.fat)}g fat (${fatColor.percentage}%)`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <>
      <div className={styles.gridCalendar}>
        <div className={styles.calendarHeader}>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className={styles.calendarNavButton}
          >
            ‹
          </button>
          <h3 className={styles.calendarTitle}>{monthName}</h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className={styles.calendarNavButton}
          >
            ›
          </button>
        </div>

        <div className={styles.calendarGrid}>
          {renderCalendarDays()}
        </div>

        {/* Nutrition Legend */}
        <div className={styles.nutritionLegend}>
          <h4>Nutrition Legend</h4>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#9C27B0' }}></div>
              <span>Calories</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#4CAF50' }}></div>
              <span>Protein</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#FFC107' }}></div>
              <span>Carbs</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#F44336' }}></div>
              <span>Fats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Details Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className={styles.recipeModalBackdrop} onClick={() => setShowRecipeModal(false)}>
          <div className={styles.recipeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.recipeModalHeader}>
              <h3>{selectedRecipe.title}</h3>
              <button className={styles.recipeModalClose} onClick={() => setShowRecipeModal(false)}>×</button>
            </div>

            <div className={styles.recipeModalContent}>
              {selectedRecipe.image && (
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className={styles.recipeModalImage}
                />
              )}

              <div className={styles.recipeModalInfo}>
                <div className={styles.recipeModalSection}>
                  <h4>Meal Details</h4>
                  <div className={styles.recipeModalDetails}>
                    <div className={styles.recipeDetailItem}>
                      <span>Meal Type:</span>
                      <span>{selectedRecipe.mealType.charAt(0).toUpperCase() + selectedRecipe.mealType.slice(1)}</span>
                    </div>
                    <div className={styles.recipeDetailItem}>
                      <span>Difficulty:</span>
                      <span>{selectedRecipe.difficulty || 'Easy'}</span>
                    </div>
                    {selectedRecipe.prepTime && selectedRecipe.cookTime && (
                      <div className={styles.recipeDetailItem}>
                        <span>Total Time:</span>
                        <span>{selectedRecipe.prepTime + selectedRecipe.cookTime} minutes</span>
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className={styles.recipeDetailItem}>
                        <span>Servings:</span>
                        <span>{selectedRecipe.servings}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRecipe.nutrition && (
                  <div className={styles.recipeModalSection}>
                    <h4>Nutrition Information</h4>
                    <div className={styles.recipeModalNutrition}>
                      <div className={styles.nutritionItem}>
                        <span>Calories:</span>
                        <span>{Math.round(selectedRecipe.nutrition.calories)} cal</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span>Protein:</span>
                        <span>{Math.round(selectedRecipe.nutrition.protein)}g</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span>Carbohydrates:</span>
                        <span>{Math.round(selectedRecipe.nutrition.carbs)}g</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span>Fat:</span>
                        <span>{Math.round(selectedRecipe.nutrition.fat)}g</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipe Instructions Button */}
                <div className={styles.recipeModalSection}>
                  <button
                    className={styles.recipeInstructionsButton}
                    onClick={handleViewRecipeInstructions}
                  >
                    📖 See Recipe Instructions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
    getQuickSuggestions,
    ensureNutritionData
  } = usePlan();

  // Ensure all events have nutrition data when component mounts
  React.useEffect(() => {
    ensureNutritionData();
  }, [ensureNutritionData]);

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

  const handleEventClick = (event: PlanEvent) => {
    setSelectedEvent(event);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const event = events.find(e => e.id === dropInfo.event.id);
    if (event) {
      const newDate = dropInfo.event.startStr;
      updateEvent(event.id, { ...event, date: newDate });
    }
  };

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  const handleSwapRecipe = (recipe: Recipe) => {
    if (selectedEvent) {
      // Generate nutrition data automatically based on recipe characteristics
      const generateNutritionData = (recipe: Recipe, mealType: string) => {
        const baseNutrition = {
          breakfast: { calories: 350, protein: 15, carbs: 45, fat: 12 },
          lunch: { calories: 450, protein: 20, carbs: 55, fat: 18 },
          dinner: { calories: 550, protein: 25, carbs: 60, fat: 22 },
          snack: { calories: 200, protein: 8, carbs: 25, fat: 8 }
        };

        const base = baseNutrition[mealType as keyof typeof baseNutrition] || baseNutrition.lunch;
        const title = recipe.title?.toLowerCase() || '';

        let calories = base.calories;
        let protein = base.protein;
        let carbs = base.carbs;
        let fat = base.fat;

        // Adjust based on recipe characteristics
        if (title.includes('chicken') || title.includes('fish') || title.includes('salmon') ||
          title.includes('beef') || title.includes('meat') || title.includes('protein')) {
          protein += 10;
          calories += 50;
        }

        if (title.includes('pasta') || title.includes('rice') || title.includes('bread') ||
          title.includes('potato') || title.includes('noodle')) {
          carbs += 15;
          calories += 80;
        }

        if (title.includes('salad') || title.includes('soup') || title.includes('light') ||
          title.includes('vegetable')) {
          calories -= 100;
          fat -= 5;
        }

        if (title.includes('cheese') || title.includes('cream') || title.includes('butter') ||
          title.includes('fried') || title.includes('bacon')) {
          fat += 8;
          calories += 60;
        }

        if (recipe.vegetarian || title.includes('vegetarian') || title.includes('vegan')) {
          protein -= 5;
          carbs += 10;
        }

        if (recipe.readyInMinutes && recipe.readyInMinutes <= 15) {
          calories -= 50;
          protein -= 3;
        }

        if (recipe.servings) {
          const servingFactor = recipe.servings;
          calories = Math.round(calories / servingFactor);
          protein = Math.round(protein / servingFactor);
          carbs = Math.round(carbs / servingFactor);
          fat = Math.round(fat / servingFactor);
        }

        return {
          calories: Math.max(150, Math.round(calories)),
          protein: Math.max(5, Math.round(protein)),
          carbs: Math.max(10, Math.round(carbs)),
          fat: Math.max(3, Math.round(fat))
        };
      };

      const updatedEvent: PlanEvent = {
        ...selectedEvent,
        title: recipe.title,
        image: recipe.image,
        nutrition: generateNutritionData(recipe, selectedEvent.mealType)
      };
      updateEvent(selectedEvent.id, updatedEvent);
      setSelectedEvent(null);
    }
  };

  const handleApplyTemplate = (template: MealPlanTemplate, startDate: string) => {
    applyTemplate(template, startDate);
    setShowTemplateModal(false);
  };

  const handleQuickSuggestion = (mealType: PlanEvent['mealType']) => {
    setSelectedMealType(mealType);
    setShowQuickSuggestions(true);
  };

  const handleAddQuickMeal = (meal: Omit<PlanEvent, 'id'>) => {
    addToPlan(meal);
    setShowQuickSuggestions(false);
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weeklyStats = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayStats = getNutritionalStats(dateString);

      weeklyStats.calories += dayStats.calories;
      weeklyStats.protein += dayStats.protein;
      weeklyStats.carbs += dayStats.carbs;
      weeklyStats.fat += dayStats.fat;
    }

    return weeklyStats;
  };

  return (
    <div className={styles.planPageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Smart Meal Planner</h1>
          <p className={styles.pageSubtitle}>Plan, track, and optimize your nutrition journey</p>
        </div>
      </div>

      {/* Plan Analytics */}
      <div className={styles.analyticsHeader}>
        {/* Enhanced Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statContent}>
              <h3>{events.length}</h3>
              <p>Total Meals</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statContent}>
              <h3>{todayEvents.length}</h3>
              <p>Today's Meals</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statContent}>
              <h3>{Math.round(todayStats.calories)}</h3>
              <p>Today's Calories</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statContent}>
              <h3>{Math.round(todayStats.protein)}g</h3>
              <p>Protein Today</p>
            </div>
          </div>
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

      {/* Main Dashboard */}
      <div className={styles.mainContent}>
        {/* Calendar & Events */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            Smart Calendar
          </h2>

          {/* Custom Grid Calendar */}
          <div className={styles.calendarContainer}>
            <GridCalendar
              events={events}
              onEventClick={handleEventClick}
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
                            : 'Time not specified'}
                        </span>
                      </div>
                      {event.nutrition && (
                        <div className={styles.nutritionInfo}>
                          <span>🍽️</span>
                          <span>
                            {Math.round(event.nutrition.calories)} cal | {Math.round(event.nutrition.protein)}g protein
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.eventActions}>
                      <button
                        className={styles.swapButton}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowSwapModal(true);
                        }}
                      >
                        Swap Recipe
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
          {events.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3>No meals planned yet</h3>
              <p>Start by adding some meals to your plan</p>
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

      {/* Modals */}
      <SwapRecipeModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSwap={handleSwapRecipe}
        currentEvent={selectedEvent}
      />

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowClearConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Clear All Meals</h3>
            <p>Are you sure you want to remove all planned meals? This action cannot be undone.</p>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className={styles.confirmButton} onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && selectedEvent && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowRemoveConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Remove Meal</h3>
            <p>Are you sure you want to remove "{selectedEvent.title}" from your plan?</p>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
              <button
                className={styles.confirmButton}
                onClick={() => {
                  removeFromPlan(selectedEvent.id);
                  setShowRemoveConfirm(false);
                  setSelectedEvent(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanPage;