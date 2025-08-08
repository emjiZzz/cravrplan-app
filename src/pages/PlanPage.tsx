


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlanPage.module.css';
import { usePlan } from '../context/PlanContext';
import type { PlanEvent } from '../context/PlanContextTypes';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomRecipe: (recipeData: { title: string; mealType: string; date: string }) => void;
  onBrowseRecipes: () => void;
  selectedDate: string;
}

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
                      <div className={styles.calendarEventImageContainer}>
                        <img
                          src={event.image}
                          alt={event.title}
                          className={styles.calendarEventImage}
                          onClick={(e) => handleImageClick(event, e)}
                        />
                        <div className={styles.calendarEventMealType}>
                          <span className={styles.mealTypeIndicator} title={event.mealType}>
                            {getMealTypeIcon(event.mealType)}
                          </span>
                        </div>
                      </div>
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
                      <div className={styles.calendarEventImageContainer}>
                        <img
                          src={event.image}
                          alt={event.title}
                          className={styles.calendarEventImage}
                          onClick={(e) => handleImageClick(event, e)}
                        />
                        <div className={styles.calendarEventMealType}>
                          <span className={styles.mealTypeIndicator} title={event.mealType}>
                            {getMealTypeIcon(event.mealType)}
                          </span>
                        </div>
                      </div>
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
    addToPlan,
    ensureNutritionData
  } = usePlan();

  React.useEffect(() => {
    ensureNutritionData();
  }, [ensureNutritionData]);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

    // Additional adjustments could go here if recipe data is available

    return {
      calories: Math.max(150, Math.round(calories)),
      protein: Math.max(5, Math.round(protein)),
      carbs: Math.max(10, Math.round(carbs)),
      fat: Math.max(3, Math.round(fat))
    };
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

  const handleEventClick = (event: PlanEvent) => {
    setSelectedRecipe(event);
    setShowRecipeModal(true);
  };

  const handleClearAll = () => {
    events.forEach(event => {
      moveToTrash(event.id);
    });
    setShowClearConfirm(false);
    alert('All meals were moved to Trash.');
  };

  // no-op; swap flow handled via navigation to Recipes/RecipeDetail

  const handleViewRecipeInstructions = () => {
    if (selectedRecipe) {
      navigate(`/recipes/${selectedRecipe.recipeId}`);
      setShowRecipeModal(false);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowAddMealModal(true);
    // Feedback for opening add meal flow
    setTimeout(() => {
      try {
        // Non-blocking toast alternative using alert for now
        // alert can be noisy; keep minimal
        console.log('Add Meal dialog opened for date:', date);
      } catch { }
    }, 0);
  };

  const handleAddCustomRecipe = (recipeData: { title: string; mealType: string; date: string }) => {
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
                    disabled={events.length === 0}
                  >
                    Clear All
                  </button>
                  <button
                    className={styles.trashButton}
                    onClick={() => setShowTrashModal(true)}
                    disabled={trashedEvents.length === 0}
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
                            navigate('/recipes', {
                              state: {
                                swapFor: {
                                  eventId: event.id,
                                  date: event.date,
                                  mealType: event.mealType,
                                }
                              }
                            });
                          }}
                        >
                          Swap Recipe
                        </button>
                        <button
                          className={styles.removeButton}
                          onClick={() => {
                            moveToTrash(event.id);
                            alert('Moved to Trash.');
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

      {/* Swap modal not used; navigation-based swap flow is active */}

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
            <h3>Clear All Meals</h3>
            <p>Are you sure you want to move all meals to Trash?</p>
            <div className={styles.confirmModalActions}>
              <button onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className={styles.confirmButton} onClick={() => {
                handleClearAll();
              }}>
                Clear All
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
                          alert('Meal restored from Trash.');
                        }}
                        title="Restore"
                      >
                        Restore
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => {
                          deleteFromTrash(event.id);
                          alert('Meal permanently deleted.');
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
                    alert('Trash emptied successfully.');
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
              <h3 style={{ textAlign: 'center', flex: 1 }}>{selectedRecipe.title}</h3>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#9C27B0' }}></div>
                          <span>Calories:</span>
                        </div>
                        <span>{Math.round(selectedRecipe.nutrition.calories)} cal</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4CAF50' }}></div>
                          <span>Protein:</span>
                        </div>
                        <span>{Math.round(selectedRecipe.nutrition.protein)}g</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFC107' }}></div>
                          <span>Carbohydrates:</span>
                        </div>
                        <span>{Math.round(selectedRecipe.nutrition.carbs)}g</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F44336' }}></div>
                          <span>Fat:</span>
                        </div>
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