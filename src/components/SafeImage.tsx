import React, { useState } from 'react';
import styles from './SafeImage.module.css';

// Define the props that the SafeImage component accepts
interface SafeImageProps {
  src: string;                    // The URL of the image to display
  alt: string;                    // Alternative text for accessibility
  className?: string;             // Optional CSS class for styling
  fallbackText?: string;          // Optional custom text for the fallback
  width?: number | string;        // Optional width (can be number or CSS string)
  height?: number | string;       // Optional height (can be number or CSS string)
}

/**
 * SafeImage Component
 * 
 * A robust image component that handles loading states and fallbacks gracefully.
 * This component prevents broken image icons from appearing when images fail to load.
 * 
 * Features:
 * - Shows the image if it loads successfully
 * - Shows a "NO IMAGE" fallback with icon if the image fails to load
 * - Maintains consistent layout (no collapsing space)
 * - Provides loading state feedback
 * 
 * How error handling works:
 * 1. Component starts in loading state
 * 2. If image loads successfully → shows the image
 * 3. If image fails to load → shows fallback with "NO IMAGE" text and icon
 * 4. Layout remains consistent throughout all states
 * 
 * Usage:
 * <SafeImage 
 *   src="https://example.com/image.jpg" 
 *   alt="Description of image"
 *   fallbackText="Recipe Image"
 *   width={300}
 *   height={200}
 * />
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'NO IMAGE',
  width,
  height
}) => {
  // State to track if the image has loaded successfully
  const [imageLoaded, setImageLoaded] = useState(false);

  // State to track if the image failed to load
  const [imageError, setImageError] = useState(false);

  // State to track if the image is currently loading
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Handle successful image load
   * This function is called when the image loads successfully
   * It updates the state to show the image and hide loading/error states
   */
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', src);
    setImageLoaded(true);
    setIsLoading(false);
    setImageError(false);
  };

  /**
   * Handle image load error
   * This function is called when the image fails to load
   * It updates the state to show the fallback content instead of a broken image
   */
  const handleImageError = () => {
    console.log('Image failed to load:', src);
    setImageError(true);
    setIsLoading(false);
    setImageLoaded(false);
  };

  /**
   * Handle image load start
   * This function is called when the image starts loading
   * It resets the state to show loading indicator
   */
  const handleImageLoadStart = () => {
    setIsLoading(true);
    setImageError(false);
    setImageLoaded(false);
  };

  // Create inline styles for width and height if provided
  const containerStyle: React.CSSProperties = {};
  if (width) containerStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) containerStyle.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${styles.safeImageContainer} ${className}`}
      style={containerStyle}
    >
      {/* Show the actual image if it loaded successfully */}
      {imageLoaded && (
        <img
          src={src}
          alt={alt}
          className={styles.safeImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={handleImageLoadStart}
        />
      )}

      {/* Show loading spinner while image is loading */}
      {isLoading && !imageError && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Loading...</span>
        </div>
      )}

      {/* Show fallback content if image failed to load */}
      {imageError && (
        <div className={styles.fallbackContainer}>
          {/* SVG fallback icon - a simple "no image" icon */}
          <svg
            className={styles.fallbackIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rectangle representing the image frame */}
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Mountain/hill shapes representing a landscape */}
            <path
              d="M8 14L12 10L16 14L20 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sun circle */}
            <circle
              cx="18"
              cy="6"
              r="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* "X" mark to indicate no image */}
            <path
              d="M9 9L15 15M15 9L9 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Fallback text */}
          <span className={styles.fallbackText}>
            {fallbackText}
          </span>
        </div>
      )}

      {/* Hidden image element for loading detection */}
      {!imageLoaded && !imageError && (
        <img
          src={src}
          alt=""
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={handleImageLoadStart}
        />
      )}
    </div>
  );
};

export default SafeImage;
