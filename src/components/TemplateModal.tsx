import React, { useState } from 'react';
import type { MealPlanTemplate } from '../context/PlanContextTypes';
import styles from './TemplateModal.module.css';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: MealPlanTemplate, startDate: string) => void;
  templates: MealPlanTemplate[];
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  templates
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<MealPlanTemplate | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onApplyTemplate(selectedTemplate, startDate);
      onClose();
      setSelectedTemplate(null);
    }
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
          <h2 className={styles.modalTitle}>Choose a Meal Plan Template</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <div
              key={template.id}
              className={`${styles.templateCard} ${selectedTemplate?.id === template.id ? styles.selected : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className={styles.templateIcon}>{template.icon}</div>
              <h3 className={styles.templateName}>{template.name}</h3>
              <p className={styles.templateDescription}>{template.description}</p>

              <div className={styles.templatePreview}>
                <h4 className={styles.previewTitle}>Meals included:</h4>
                <div className={styles.mealList}>
                  {template.events.map((event, index) => (
                    <div key={index} className={styles.mealItem}>
                      <span className={styles.mealIcon}>
                        {getMealTypeIcon(event.mealType)}
                      </span>
                      <span className={styles.mealTitle}>{event.title}</span>
                      <span
                        className={styles.difficultyBadge}
                        style={{ backgroundColor: getDifficultyColor(event.difficulty || 'medium') }}
                      >
                        {event.difficulty || 'medium'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <div className={styles.templateActions}>
            <div className={styles.dateSelection}>
              <label htmlFor="startDate" className={styles.dateLabel}>
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.applyButton} onClick={handleApplyTemplate}>
                Apply Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateModal; 