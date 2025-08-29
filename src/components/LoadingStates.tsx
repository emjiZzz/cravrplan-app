import React from 'react';
import styles from './LoadingStates.module.css';

// ===== LOADING SPINNER COMPONENT =====

// Props interface for the LoadingSpinner component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';  // Size of the spinner
  message?: string;                     // Loading message to display
  variant?: 'default' | 'pulse' | 'dots' | 'bars';  // Animation style
}

/**
 * LoadingSpinner Component
 * 
 * A versatile loading spinner with multiple animation styles and sizes.
 * Used throughout the app to show loading states.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  variant = 'default'
}) => {
  return (
    <div className={styles.loadingContainer}>
      {/* Render different spinner variants based on the variant prop */}
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
      {/* Show loading message if provided */}
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
};

// ===== ERROR MESSAGE COMPONENT =====

// Props interface for the ErrorMessage component
interface ErrorMessageProps {
  title?: string;                       // Error title
  message: string;                      // Error message
  onRetry?: () => void;                 // Retry function
  showRetry?: boolean;                  // Whether to show retry button
  variant?: 'error' | 'warning' | 'info';  // Visual style variant
  details?: string;                     // Technical details (optional)
}

/**
 * ErrorMessage Component
 * 
 * Displays error messages with different visual styles and optional retry functionality.
 * Supports error, warning, and info variants.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  showRetry = true,
  variant = 'error',
  details
}) => {
  /**
   * Returns the appropriate icon based on the error variant
   */
  const getIcon = () => {
    switch (variant) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  /**
   * Returns the appropriate CSS class based on the error variant
   */
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
      {/* Show retry button if enabled and retry function provided */}
      {showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Try Again
        </button>
      )}
    </div>
  );
};

// ===== EMPTY STATE COMPONENT =====

// Props interface for the EmptyState component
interface EmptyStateProps {
  icon?: string;                        // Icon to display
  title: string;                        // Empty state title
  message: string;                      // Empty state message
  actionText?: string;                  // Action button text
  onAction?: () => void;                // Action button function
  variant?: 'default' | 'search' | 'favorites' | 'plan';  // Visual variant
}

/**
 * EmptyState Component
 * 
 * Displays when there's no data to show. Provides different visual styles
 * for different contexts (search, favorites, meal plan, etc.).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🍽️',
  title,
  message,
  actionText,
  onAction,
  variant = 'default'
}) => {
  /**
   * Returns the appropriate CSS class based on the variant
   */
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
      {/* Show action button if text and function are provided */}
      {actionText && onAction && (
        <button onClick={onAction} className={styles.actionButton}>
          {actionText}
        </button>
      )}
    </div>
  );
};

// ===== SKELETON CARD COMPONENT =====

// Props interface for the SkeletonCard component
interface SkeletonCardProps {
  count?: number;                       // Number of skeleton cards to show
  variant?: 'recipe' | 'plan' | 'list'; // Visual style variant
}

/**
 * SkeletonCard Component
 * 
 * Shows placeholder cards that look like the real content while loading.
 * Provides different styles for different content types.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  variant = 'recipe'
}) => {
  /**
   * Returns the appropriate skeleton CSS class based on the variant
   */
  const getSkeletonClass = () => {
    switch (variant) {
      case 'plan': return styles.skeletonPlanCard;
      case 'list': return styles.skeletonListCard;
      default: return styles.skeletonCard;
    }
  };

  return (
    <>
      {/* Create multiple skeleton cards based on count */}
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

// ===== SEARCH LOADING COMPONENT =====

// Props interface for the SearchLoading component
interface SearchLoadingProps {
  query?: string;                       // Search query being processed
}

/**
 * SearchLoading Component
 * 
 * Specialized loading component for search results.
 * Shows a loading spinner with search-specific messaging.
 */
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

// ===== PROGRESSIVE LOADING COMPONENT =====

// Props interface for the ProgressiveLoading component
interface ProgressiveLoadingProps<T = unknown> {
  items: T[];                           // Array of items to display
  renderItem: (item: T, index: number) => React.ReactNode;  // Function to render each item
  loading: boolean;                     // Whether content is loading
  error: string | null;                 // Error message if any
  onRetry?: () => void;                 // Retry function
  skeletonCount?: number;               // Number of skeleton cards to show
  skeletonVariant?: 'recipe' | 'plan' | 'list';  // Skeleton style variant
}

/**
 * ProgressiveLoading Component
 * 
 * Handles the complete loading flow: shows skeletons while loading,
 * displays items when loaded, and shows errors if something goes wrong.
 * Supports progressive loading where items appear as they load.
 */
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

// ===== INLINE LOADING COMPONENT =====

// Props interface for the InlineLoading component
interface InlineLoadingProps {
  size?: 'small' | 'medium';            // Size of the inline spinner
  text?: string;                        // Optional text to display
}

/**
 * InlineLoading Component
 * 
 * Small loading component for buttons and small areas.
 * Shows a compact spinner with optional text.
 */
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

// ===== TOAST NOTIFICATION COMPONENT =====

// Props interface for the Toast component
interface ToastProps {
  message: string;                      // Toast message
  type: 'success' | 'error' | 'warning' | 'info';  // Toast type
  onClose: () => void;                  // Function to close the toast
  duration?: number;                    // Auto-close duration in milliseconds
}

/**
 * Toast Component
 * 
 * Notification that appears and disappears automatically.
 * Supports different types with appropriate icons and colors.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000
}) => {
  // Auto-close the toast after the specified duration
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  /**
   * Returns the appropriate icon for the toast type
   */
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

// ===== PAGE LOADING COMPONENT =====

// Props interface for the PageLoading component
interface PageLoadingProps {
  message?: string;                     // Loading message
}

/**
 * PageLoading Component
 * 
 * Full page loading component for when entire pages are loading.
 * Uses a large pulse spinner for visual impact.
 */
export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "Loading page..."
}) => {
  return (
    <div className={styles.pageLoadingContainer}>
      <LoadingSpinner size="large" message={message} variant="pulse" />
    </div>
  );
};

// ===== SHIMMER EFFECT COMPONENT =====

// Props interface for the Shimmer component
interface ShimmerProps {
  width?: string;                       // Width of the shimmer
  height?: string;                      // Height of the shimmer
  className?: string;                   // Additional CSS classes
}

/**
 * Shimmer Component
 * 
 * Shimmer loading effect for text and images.
 * Creates a subtle animated loading placeholder.
 */
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
