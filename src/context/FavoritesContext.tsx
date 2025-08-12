import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useGuest } from './GuestContext';
import { firestoreService } from '../services/firestoreService';

// Enhanced favorites storage interface
interface FavoriteRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  aggregateLikes: number;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  cheap: boolean;
  dairyFree: boolean;
  glutenFree: boolean;
  ketogenic: boolean;
  lowFodmap: boolean;
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  occasions: string[];
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  summary?: string;
  // Store timestamp for potential cleanup
  addedAt: number;
}

interface FavoritesContextType {
  favorites: number[];
  favoriteRecipes: FavoriteRecipe[];
  toggleFavorite: (recipeId: number, recipe?: FavoriteRecipe) => void;
  isFavorite: (recipeId: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);

  // Add error handling for useAuth
  let user = null;
  let isAuthenticated = false;
  try {
    const authContext = useAuth();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    console.log('Auth context not available yet, using guest mode');
  }

  // Add error handling for useGuest
  let isGuestMode = false;
  let addGuestFavorite = (recipe: any) => { };
  let removeGuestFavorite = (recipeId: string) => { };
  let guestData = { favoriteRecipes: [] as any[] };

  try {
    const guestContext = useGuest();
    isGuestMode = guestContext.isGuestMode;
    addGuestFavorite = guestContext.addGuestFavorite;
    removeGuestFavorite = guestContext.removeGuestFavorite;
    guestData = guestContext.guestData;
  } catch (error) {
    console.log('Guest context not available yet');
  }

  // Load favorites based on user mode
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
        const guestFavoriteIds = guestData.favoriteRecipes.map(fav => parseInt(fav.recipeId || fav.id));
        const guestFavoriteRecipes = guestData.favoriteRecipes.map(fav => ({
          ...fav.recipe,
          addedAt: fav.addedAt || Date.now()
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
  }, [user, isAuthenticated, isGuestMode, guestData.favoriteRecipes]);

  const toggleFavorite = async (recipeId: number, recipe?: FavoriteRecipe) => {
    if (isAuthenticated && user) {
      // Handle authenticated user favorites
      try {
        const isCurrentlyFavorite = favorites.includes(recipeId);

        if (isCurrentlyFavorite) {
          // Remove from favorites - find the Firestore document ID
          // We need to find the actual Firestore document ID, not the recipe ID
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
      // Handle guest user favorites
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
            id: recipeId.toString(),
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

  const isFavorite = (recipeId: number): boolean => {
    return favorites.includes(recipeId);
  };

  const clearFavorites = async () => {
    if (isAuthenticated && user) {
      // Clear from Firestore
      try {
        const firestoreFavorites = await firestoreService.getFavoriteRecipes(user.id);
        for (const favorite of firestoreFavorites) {
          await firestoreService.deleteFavoriteRecipe(favorite.id);
        }
      } catch (error) {
        console.error('Error clearing favorites from Firestore:', error);
      }
    }

    setFavorites([]);
    setFavoriteRecipes([]);
  };

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

