// Image Utilities for Beta Testing
// Handles ingredient and cookware images with placeholders

// Default placeholder for missing images
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop';

/**
 * Get ingredient image URL with fallback to placeholder
 * @param imageName - The ingredient image filename
 * @returns The image URL or placeholder
 */
export function getIngredientImageUrl(imageName: string | null | undefined): string {
  if (!imageName) {
    return DEFAULT_PLACEHOLDER;
  }

  // Try to construct the Spoonacular URL
  try {
    return `https://spoonacular.com/cdn/ingredients_100x100/${imageName}`;
  } catch {
    return DEFAULT_PLACEHOLDER;
  }
}

/**
 * Handle image loading errors and replace with placeholder
 * @param event - The error event from the image
 * @param fallbackUrl - The fallback URL to use
 */
export function handleImageError(event: Event, fallbackUrl: string = DEFAULT_PLACEHOLDER) {
  const img = event.target as HTMLImageElement;
  if (img && !img.src.includes('unsplash.com/photo-1565299624946-b28f40a0ca4b')) {
    console.log(`🖼️ Image failed to load: ${img.src}, using placeholder`);
    img.src = fallbackUrl;
    img.alt = 'Image placeholder';
  }
}

/**
 * Get recipe image URL with fallback
 * @param imageUrl - The recipe image URL
 * @returns The image URL or a default placeholder
 */
export function getRecipeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
  }

  return imageUrl;
}
