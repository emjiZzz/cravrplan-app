import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import type { PlanEvent } from '../context/PlanContextTypes';
import styles from './AddToPlanModal.module.css';
import ConfirmationModal from './ConfirmationModal';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number;
    servings?: number;
  };
  // Optional swap mode: when provided, we will update an existing plan event
  swapFor?: {
    eventId: string;
    date: string;
    mealType: PlanEvent['mealType'];
  };
  // Optional selected date from URL parameters
  selectedDate?: string;
}

const AddToPlanModal: React.FC<AddToPlanModalProps> = ({ isOpen, onClose, recipe, swapFor, selectedDate: propSelectedDate }) => {
  const { addToPlan, events, updateEvent } = usePlan();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'main course' | 'breakfast' | 'side dish' | 'dessert' | 'snack'>('main course');
  const [isAdding, setIsAdding] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // Set default date to today if not selected
  useEffect(() => {
    console.log('AddToPlanModal useEffect triggered - isOpen:', isOpen, 'propSelectedDate:', propSelectedDate);
    if (!isOpen) return;

    if (swapFor) {
      // Prefill once when opening in swap mode
      console.log('Setting date from swapFor:', swapFor.date);
      setSelectedDate(swapFor.date);
      setSelectedMealType(swapFor.mealType);
    } else if (propSelectedDate && propSelectedDate.trim() !== '') {
      // Use the selected date from URL parameters
      console.log('Setting date from propSelectedDate:', propSelectedDate);
      setSelectedDate(propSelectedDate);
      setSelectedMealType('main course');
    } else {
      // Prefill defaults once when opening normally
      const today = new Date().toISOString().split('T')[0];
      console.log('Setting date to today:', today);
      setSelectedDate(today);
      setSelectedMealType('main course');
    }
    // only when modal opens or swap target changes
  }, [isOpen, swapFor, propSelectedDate]);

  // Check if recipe is already planned for the selected date and meal type
  const isAlreadyPlanned = events.some(event =>
    event.recipeId === recipe.id &&
    event.date === selectedDate &&
    event.mealType === selectedMealType
  );

  const handleAddToPlan = async () => {
    if (!selectedDate) {
      setErrorMessage('Please select a date');
      setShowErrorModal(true);
      return;
    }

    if (isAlreadyPlanned && !swapFor) {
      setErrorMessage('This recipe is already planned for this date and meal type');
      setShowErrorModal(true);
      return;
    }

    setIsAdding(true);
    try {
      if (swapFor) {
        // Update the target event with new recipe info and any changed date/meal type
        const base = events.find(e => e.id === swapFor.eventId)!;
        const updated: PlanEvent = {
          ...base,
          title: recipe.title,
          recipeId: recipe.id,
          image: recipe.image,
          date: selectedDate,
          mealType: selectedMealType,
        };
        updateEvent(swapFor.eventId, updated);
        // Stop loading and close modal
        setIsAdding(false);
        onClose();
      } else {
        const newEvent: Omit<PlanEvent, 'id'> = {
          title: recipe.title,
          date: selectedDate,
          recipeId: recipe.id,
          mealType: selectedMealType,
          image: recipe.image,
        };
        addToPlan(newEvent);
        // Stop loading and close modal
        setIsAdding(false);
        onClose();
      }
    } catch (e) {
      setIsAdding(false);
      setErrorMessage('An error occurred while adding the recipe to your plan.');
      setShowErrorModal(true);
    }
  };

  const handleConfirmAddToPlan = () => {
    handleAddToPlan();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    // Parse the date string more reliably to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    console.log('formatDate - input:', dateString, 'parsed:', { year, month, day });
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    console.log('formatDate - output:', formatted);
    return formatted;
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'main course': return '🍽️';
      case 'side dish': return '🥗';
      case 'dessert': return '🍰';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className={styles.modalWrapper} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* Recipe Preview Section */}
        <div className={styles.recipePreview}>
          <div className={styles.recipeImageContainer}>
            <img
              src={recipe.image}
              alt={recipe.title}
              className={styles.recipeImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              }}
            />
          </div>
          <div className={styles.recipeInfo}>
            <h3 className={styles.recipeTitle}>{recipe.title}</h3>
            <div className={styles.recipeDetails}>
              {recipe.readyInMinutes && (
                <span className={styles.recipeDetail}>
                  ⏱️ {recipe.readyInMinutes} min
                </span>
              )}
              {recipe.servings && (
                <span className={styles.recipeDetail}>
                  👥 {recipe.servings} servings
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Planning Form Section */}
        <div className={styles.planningForm}>
          <div className={styles.formHeader}>
            <h3>{swapFor ? 'Swap This Meal' : 'Add to Meal Plan'}</h3>
          </div>

          <div className={styles.formContent}>
            {/* Date Selection */}
            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.formLabel}>
                📅 Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.dateInput}
              />

              {selectedDate && (
                <div className={styles.dateDisplay}>
                  {formatDate(selectedDate)}
                </div>
              )}
            </div>

            {/* Meal Type Selection */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                🍽️ Select Meal Type
              </label>
              <div className={styles.mealTypeOptions}>
                {(['main course', 'breakfast', 'side dish', 'dessert', 'snack'] as const).map((mealType) => (
                  <button
                    key={mealType}
                    type="button"
                    className={`${styles.mealTypeOption} ${selectedMealType === mealType ? styles.selected : ''
                      }`}
                    onClick={() => setSelectedMealType(mealType)}
                  >
                    <span className={styles.mealTypeIcon}>
                      {getMealTypeIcon(mealType)}
                    </span>
                    <span className={styles.mealTypeText}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conflict Warning */}
            {isAlreadyPlanned && (
              <div className={styles.conflictWarning}>
                ⚠️ This recipe is already planned for {formatDate(selectedDate)} ({selectedMealType})
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.formActions}>
              <button
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                className={styles.addButton}
                onClick={() => {
                  if (swapFor) {
                    setConfirmMessage('Are you sure you want to swap this meal?');
                    setShowConfirmModal(true);
                  } else {
                    setConfirmMessage('Are you sure you want to add this recipe to your plan?');
                    setShowConfirmModal(true);
                  }
                }}
                disabled={isAdding || isAlreadyPlanned}
              >
                {isAdding ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  (swapFor ? 'Swap Meal' : 'Add to Plan')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Confirmation Modal */}
      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        cancelText="Cancel"
        type="error"
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          handleConfirmAddToPlan();
        }}
        title="Confirm Action"
        message={confirmMessage}
        confirmText="Confirm"
        cancelText="Cancel"
        type="info"
      />


    </div>
  );
};

export default AddToPlanModal; 