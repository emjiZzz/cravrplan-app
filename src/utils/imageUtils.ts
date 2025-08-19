// Image Utilities - Handles recipe and ingredient images with fallback placeholders
// This file provides functions to get image URLs and handle image loading errors
// It ensures that even if images fail to load, users see nice placeholder images instead of broken images

// Default placeholder image for missing or failed images
// This is a generic food image from Unsplash that looks good as a fallback
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop';

// Default recipe placeholder image (larger size for recipe cards)
// Same image but larger size for recipe cards that need bigger images
const DEFAULT_RECIPE_PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';

/**
 * Get ingredient image URL with fallback to placeholder
 * @param imageName - The ingredient image filename from the API
 * @returns The complete image URL or placeholder if no image name provided
 * 
 * This function takes an ingredient name and tries to construct a URL to the ingredient image.
 * If no image name is provided or if URL construction fails, it returns a placeholder image.
 */
export function getIngredientImageUrl(imageName: string | null | undefined): string {
  // Return placeholder if no image name is provided
  if (!imageName) {
    return DEFAULT_PLACEHOLDER;
  }

  // Try to construct the Spoonacular ingredient image URL
  // Spoonacular provides ingredient images at a specific URL pattern
  try {
    return `https://spoonacular.com/cdn/ingredients_100x100/${imageName}`;
  } catch {
    // Return placeholder if URL construction fails
    return DEFAULT_PLACEHOLDER;
  }
}

/**
 * Handle image loading errors and replace with placeholder
 * @param event - The error event from the image element
 * @param fallbackUrl - The fallback URL to use (defaults to placeholder)
 * 
 * This function is called when an image fails to load. It replaces the broken image
 * with a placeholder image so users don't see broken image icons.
 */
export function handleImageError(event: Event, fallbackUrl: string = DEFAULT_PLACEHOLDER) {
  const img = event.target as HTMLImageElement;

  // Only replace if the current image is not already the placeholder
  // This prevents infinite loops if the placeholder itself fails to load
  if (img && !img.src.includes('unsplash.com/photo-1565299624946-b28f40a0ca4b')) {
    console.log(`Image failed to load: ${img.src}, using placeholder`);
    img.src = fallbackUrl;
    img.alt = 'Image placeholder';
  }
}

/**
 * Get recipe image URL with fallback to placeholder
 * @param imageUrl - The recipe image URL from the API
 * @returns The image URL or a default placeholder if no URL provided
 * 
 * This function handles recipe images. If no image URL is provided,
 * it returns a placeholder image instead of showing nothing.
 * 
 * ⚠️ Possibly unused - please double check
 */
export function getRecipeImageUrl(imageUrl: string | null | undefined): string {
  // Return placeholder if no image URL is provided
  if (!imageUrl) {
    return DEFAULT_RECIPE_PLACEHOLDER;
  }

  return imageUrl;
}
