import React from 'react';
import styles from './LoadingStates.module.css';

// Props for the loading spinner component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'default' | 'pulse' | 'dots' | 'bars';
}

// Loading spinner component with different styles
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  variant = 'default'
}) => {
  return (
    <div className={styles.loadingContainer}>
      {/* Show different spinner styles based on variant */}
      {variant === 'dots' ? (
        <div className={`${styles.dotsSpinner} ${styles[size]}`}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      ) : variant === 'pulse' ? (
        <div className={`${styles.pulseSpinner} ${styles[size]}`}></div>
      ) : variant === 'bars' ? (
        <div className={`${styles.barsSpinner} ${styles[size]}`}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
      ) : (
        <div className={`${styles.spinner} ${styles[size]}`}>
          <div className={styles.spinnerInner}></div>
        </div>
      )}
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
};

// Props for error message component
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'error' | 'warning' | 'info';
  details?: string;
}

// Error message component with retry button
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  showRetry = true,
  variant = 'error',
  details
}) => {
  // Get the right icon for the error type
  const getIcon = () => {
    switch (variant) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  // Get the right CSS class for the error type
  const getContainerClass = () => {
    switch (variant) {
      case 'warning': return styles.warningContainer;
      case 'info': return styles.infoContainer;
      default: return styles.errorContainer;
    }
  };

  return (
    <div className={`${styles.errorContainer} ${getContainerClass()}`}>
      <div className={styles.errorIcon}>{getIcon()}</div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      {/* Show technical details if provided */}
      {details && (
        <details className={styles.errorDetails}>
          <summary>Technical Details</summary>
          <pre>{details}</pre>
        </details>
      )}
      {/* Show retry button if needed */}
      {showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Try Again
        </button>
      )}
    </div>
  );
};

// Props for empty state component
interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'favorites' | 'plan';
}

// Empty state component for when there's no data
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🍽️',
  title,
  message,
  actionText,
  onAction,
  variant = 'default'
}) => {
  // Get the right CSS class based on variant
  const getContainerClass = () => {
    switch (variant) {
      case 'search': return styles.searchEmptyContainer;
      case 'favorites': return styles.favoritesEmptyContainer;
      case 'plan': return styles.planEmptyContainer;
      default: return styles.emptyContainer;
    }
  };

  return (
    <div className={`${styles.emptyContainer} ${getContainerClass()}`}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyMessage}>{message}</p>
      {/* Show action button if provided */}
      {actionText && onAction && (
        <button onClick={onAction} className={styles.actionButton}>
          {actionText}
        </button>
      )}
    </div>
  );
};

// Props for skeleton card component
interface SkeletonCardProps {
  count?: number;
  variant?: 'recipe' | 'plan' | 'list';
}

// Skeleton loading cards that look like the real content
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  variant = 'recipe'
}) => {
  // Get the right skeleton style based on variant
  const getSkeletonClass = () => {
    switch (variant) {
      case 'plan': return styles.skeletonPlanCard;
      case 'list': return styles.skeletonListCard;
      default: return styles.skeletonCard;
    }
  };

  return (
    <>
      {/* Create multiple skeleton cards */}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={getSkeletonClass()}>
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

// Props for search loading component
interface SearchLoadingProps {
  query?: string;
}

// Loading component specifically for search results
export const SearchLoading: React.FC<SearchLoadingProps> = ({ query }) => {
  return (
    <div className={styles.searchLoadingContainer}>
      <LoadingSpinner
        size="medium"
        message={query ? `Searching for "${query}"...` : "Searching recipes..."}
        variant="dots"
      />
    </div>
  );
};

// Props for progressive loading component
interface ProgressiveLoadingProps<T = unknown> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeletonCount?: number;
  skeletonVariant?: 'recipe' | 'plan' | 'list';
}

// Progressive loading component that shows content as it loads
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
      {/* Show error if something went wrong */}
      {error && (
        <div className={styles.errorState}>
          <ErrorMessage
            message={error}
            onRetry={onRetry}
            variant="error"
          />
        </div>
      )}

      {/* Show loading skeletons when loading and no items yet */}
      {loading && items.length === 0 && (
        <SkeletonCard count={skeletonCount} variant={skeletonVariant} />
      )}

      {/* Show the actual items */}
      {items.map((item, index) => renderItem(item, index))}

      {/* Show more loading skeletons at bottom when loading and we have items */}
      {loading && items.length > 0 && (
        <SkeletonCard count={Math.min(3, skeletonCount)} variant={skeletonVariant} />
      )}
    </div>
  );
};

// Props for inline loading component
interface InlineLoadingProps {
  size?: 'small' | 'medium';
  text?: string;
}

// Small loading component for buttons and small areas
export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'small',
  text
}) => {
  return (
    <div className={styles.inlineLoading}>
      <LoadingSpinner size={size} variant="dots" />
      {text && <span className={styles.inlineText}>{text}</span>}
    </div>
  );
};

// Props for toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

// Toast notification that appears and disappears automatically
export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000
}) => {
  // Auto-close the toast after the duration
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Get the right icon for the toast type
  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.toastIcon}>{getIcon()}</span>
      <span className={styles.toastMessage}>{message}</span>
      <button onClick={onClose} className={styles.toastClose}>×</button>
    </div>
  );
};

// Props for page loading component
interface PageLoadingProps {
  message?: string;
}

// Full page loading component
export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "Loading page..."
}) => {
  return (
    <div className={styles.pageLoadingContainer}>
      <LoadingSpinner size="large" message={message} variant="pulse" />
    </div>
  );
};

// Props for shimmer loading effect
interface ShimmerProps {
  width?: string;
  height?: string;
  className?: string;
}

// Shimmer loading effect for text and images
export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = '20px',
  className = ''
}) => {
  return (
    <div
      className={`${styles.shimmer} ${className}`}
      style={{ width, height }}
    ></div>
  );
};
