import React, { useState, useEffect, useCallback } from 'react';
import type { PlanEvent } from '../context/PlanContextTypes';
import styles from './QuickSuggestionsModal.module.css';

interface QuickSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<PlanEvent, 'id'>) => void;
  mealType: PlanEvent['mealType'];
  maxTime?: number;
  getQuickSuggestions: (mealType: PlanEvent['mealType'], maxTime?: number) => Promise<PlanEvent[]>;
}

const QuickSuggestionsModal: React.FC<QuickSuggestionsModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  mealType,
  maxTime = 30,
  getQuickSuggestions
}) => {
  const [suggestions, setSuggestions] = useState<PlanEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(maxTime);
  const [selectedMealType, setSelectedMealType] = useState<PlanEvent['mealType']>(mealType);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(true);

  const mealTypes: { type: PlanEvent['mealType']; label: string; icon: string; color: string }[] = [
    { type: 'main course', label: 'Main Course', icon: '🍽️', color: '#FF6B6B' },
    { type: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#4ECDC4' },
    { type: 'side dish', label: 'Side Dish', icon: '🥗', color: '#45B7D1' },
    { type: 'dessert', label: 'Dessert', icon: '🍰', color: '#96CEB4' },
    { type: 'snack', label: 'Snack', icon: '🍎', color: '#BB8FCE' }
  ];

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getQuickSuggestions(selectedMealType, selectedTime);
      setSuggestions(results);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [getQuickSuggestions, selectedMealType, selectedTime]);

  useEffect(() => {
    if (isOpen) {
      setSelectedMealType(mealType);
      setShowMealTypeSelector(true);
      setSuggestions([]);
    }
  }, [isOpen, mealType]);

  useEffect(() => {
    if (isOpen && !showMealTypeSelector) {
      loadSuggestions();
    }
  }, [isOpen, showMealTypeSelector, loadSuggestions]);

  const handleMealTypeSelect = (mealType: PlanEvent['mealType']) => {
    setSelectedMealType(mealType);
    setShowMealTypeSelector(false);
  };

  const handleAddMeal = (suggestion: PlanEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...mealWithoutId } = suggestion;
    onAddMeal(mealWithoutId);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'main course': return '🍽️';
      case 'side dish': return '🥗';
      case 'dessert': return '🍰';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.mealTypeHeader}>
              <h2 className={styles.modalTitle}>
                {showMealTypeSelector ? 'Choose Meal Type' : `Quick ${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Ideas`}
              </h2>
            </div>
            <p className={styles.modalSubtitle}>
              {showMealTypeSelector
                ? 'Select a meal type to see quick recipe suggestions'
                : `Recipes ready in ${selectedTime} minutes or less`
              }
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {showMealTypeSelector ? (
          <div className={styles.mealTypeSelector}>
            <div className={styles.mealTypeGrid}>
              {mealTypes.map((mealTypeOption) => (
                <button
                  key={mealTypeOption.type}
                  className={styles.mealTypeCard}
                  onClick={() => handleMealTypeSelect(mealTypeOption.type)}
                  style={{ '--meal-color': mealTypeOption.color } as React.CSSProperties}
                >
                  <div className={styles.mealTypeIconLarge}>{mealTypeOption.icon}</div>
                  <h3 className={styles.mealTypeLabel}>{mealTypeOption.label}</h3>
                  <p className={styles.mealTypeDescription}>
                    {mealTypeOption.type === 'main course' && 'Hearty main dishes'}
                    {mealTypeOption.type === 'breakfast' && 'Start your day right'}
                    {mealTypeOption.type === 'side dish' && 'Perfect accompaniments'}
                    {mealTypeOption.type === 'dessert' && 'Sweet endings'}

                    {mealTypeOption.type === 'snack' && 'Quick bites & treats'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.timeFilter}>
              <label className={styles.timeLabel}>Max cooking time:</label>
              <div className={styles.timeButtons}>
                {[15, 30, 45, 60].map((time) => (
                  <button
                    key={time}
                    className={`${styles.timeButton} ${selectedTime === time ? styles.active : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.suggestionsContainer}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Finding quick recipes...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <div className={styles.suggestionsGrid}>
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className={styles.suggestionCard}>
                      {suggestion.image && (
                        <div className={styles.recipeImage}>
                          <img src={suggestion.image} alt={suggestion.title} />
                        </div>
                      )}

                      <div className={styles.recipeInfo}>
                        <h3 className={styles.recipeTitle}>{suggestion.title}</h3>

                        <div className={styles.recipeMeta}>
                          <div className={styles.timeInfo}>
                            <span className={styles.timeIcon}>⏱️</span>
                            <span className={styles.timeText}>
                              {suggestion.prepTime && suggestion.cookTime
                                ? `${formatTime(suggestion.prepTime + suggestion.cookTime)}`
                                : 'Quick'
                              }
                            </span>
                          </div>

                          {suggestion.difficulty && (
                            <span
                              className={styles.difficultyBadge}
                              style={{ backgroundColor: getDifficultyColor(suggestion.difficulty) }}
                            >
                              {suggestion.difficulty}
                            </span>
                          )}
                        </div>

                        {suggestion.nutrition && (
                          <div className={styles.nutritionInfo}>
                            <span className={styles.calories}>
                              {Math.round(suggestion.nutrition.calories)} cal
                            </span>
                            <span className={styles.macros}>
                              P: {Math.round(suggestion.nutrition.protein)}g |
                              C: {Math.round(suggestion.nutrition.carbs)}g |
                              F: {Math.round(suggestion.nutrition.fat)}g
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        className={styles.addButton}
                        onClick={() => handleAddMeal(suggestion)}
                      >
                        Add to Plan
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🍽️</div>
                  <h3>No quick recipes found</h3>
                  <p>Try increasing the time limit or check back later for more options.</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.backButton}
                onClick={() => setShowMealTypeSelector(true)}
              >
                ← Change Meal Type
              </button>
              <button className={styles.refreshButton} onClick={loadSuggestions}>
                🔄 Refresh Suggestions
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickSuggestionsModal; 