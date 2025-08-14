import React from 'react';
import styles from './LoadingStates.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'default' | 'pulse' | 'dots' | 'bars';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  variant = 'default'
}) => {
  // render different spinner types
  const renderSpinner = () => {
    if (variant === 'dots') {
      return (
        <div className={`${styles.dotsSpinner} ${styles[size]}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      );
    }

    if (variant === 'pulse') {
      return <div className={`${styles.pulseSpinner} ${styles[size]}`}></div>;
    }

    if (variant === 'bars') {
      return (
        <div className={`${styles.barsSpinner} ${styles[size]}`}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
      );
    }

    // default spinner
    return (
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
    );
  };

  return (
    <div className={styles.loadingContainer}>
      {renderSpinner()}
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
};

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'error' | 'warning' | 'info';
  details?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  showRetry = true,
  variant = 'error',
  details
}) => {
  const getIcon = () => {
    if (variant === 'warning') return '⚠️';
    if (variant === 'info') return 'ℹ️';
    return '❌';
  };

  const getContainerClass = () => {
    if (variant === 'warning') return styles.warningContainer;
    if (variant === 'info') return styles.infoContainer;
    return styles.errorContainer;
  };

  return (
    <div className={`${styles.errorContainer} ${getContainerClass()}`}>
      <div className={styles.errorIcon}>{getIcon()}</div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      {details && (
        <details className={styles.errorDetails}>
          <summary>Technical Details</summary>
          <pre>{details}</pre>
        </details>
      )}
      {showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Try Again
        </button>
      )}
    </div>
  );
};

interface SkeletonCardProps {
  count?: number;
  variant?: 'recipe' | 'plan' | 'list';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  variant = 'recipe'
}) => {
  const getSkeletonClass = () => {
    if (variant === 'plan') return styles.skeletonPlanCard;
    if (variant === 'list') return styles.skeletonListCard;
    return styles.skeletonCard;
  };

  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div key={i} className={getSkeletonClass()}>
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
    );
  }

  return <>{skeletons}</>;
};

// Progressive loading component
interface ProgressiveLoadingProps<T = unknown> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeletonCount?: number;
  skeletonVariant?: 'recipe' | 'plan' | 'list';
}

export const ProgressiveLoading = <T,>({
  items,
  renderItem,
  loading,
  error,
  onRetry,
  skeletonCount = 6,
  skeletonVariant = 'recipe'
}: ProgressiveLoadingProps<T>) => {
  return (
    <div className={styles.progressiveContainer}>
      {error && (
        <div className={styles.errorState}>
          <ErrorMessage
            message={error}
            onRetry={onRetry}
            variant="error"
          />
        </div>
      )}

      {loading && items.length === 0 && (
        <SkeletonCard count={skeletonCount} variant={skeletonVariant} />
      )}

      {items.map((item, index) => renderItem(item, index))}

      {loading && items.length > 0 && (
        <SkeletonCard count={Math.min(3, skeletonCount)} variant={skeletonVariant} />
      )}
    </div>
  );
};

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    if (type === 'success') return '✅';
    if (type === 'error') return '❌';
    if (type === 'warning') return '⚠️';
    return 'ℹ️';
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.toastIcon}>{getIcon()}</span>
      <span className={styles.toastMessage}>{message}</span>
      <button onClick={onClose} className={styles.toastClose}>×</button>
    </div>
  );
};

// Page loading component
interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "Loading page..."
}) => {
  return (
    <div className={styles.pageLoadingContainer}>
      <LoadingSpinner size="large" message={message} variant="pulse" />
    </div>
  );
};
