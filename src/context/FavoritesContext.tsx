import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useGuest } from './GuestContext';
import { firestoreService } from '../services/firestoreService';

// ===== TYPE DEFINITIONS =====

/**
 * FavoriteRecipe interface - defines the structure of a favorite recipe
 * Contains all the recipe data that gets stored when a user favorites a recipe
 */
interface FavoriteRecipe {
  id: number;                    // Unique recipe ID
  title: string;                 // Recipe title
  image: string;                 // Recipe image URL
  imageType: string;             // Type of image (jpg, png, etc.)
  readyInMinutes: number;        // Cooking time in minutes
  servings: number;              // Number of servings
  nutrition?: {                  // Optional nutrition information
    nutrients: Array<{
      name: string;              // Nutrient name (calories, protein, etc.)
      amount: number;            // Amount of nutrient
      unit: string;              // Unit of measurement (g, kcal, etc.)
    }>;
  };
  cuisines: string[];            // List of cuisines (Italian, Mexican, etc.)
  dishTypes: string[];           // List of dish types (main course, dessert, etc.)
  diets: string[];               // List of dietary restrictions (vegetarian, vegan, etc.)
  aggregateLikes: number;        // Number of likes from users
  healthScore: number;           // Health score (0-100)
  spoonacularScore: number;      // Spoonacular's rating score
  pricePerServing: number;       // Cost per serving
  cheap: boolean;                // Whether the recipe is considered cheap
  dairyFree: boolean;            // Whether the recipe is dairy-free
  glutenFree: boolean;           // Whether the recipe is gluten-free
  ketogenic: boolean;            // Whether the recipe is ketogenic
  lowFodmap: boolean;            // Whether the recipe is low FODMAP
  sustainable: boolean;          // Whether the recipe is sustainable
  vegan: boolean;                // Whether the recipe is vegan
  vegetarian: boolean;           // Whether the recipe is vegetarian
  veryHealthy: boolean;          // Whether the recipe is very healthy
  veryPopular: boolean;          // Whether the recipe is very popular
  whole30: boolean;              // Whether the recipe is Whole30 compliant
  weightWatcherSmartPoints: number;  // Weight Watchers points
  occasions: string[];           // List of occasions (Christmas, birthday, etc.)
  extendedIngredients: Array<{   // List of ingredients with details
    id: number;                  // Ingredient ID
    name: string;                // Ingredient name
    amount: number;              // Amount needed
    unit: string;                // Unit of measurement
    original: string;            // Original ingredient string
  }>;
  summary?: string;              // Optional recipe summary
  addedAt: number;               // Timestamp when recipe was favorited
}

/**
 * FavoritesContext interface - defines what the context provides to components
 */
interface FavoritesContextType {
  favorites: number[];                                    // Array of favorite recipe IDs
  favoriteRecipes: FavoriteRecipe[];                     // Array of complete favorite recipe objects
  toggleFavorite: (recipeId: number, recipe?: FavoriteRecipe) => void;  // Add/remove from favorites
  isFavorite: (recipeId: number) => boolean;             // Check if recipe is favorited
  clearFavorites: () => void;                            // Remove all favorites
}

// ===== CONTEXT CREATION =====

/**
 * Create the favorites context
 * This will hold all favorites-related state and functions
 */
const FavoritesContext = createContext<FavoritesContextType | null>(null);

/**
 * Custom hook to use the favorites context
 * Provides easy access to favorites functions and state from any component
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// ===== PROVIDER PROPS =====

/**
 * Props for the FavoritesProvider component
 */
interface FavoritesProviderProps {
  children: ReactNode;  // React components that will have access to favorites context
}

// ===== FAVORITES PROVIDER COMPONENT =====

/**
 * FavoritesProvider Component
 * 
 * Provides favorites functionality to the entire app.
 * Manages favorite recipes for both authenticated users (Firestore) and guest users (local storage).
 * Handles adding, removing, and checking favorite recipes.
 */
export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  // ===== STATE MANAGEMENT =====

  const [favorites, setFavorites] = useState<number[]>([]);           // Array of favorite recipe IDs
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);  // Complete recipe objects

  // ===== CONTEXT INTEGRATION =====

  /**
   * Get authentication context with error handling
   * This prevents errors if the auth context isn't available yet
   */
  let user = null;
  let isAuthenticated = false;
  try {
    const authContext = useAuth();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    console.log('Auth context not available yet, using guest mode');
  }

  /**
   * Get guest context with error handling
   * This prevents errors if the guest context isn't available yet
   */
  let isGuestMode = false;
  let addGuestFavorite = (_recipeData: { id: number; recipeId: string; recipe: FavoriteRecipe }) => { };
  let removeGuestFavorite = (_recipeId: string) => { };
  let guestData = { favoriteRecipes: [] as Array<{ id: number; recipeId: string; recipe: FavoriteRecipe }> };

  try {
    const guestContext = useGuest();
    isGuestMode = guestContext.isGuestMode;
    addGuestFavorite = guestContext.addGuestFavorite;
    removeGuestFavorite = guestContext.removeGuestFavorite;
    guestData = guestContext.guestData;
  } catch (error) {
    console.log('Guest context not available yet');
  }

  // ===== LOAD FAVORITES =====

  /**
   * Load favorites based on user mode (authenticated or guest)
   * This runs when the component mounts and when user/guest state changes
   */
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated && user) {
        // Load from Firestore for authenticated users
        try {
          const firestoreFavorites = await firestoreService.getFavoriteRecipes(user.id);
          const favoriteIds = firestoreFavorites.map(fav => parseInt(fav.recipeId));
          const favoriteRecipesData = firestoreFavorites.map(fav => ({
            ...fav.recipe,
            addedAt: fav.addedAt?.toMillis?.() || Date.now()
          }));

          setFavorites(favoriteIds);
          setFavoriteRecipes(favoriteRecipesData);
        } catch (error) {
          console.error('Error loading favorites from Firestore:', error);
        }
      } else if (isGuestMode) {
        // Load from guest context for guest users
        const guestFavoriteIds = guestData.favoriteRecipes.map(fav => fav.recipe.id);
        const guestFavoriteRecipes = guestData.favoriteRecipes.map(fav => ({
          ...fav.recipe,
          addedAt: Date.now()
        }));

        setFavorites(guestFavoriteIds);
        setFavoriteRecipes(guestFavoriteRecipes);
      } else {
        // Clear favorites when not authenticated and not in guest mode
        setFavorites([]);
        setFavoriteRecipes([]);
      }
    };

    loadFavorites();
  }, [user, isAuthenticated, isGuestMode]);

  // ===== FAVORITES FUNCTIONS =====

  /**
   * Toggle favorite status of a recipe
   * Adds recipe to favorites if not favorited, removes if already favorited
   */
  const toggleFavorite = async (recipeId: number, recipe?: FavoriteRecipe) => {
    if (isAuthenticated && user) {
      // Handle authenticated user favorites (stored in Firestore)
      try {
        const isCurrentlyFavorite = favorites.includes(recipeId);

        if (isCurrentlyFavorite) {
          // Remove from favorites - find the Firestore document ID
          const firestoreFavorites = await firestoreService.getFavoriteRecipes(user.id);
          const firestoreFavorite = firestoreFavorites.find(fav => parseInt(fav.recipeId) === recipeId);

          if (firestoreFavorite) {
            await firestoreService.deleteFavoriteRecipe(firestoreFavorite.id);
          }

          // Update local state
          setFavorites(prev => prev.filter(id => id !== recipeId));
          setFavoriteRecipes(prev => prev.filter(fav => fav.id !== recipeId));
        } else {
          // Add to favorites
          if (recipe) {
            const favoriteData = {
              id: `fav-${Date.now()}`,
              userId: user.id,
              recipeId: recipeId.toString(),
              recipe: recipe
            };

            await firestoreService.saveFavoriteRecipe(favoriteData);

            setFavorites(prev => [...prev, recipeId]);
            setFavoriteRecipes(prev => [...prev, { ...recipe, addedAt: Date.now() }]);
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    } else if (isGuestMode) {
      // Handle guest user favorites (stored in guest context)
      const isCurrentlyFavorite = favorites.includes(recipeId);

      if (isCurrentlyFavorite) {
        // Remove from guest favorites
        removeGuestFavorite(recipeId.toString());
        // Update local state immediately for responsive UI
        setFavorites(prev => prev.filter(id => id !== recipeId));
        setFavoriteRecipes(prev => prev.filter(fav => fav.id !== recipeId));
      } else {
        // Add to guest favorites
        if (recipe) {
          addGuestFavorite({
            id: recipeId,
            recipeId: recipeId.toString(),
            recipe: recipe
          });
          // Update local state immediately for responsive UI
          setFavorites(prev => [...prev, recipeId]);
          setFavoriteRecipes(prev => [...prev, { ...recipe, addedAt: Date.now() }]);
        }
      }
    }
  };

  /**
   * Check if a recipe is in the user's favorites
   * Returns true if the recipe ID is in the favorites array
   */
  const isFavorite = (recipeId: number): boolean => {
    return favorites.includes(recipeId);
  };

  /**
   * Clear all favorites
   * Removes all favorite recipes from both local state and storage
   */
  const clearFavorites = async () => {
    if (isAuthenticated && user) {
      // Clear from Firestore for authenticated users
      try {
        const firestoreFavorites = await firestoreService.getFavoriteRecipes(user.id);
        for (const favorite of firestoreFavorites) {
          await firestoreService.deleteFavoriteRecipe(favorite.id);
        }
      } catch (error) {
        console.error('Error clearing favorites from Firestore:', error);
      }
    }

    // Clear local state
    setFavorites([]);
    setFavoriteRecipes([]);
  };

  // ===== CONTEXT VALUE =====

  /**
   * What we provide to other components through the context
   */
  const value: FavoritesContextType = {
    favorites,
    favoriteRecipes,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

