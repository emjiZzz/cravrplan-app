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
  return (
    <div className={styles.loadingContainer}>
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
    switch (variant) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

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

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'favorites' | 'plan';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🍽️',
  title,
  message,
  actionText,
  onAction,
  variant = 'default'
}) => {
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
  variant?: 'recipe' | 'plan' | 'list';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 1,
  variant = 'recipe'
}) => {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'plan': return styles.skeletonPlanCard;
      case 'list': return styles.skeletonListCard;
      default: return styles.skeletonCard;
    }
  };

  return (
    <>
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

interface SearchLoadingProps {
  query?: string;
}

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

// New: Progressive loading component
interface ProgressiveLoadingProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeletonCount?: number;
  skeletonVariant?: 'recipe' | 'plan' | 'list';
  onClearFilters?: () => void;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  items,
  renderItem,
  loading,
  error,
  onRetry,
  skeletonCount = 6,
  skeletonVariant = 'recipe',
  onClearFilters
}) => {
  if (loading) {
    return <SkeletonCard count={skeletonCount} variant={skeletonVariant} />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load content"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No items found"
        message="Try adjusting your search or filters to find what you're looking for."
        actionText="Clear Filters"
        onAction={onClearFilters || onRetry}
      />
    );
  }

  return (
    <div className={styles.progressiveContainer}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

// New: Inline loading component for buttons and small areas
interface InlineLoadingProps {
  size?: 'small' | 'medium';
  text?: string;
}

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

// New: Toast notification component
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

// New: Page loading component
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

// New: Shimmer loading effect
interface ShimmerProps {
  width?: string;
  height?: string;
  className?: string;
}

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
