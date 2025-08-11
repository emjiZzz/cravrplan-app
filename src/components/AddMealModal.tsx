import React, { useState } from 'react';
import type { PlanEvent, MealPlanTemplate } from '../context/PlanContextTypes';
import styles from './AddMealModal.module.css';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<PlanEvent, 'id'>) => void;
  templates: MealPlanTemplate[];
}

const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  templates
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState<PlanEvent['mealType']>('main course');
  const [customTitle, setCustomTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');

  if (!isOpen) return null;

  const handleAddFromTemplate = (template: MealPlanTemplate) => {
    template.events.forEach(event => {
      const newEvent: Omit<PlanEvent, 'id'> = {
        ...event,
        date: selectedDate
      };
      onAddMeal(newEvent);
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customTitle.trim()) return;
    
    const newEvent: Omit<PlanEvent, 'id'> = {
      title: customTitle,
      date: selectedDate,
      recipeId: 0,
      mealType: selectedMealType
    };
    onAddMeal(newEvent);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Add Meal to Plan</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.dateSelector}>
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === 'templates' ? styles.active : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'custom' ? styles.active : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              Custom Meal
            </button>
          </div>

          {activeTab === 'templates' ? (
            <div className={styles.templatesList}>
              {templates.map(template => (
                <div key={template.id} className={styles.templateCard}>
                  <div className={styles.templateHeader}>
                    <span className={styles.templateIcon}>{template.icon}</span>
                    <h3>{template.name}</h3>
                  </div>
                  <p>{template.description}</p>
                  <button
                    className={styles.addTemplateButton}
                    onClick={() => handleAddFromTemplate(template)}
                  >
                    Add Template
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.customForm}>
              <div className={styles.formGroup}>
                <label>Meal Title:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter meal title"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Meal Type:</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as PlanEvent['mealType'])}
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="main course">🍽️ Main Course</option>
                  <option value="side dish">🥗 Side Dish</option>
                  <option value="dessert">🍰 Dessert</option>
                  <option value="snack">🍎 Snack</option>
                </select>
              </div>

              <button
                className={styles.addCustomButton}
                onClick={handleAddCustom}
                disabled={!customTitle.trim()}
              >
                Add Custom Meal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMealModal;
