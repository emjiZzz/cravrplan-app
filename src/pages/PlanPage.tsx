
/* src/pages/PlanPage.tsx */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlanPage.module.css';
import { usePlan } from '../context/PlanContext';
import type { Recipe } from '../types/recipeTypes';
import type { PlanEvent } from '../context/PlanContextTypes';

interface SwapRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwap: (recipe: Recipe) => void;
  currentEvent: PlanEvent | null;
}

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomRecipe: (recipeData: { title: string; mealType: string; date: string }) => void;
  onBrowseRecipes: () => void;
  selectedDate: string;
}

const SwapRecipeModal: React.FC<SwapRecipeModalProps> = ({ isOpen, onClose, onSwap, currentEvent }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'suggestions'>('search');

  const loadSuggestedRecipes = async () => {
    if (!currentEvent) return;

    setLoading(true);
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
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
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
    setLoading(false);
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

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onAddCustomRecipe, onBrowseRecipes, selectedDate }) => {
  const [recipeTitle, setRecipeTitle] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [isCustomRecipe, setIsCustomRecipe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipeTitle.trim()) {
      onAddCustomRecipe({
        title: recipeTitle.trim(),
        mealType,
        date: selectedDate
      });
      setRecipeTitle('');
      setMealType('breakfast');
      setIsCustomRecipe(false);
      onClose();
    }
  };

  const handleBrowseRecipes = () => {
    onBrowseRecipes();
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.addMealModalBackdrop} onClick={onClose}>
      <div className={styles.addMealModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.addMealModalHeader}>
          <h3>Add Meal for {formatDate(selectedDate)}</h3>
        </div>

        <div className={styles.addMealModalContent}>
          <div className={styles.addMealOptions}>
            <button
              className={`${styles.addMealOption} ${!isCustomRecipe ? styles.active : ''}`}
              onClick={() => setIsCustomRecipe(false)}
            >
              <div className={styles.addMealOptionIcon}>🔍</div>
              <div className={styles.addMealOptionContent}>
                <h4>Browse Recipes</h4>
                <p>Search and choose from thousands of recipes</p>
              </div>
            </button>

            <button
              className={`${styles.addMealOption} ${isCustomRecipe ? styles.active : ''}`}
              onClick={() => setIsCustomRecipe(true)}
            >
              <div className={styles.addMealOptionIcon}>✏️</div>
              <div className={styles.addMealOptionContent}>
                <h4>Add Custom Recipe</h4>
                <p>Create your own recipe entry</p>
              </div>
            </button>
          </div>

          {isCustomRecipe && (
            <form onSubmit={handleSubmit} className={styles.customRecipeForm}>
              <div className={styles.formGroup}>
                <label htmlFor="recipeTitle">Recipe Title</label>
                <input
                  id="recipeTitle"
                  type="text"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  placeholder="Enter recipe title..."
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="mealType">Meal Type</label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={onClose} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add Recipe
                </button>
              </div>
            </form>
          )}

          {!isCustomRecipe && (
            <div className={styles.browseRecipesSection}>
              <p>Browse our collection of recipes to find the perfect meal for this day.</p>
              <button onClick={handleBrowseRecipes} className={styles.browseRecipesButton}>
                Browse Recipes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GridCalendar: React.FC<{
  events: PlanEvent[];
  onEventClick: (event: PlanEvent) => void;
  onImageClick: (event: PlanEvent) => void;
  onDayClick: (date: string) => void;
  view: 'month' | 'week';
}> = ({ events, onEventClick, onImageClick, onDayClick, view }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      calories: '#9C27B0',
      protein: '#4CAF50',
      carbs: '#FFC107',
      fat: '#F44336'
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
    onImageClick(event);
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendarDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className={styles.calendarDayHeader}>
          {day}
        </div>
      );
    });

    if (view === 'month') {
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayEvents = getEventsForDate(dateString);

        days.push(
          <div
            key={day}
            className={styles.calendarDay}
            onClick={() => onDayClick(dateString)}
          >
            <div className={styles.calendarDayNumber}>{day}</div>
            <div className={styles.calendarDayEvents}>
              {dayEvents.map((event) => {
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
                              title={`${Math.round(event.nutrition.calories)} calories (${caloriesColor.percentage}%)`}
                            />
                            <div
                              className={styles.nutritionIndicator}
                              style={{ backgroundColor: proteinColor.backgroundColor, opacity: proteinColor.opacity }}
                              title={`${Math.round(event.nutrition.protein)}g protein (${proteinColor.percentage}%)`}
                            />
                            <div
                              className={styles.nutritionIndicator}
                              style={{ backgroundColor: carbsColor.backgroundColor, opacity: carbsColor.opacity }}
                              title={`${Math.round(event.nutrition.carbs)}g carbs (${carbsColor.percentage}%)`}
                            />
                            <div
                              className={styles.nutritionIndicator}
                              style={{ backgroundColor: fatColor.backgroundColor, opacity: fatColor.opacity }}
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
    } else if (view === 'week') {
      // Week view: show current week
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayEvents = getEventsForDate(dateString);

        days.push(
          <div
            key={i}
            className={styles.calendarDay}
            onClick={() => onDayClick(dateString)}
          >
            <div className={styles.calendarDayNumber}>{date.getDate()}</div>
            <div className={styles.calendarDayEvents}>
              {dayEvents.map((event) => {
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
                              title={`${Math.round(event.nutrition.calories)} calories (${caloriesColor.percentage}%)`}
                            />
                            <div
                              className={styles.nutritionIndicator}
                              style={{ backgroundColor: proteinColor.backgroundColor, opacity: proteinColor.opacity }}
                              title={`${Math.round(event.nutrition.protein)}g protein (${proteinColor.percentage}%)`}
                            />
                            <div
                              className={styles.nutritionIndicator}
                              style={{ backgroundColor: carbsColor.backgroundColor, opacity: carbsColor.opacity }}
                              title={`${Math.round(event.nutrition.carbs)}g carbs (${carbsColor.percentage}%)`}
                            />
                            <div
                              className={styles.nutritionIndicator}
                              style={{ backgroundColor: fatColor.backgroundColor, opacity: fatColor.opacity }}
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
    }

    return days;
  };

  return (
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
  );
};

const PlanPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    trashedEvents,
    moveToTrash,
    restoreFromTrash,
    deleteFromTrash,
    clearTrash,
    updateEvent,
    addToPlan,
    ensureNutritionData
  } = usePlan();

  React.useEffect(() => {
    ensureNutritionData();
  }, [ensureNutritionData]);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<PlanEvent | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [showAllMeals, setShowAllMeals] = useState(false);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayEvents = events.filter(event => event.date === todayString);

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
    setSelectedRecipe(event);
    setShowRecipeModal(true);
  };

  const handleClearAll = () => {
    events.forEach(event => {
      moveToTrash(event.id);
    });
    setShowClearConfirm(false);
  };

  const handleSwapRecipe = (recipe: Recipe) => {
    if (selectedEvent) {
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

  const handleViewRecipeInstructions = () => {
    if (selectedRecipe) {
      navigate(`/recipes/${selectedRecipe.recipeId}`);
      setShowRecipeModal(false);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowAddMealModal(true);
  };

  const handleAddCustomRecipe = (recipeData: { title: string; mealType: string; date: string }) => {
    const generateNutritionData = (title: string, mealType: string) => {
      const baseNutrition = {
        breakfast: { calories: 350, protein: 15, carbs: 45, fat: 12 },
        lunch: { calories: 450, protein: 20, carbs: 55, fat: 18 },
        dinner: { calories: 550, protein: 25, carbs: 60, fat: 22 },
        snack: { calories: 200, protein: 8, carbs: 25, fat: 8 }
      };

      const base = baseNutrition[mealType as keyof typeof baseNutrition] || baseNutrition.lunch;
      const titleLower = title.toLowerCase();

      let calories = base.calories;
      let protein = base.protein;
      let carbs = base.carbs;
      let fat = base.fat;

      if (titleLower.includes('chicken') || titleLower.includes('fish') || titleLower.includes('salmon') ||
        titleLower.includes('beef') || titleLower.includes('meat') || titleLower.includes('protein')) {
        protein += 10;
        calories += 50;
      }

      if (titleLower.includes('pasta') || titleLower.includes('rice') || titleLower.includes('bread') ||
        titleLower.includes('potato') || titleLower.includes('noodle')) {
        carbs += 15;
        calories += 80;
      }

      if (titleLower.includes('salad') || titleLower.includes('soup') || titleLower.includes('light') ||
        titleLower.includes('vegetable')) {
        calories -= 100;
        fat -= 5;
      }

      if (titleLower.includes('cheese') || titleLower.includes('cream') || titleLower.includes('butter') ||
        titleLower.includes('fried') || titleLower.includes('bacon')) {
        fat += 8;
        calories += 60;
      }

      return {
        calories: Math.max(150, Math.round(calories)),
        protein: Math.max(5, Math.round(protein)),
        carbs: Math.max(10, Math.round(carbs)),
        fat: Math.max(3, Math.round(fat))
      };
    };

    const newEvent: Omit<PlanEvent, 'id'> = {
      title: recipeData.title,
      date: recipeData.date,
      mealType: recipeData.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 30,
      servings: 2,
      nutrition: generateNutritionData(recipeData.title, recipeData.mealType),
      recipeId: Date.now()
    };

    addToPlan(newEvent);
  };

  const handleBrowseRecipes = () => {
    navigate('/recipes');
  };

  return (
    <div className={styles.planPageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Smart Meal Planner</h1>
          <p className={styles.pageSubtitle}>Plan, track, and optimize your nutrition journey</p>
        </div>
      </div>



      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitleContainer}>
                <h2 className={styles.sectionTitle}>
                  Smart Calendar
                </h2>
                <div className={styles.calendarActions}>
                  <button
                    className={`${styles.viewToggleButton} ${calendarView === 'week' ? styles.active : ''}`}
                    onClick={() => setCalendarView('week')}
                  >
                    📊 Week
                  </button>
                  <button
                    className={`${styles.viewToggleButton} ${calendarView === 'month' ? styles.active : ''}`}
                    onClick={() => setCalendarView('month')}
                  >
                    📅 Month
                  </button>
                  <button
                    className={styles.clearAllButton}
                    onClick={() => setShowClearConfirm(true)}
                  >
                    Clear All
                  </button>
                  <button
                    className={styles.trashButton}
                    onClick={() => setShowTrashModal(true)}
                    title={`Trash (${trashedEvents.length} items)`}
                  >
                    Trash ({trashedEvents.length})
                  </button>
                </div>
              </div>

              <div className={styles.calendarContainer}>
                {events.length === 0 ? (
                  <div className={styles.emptyCalendarState}>
                    <div className={styles.emptyCalendarIcon}></div>
                    <h3>No Meals Planned</h3>
                    <p>Your meal plan is empty. Browse recipes to add meals to your plan.</p>
                    <button
                      className={styles.addFirstMealButton}
                      onClick={() => navigate('/recipes')}
                    >
                      Browse Recipes
                    </button>
                  </div>
                ) : (
                  <GridCalendar
                    events={events}
                    onEventClick={handleEventClick}
                    onImageClick={handleEventClick}
                    onDayClick={handleDayClick}
                    view={calendarView}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitleContainer}>
                <h2 className={styles.sectionTitle}>
                  {showAllMeals ? 'All Meal Plan' : "Today's Meal Plan"}
                </h2>
                <div className={styles.mealPlanToggle}>
                  <button
                    className={`${styles.toggleButton} ${!showAllMeals ? styles.active : ''}`}
                    onClick={() => setShowAllMeals(false)}
                  >
                    Today
                  </button>
                  <button
                    className={`${styles.toggleButton} ${showAllMeals ? styles.active : ''}`}
                    onClick={() => setShowAllMeals(true)}
                  >
                    All Meals
                  </button>
                </div>
              </div>

              {(showAllMeals ? events : todayEvents).length === 0 ? (
                <div className={styles.emptyTodayState}>
                  <div className={styles.emptyTodayIcon}>🍽️</div>
                  <h3>{showAllMeals ? 'No Meals Planned' : 'No Meals Today'}</h3>
                  <p>{showAllMeals ? 'You don\'t have any meals planned yet. Click on a calendar day to add meals!' : 'You don\'t have any meals planned for today. Click on a calendar day to add meals!'}</p>
                </div>
              ) : (
                <div className={styles.eventsList}>
                  {(showAllMeals ? events : todayEvents).map((event) => (
                    <div key={event.id} className={styles.eventItem}>
                      {showAllMeals && (
                        <div className={styles.eventDate}>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
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
                            moveToTrash(event.id);
                          }}
                        >
                          Move to Trash
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SwapRecipeModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSwap={handleSwapRecipe}
        currentEvent={selectedEvent}
      />

      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddCustomRecipe={handleAddCustomRecipe}
        onBrowseRecipes={handleBrowseRecipes}
        selectedDate={selectedDate}
      />

      {showClearConfirm && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowClearConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Move All to Trash</h3>
            <p>Are you sure you want to move all planned meals to trash? You can restore them later from the trash.</p>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className={styles.confirmButton} onClick={handleClearAll}>
                Move All to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrashModal && (
        <div className={styles.confirmModalBackdrop} onClick={() => setShowTrashModal(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Trash ({trashedEvents.length} items)</h3>
            {trashedEvents.length === 0 ? (
              <p>No items in trash</p>
            ) : (
              <div className={styles.trashItems}>
                {trashedEvents.map((event) => (
                  <div key={event.id} className={styles.trashItem}>
                    <div className={styles.trashItemInfo}>
                      <span className={styles.trashItemTitle}>{event.title}</span>
                      <span className={styles.trashItemDate}>{event.date}</span>
                      <span className={styles.trashItemMeal}>{event.mealType}</span>
                    </div>
                    <div className={styles.trashItemActions}>
                      <button
                        className={styles.restoreButton}
                        onClick={() => {
                          restoreFromTrash(event.id);
                        }}
                        title="Restore"
                      >
                        Restore
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => {
                          deleteFromTrash(event.id);
                        }}
                        title="Delete permanently"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowTrashModal(false)}>Close</button>
              {trashedEvents.length > 0 && (
                <button
                  className={styles.clearTrashButton}
                  onClick={() => {
                    clearTrash();
                    setShowTrashModal(false);
                  }}
                >
                  Empty Trash
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default PlanPage;