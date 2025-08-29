import React from 'react';
import styles from './ConfirmationModal.module.css';

// Props interface for the ConfirmationModal component
interface ConfirmationModalProps {
  isOpen: boolean;           // Controls whether the modal is visible
  onClose: () => void;       // Function to close the modal
  onConfirm: () => void;     // Function to execute when user confirms
  message: string;           // The message to display in the modal
  confirmText?: string;      // Text for the confirm button (optional)
  cancelText?: string;       // Text for the cancel button (optional)
  type?: 'info' | 'warning' | 'success' | 'error';  // Visual style type (optional)
}

/**
 * ConfirmationModal Component
 * 
 * A reusable modal that asks users to confirm an action before proceeding.
 * It can be styled differently based on the type (info, warning, success, error).
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  // Don't render anything if modal is not open
  if (!isOpen) return null;

  /**
   * Handles the confirm button click
   * Executes the confirmation action and closes the modal
   */
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  /**
   * Handles clicking on the backdrop to close the modal
   * Only closes if clicking on the backdrop itself, not the modal content
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handles keyboard events
   * Closes modal when Escape key is pressed
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`${styles.modalContent} ${styles[type]}`}>
        {/* Modal message content */}
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>{message}</p>
        </div>

        {/* Modal action buttons */}
        <div className={styles.modalFooter}>
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.modalButton} ${styles.confirmButton} ${styles[type]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
