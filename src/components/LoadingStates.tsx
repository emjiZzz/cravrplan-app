import React from 'react';
import styles from './LoadingStates.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...'
}) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
};

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  showRetry = true
}) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      {showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Try Again
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🍽️',
  title,
  message,
  actionText,
  onAction
}) => {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyMessage}>{message}</p>
      {actionText && onAction && (
        <button onClick={onAction} className={styles.actionButton}>
          {actionText}
        </button>
      )}
    </div>
  );
};

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonMeta}>
              <div className={styles.skeletonMetaItem}></div>
              <div className={styles.skeletonMetaItem}></div>
              <div className={styles.skeletonMetaItem}></div>
              <div className={styles.skeletonMetaItem}></div>
            </div>
            <div className={styles.skeletonButton}></div>
          </div>
        </div>
      ))}
    </>
  );
};

interface SearchLoadingProps {
  query?: string;
}

export const SearchLoading: React.FC<SearchLoadingProps> = ({ query }) => {
  return (
    <div className={styles.searchLoadingContainer}>
      <LoadingSpinner size="medium" message={query ? `Searching for "${query}"...` : "Searching recipes..."} />
    </div>
  );
};
