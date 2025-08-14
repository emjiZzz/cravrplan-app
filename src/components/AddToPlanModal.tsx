// Modal for adding recipes to meal plan - handles both adding new meals and swapping existing ones

import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import type { PlanEvent } from '../context/PlanContextTypes';
import styles from './AddToPlanModal.module.css';
import ConfirmationModal from './ConfirmationModal';

// Props that this component needs to work
interface AddToPlanModalProps {
  isOpen: boolean; // whether the modal should be shown
  onClose: () => void; // function to call when user wants to close modal
  recipe: {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number; // optional cooking time
    servings?: number; // optional number of servings
  };
  // Optional: if we're swapping an existing meal instead of adding new one
  swapFor?: {
    eventId: string;
    date: string;
    mealType: PlanEvent['mealType'];
  };
  // Optional: if user came from a specific date (like from URL)
  selectedDate?: string;
}

const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
  isOpen,
  onClose,
  recipe,
  swapFor,
  selectedDate: propSelectedDate
}) => {
  // Get functions from our meal plan context
  const { addToPlan, events, updateEvent } = usePlan();

  // State variables to track what user has selected
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'main course' | 'breakfast' | 'side dish' | 'dessert' | 'snack'>('main course');
  const [isAdding, setIsAdding] = useState(false); // loading state while saving

  // Modal states for showing error messages and confirmations
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // Set up default values when modal opens
  useEffect(() => {
    if (!isOpen) return; // don't do anything if modal is closed

    if (swapFor) {
      // If we're swapping a meal, use the existing meal's date and type
      setSelectedDate(swapFor.date);
      setSelectedMealType(swapFor.mealType);
    } else if (propSelectedDate && propSelectedDate.trim() !== '') {
      // If user came from a specific date, use that
      setSelectedDate(propSelectedDate);
      setSelectedMealType('main course');
    } else {
      // Otherwise use today's date as default
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      setSelectedMealType('main course');
    }
  }, [isOpen, swapFor, propSelectedDate]);

  // Check if this recipe is already planned for the selected date and meal type
  const isAlreadyPlanned = events.some(event =>
    event.recipeId === recipe.id &&
    event.date === selectedDate &&
    event.mealType === selectedMealType
  );

  // Main function to add or update the meal plan
  const handleAddToPlan = async () => {
    // Basic validation - make sure user picked a date
    if (!selectedDate) {
      setErrorMessage('Please select a date');
      setShowErrorModal(true);
      return;
    }

    // Don't allow adding same recipe twice unless we're swapping
    if (isAlreadyPlanned && !swapFor) {
      setErrorMessage('This recipe is already planned for this date and meal type');
      setShowErrorModal(true);
      return;
    }

    setIsAdding(true); // show loading spinner

    try {
      if (swapFor) {
        // We're updating an existing meal (swapping)
        const base = events.find(e => e.id === swapFor.eventId);
        if (!base) {
          throw new Error('Event not found');
        }

        // Create updated event with new recipe info but keep same ID
        const updated: PlanEvent = {
          ...base,
          title: recipe.title,
          recipeId: recipe.id,
          image: recipe.image,
          date: selectedDate,
          mealType: selectedMealType,
        };
        updateEvent(swapFor.eventId, updated);
      } else {
        // We're adding a completely new meal
        const newEvent: Omit<PlanEvent, 'id'> = {
          title: recipe.title,
          date: selectedDate,
          recipeId: recipe.id,
          mealType: selectedMealType,
          image: recipe.image,
        };
        addToPlan(newEvent);
      }

      setIsAdding(false);
      onClose(); // close modal when done
    } catch (error) {
      setIsAdding(false);
      setErrorMessage('An error occurred while adding the recipe to your plan.');
      setShowErrorModal(true);
    }
  };

  // Called when user confirms they want to add the meal
  const handleConfirmAddToPlan = () => {
    handleAddToPlan();
  };

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Close modal when clicking outside of it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Convert date string like "2024-01-15" to readable format like "Monday, January 15, 2024"
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get emoji icon for each meal type to make UI more friendly
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

  // All the meal types we support
  const mealTypes = ['main course', 'breakfast', 'side dish', 'dessert', 'snack'] as const;

  return (
    <div className={styles.modalWrapper} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* Top section showing the recipe we're adding */}
        <div className={styles.recipePreview}>
          <div className={styles.recipeImageContainer}>
            <img
              src={recipe.image}
              alt={recipe.title}
              className={styles.recipeImage}
              onError={(e) => {
                // If image fails to load, show a default food image
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
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

        {/* Bottom section with the form to pick date and meal type */}
        <div className={styles.planningForm}>
          <div className={styles.formHeader}>
            <h3>{swapFor ? 'Swap This Meal' : 'Add to Meal Plan'}</h3>
          </div>

          <div className={styles.formContent}>
            {/* Date picker */}
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

              {/* Show the selected date in a nice readable format */}
              {selectedDate && (
                <div className={styles.dateDisplay}>
                  {formatDate(selectedDate)}
                </div>
              )}
            </div>

            {/* Meal type buttons */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                🍽️ Select Meal Type
              </label>
              <div className={styles.mealTypeOptions}>
                {mealTypes.map((mealType) => (
                  <button
                    key={mealType}
                    type="button"
                    className={`${styles.mealTypeOption} ${selectedMealType === mealType ? styles.selected : ''}`}
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

            {/* Warning if recipe is already planned */}
            {isAlreadyPlanned && (
              <div className={styles.conflictWarning}>
                ⚠️ This recipe is already planned for {formatDate(selectedDate)} ({selectedMealType})
              </div>
            )}

            {/* Action buttons at the bottom */}
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
                  // Show confirmation dialog before actually adding
                  const message = swapFor
                    ? 'Are you sure you want to swap this meal?'
                    : 'Are you sure you want to add this recipe to your plan?';
                  setConfirmMessage(message);
                  setShowConfirmModal(true);
                }}
                disabled={isAdding || isAlreadyPlanned}
              >
                {isAdding ? (
                  <span className={styles.loadingSpinner}></span>
                ) : (
                  swapFor ? 'Swap Meal' : 'Add to Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error modal for showing problems */}
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

      {/* Confirmation modal for double-checking before adding */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
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