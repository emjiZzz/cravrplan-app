import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Enhanced favorites storage interface
interface FavoriteRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: any;
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
  extendedIngredients: any[];
  summary?: string;
  // Store timestamp for potential cleanup
  addedAt: number;
}

interface FavoritesContextType {
  favorites: number[];
  favoriteRecipes: FavoriteRecipe[];
  addFavorite: (recipe: FavoriteRecipe) => void;
  removeFavorite: (recipeId: number) => void;
  toggleFavorite: (recipeId: number, recipe?: FavoriteRecipe) => void;
  isFavorite: (recipeId: number) => boolean;
  getFavoriteRecipe: (recipeId: number) => FavoriteRecipe | undefined;
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

  // Load favorites from localStorage on mount
  useEffect(() => {
    console.log('=== FAVORITES CONTEXT MOUNTED - Loading favorites ===');
    try {
      const savedFavorites = localStorage.getItem('recipeFavorites');
      const savedFavoriteRecipes = localStorage.getItem('recipeFavoriteRecipes');

      console.log('Raw localStorage data:', savedFavorites);
      console.log('Raw favorite recipes data:', savedFavoriteRecipes);

      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        console.log('Parsed favorites:', parsedFavorites);
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
          console.log('✅ Successfully set favorites to:', parsedFavorites);
        } else {
          console.warn('⚠️ Parsed data is not an array:', parsedFavorites);
        }
      } else {
        console.log('ℹ️ No saved favorites found in localStorage');
      }

      if (savedFavoriteRecipes) {
        const parsedFavoriteRecipes = JSON.parse(savedFavoriteRecipes);
        console.log('Parsed favorite recipes:', parsedFavoriteRecipes);
        if (Array.isArray(parsedFavoriteRecipes)) {
          setFavoriteRecipes(parsedFavoriteRecipes);
          console.log('✅ Successfully set favorite recipes to:', parsedFavoriteRecipes);
        } else {
          console.warn('⚠️ Parsed favorite recipes data is not an array:', parsedFavoriteRecipes);
        }
      } else {
        console.log('ℹ️ No saved favorite recipes found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error loading favorites from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('recipeFavorites');
      localStorage.removeItem('recipeFavoriteRecipes');
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    console.log('=== FAVORITES CHANGED - Saving to localStorage ===');
    console.log('Current favorites state:', favorites);
    try {
      const favoritesString = JSON.stringify(favorites);
      console.log('Stringified favorites:', favoritesString);
      localStorage.setItem('recipeFavorites', favoritesString);
      console.log('✅ Successfully saved favorites to localStorage');

      // Verify the save worked
      const verifySave = localStorage.getItem('recipeFavorites');
      console.log('Verification - Retrieved from localStorage:', verifySave);
    } catch (error) {
      console.error('❌ Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  // Save favorite recipes to localStorage whenever favoriteRecipes change
  useEffect(() => {
    console.log('=== FAVORITE RECIPES CHANGED - Saving to localStorage ===');
    console.log('Current favorite recipes state:', favoriteRecipes);
    try {
      const favoriteRecipesString = JSON.stringify(favoriteRecipes);
      console.log('Stringified favorite recipes:', favoriteRecipesString);
      localStorage.setItem('recipeFavoriteRecipes', favoriteRecipesString);
      console.log('✅ Successfully saved favorite recipes to localStorage');

      // Verify the save worked
      const verifySave = localStorage.getItem('recipeFavoriteRecipes');
      console.log('Verification - Retrieved from localStorage:', verifySave);
    } catch (error) {
      console.error('❌ Error saving favorite recipes to localStorage:', error);
    }
  }, [favoriteRecipes]);

  const addFavorite = (recipe: FavoriteRecipe) => {
    setFavorites(prev => {
      if (!prev.includes(recipe.id)) {
        const newFavorites = [...prev, recipe.id];
        console.log('Adding favorite:', recipe.id, 'New favorites:', newFavorites);
        return newFavorites;
      }
      return prev;
    });

    setFavoriteRecipes(prev => {
      if (!prev.find(r => r.id === recipe.id)) {
        const newFavoriteRecipes = [...prev, recipe];
        console.log('Adding to favorite recipes:', recipe, 'New favorite recipes:', newFavoriteRecipes);
        return newFavoriteRecipes;
      }
      return prev;
    });
  };

  const removeFavorite = (recipeId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(id => id !== recipeId);
      console.log('Removing favorite:', recipeId, 'New favorites:', newFavorites);
      return newFavorites;
    });

    setFavoriteRecipes(prev => {
      const newFavoriteRecipes = prev.filter(recipe => recipe.id !== recipeId);
      console.log('Removing from favorite recipes:', recipeId, 'New favorite recipes:', newFavoriteRecipes);
      return newFavoriteRecipes;
    });
  };

  const toggleFavorite = (recipeId: number, recipe?: FavoriteRecipe) => {
    const isCurrentlyFavorite = favorites.includes(recipeId);
    
    if (isCurrentlyFavorite) {
      removeFavorite(recipeId);
    } else {
      if (recipe) {
        addFavorite(recipe);
      } else {
        // If no recipe provided, just add the ID
        setFavorites(prev => {
          if (!prev.includes(recipeId)) {
            const newFavorites = [...prev, recipeId];
            console.log('Adding favorite ID only:', recipeId, 'New favorites:', newFavorites);
            return newFavorites;
          }
          return prev;
        });
      }
    }
  };

  const isFavorite = (recipeId: number) => {
    return favorites.includes(recipeId);
  };

  const getFavoriteRecipe = (recipeId: number) => {
    return favoriteRecipes.find(recipe => recipe.id === recipeId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    setFavoriteRecipes([]);
  };

  const value: FavoritesContextType = {
    favorites,
    favoriteRecipes,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteRecipe,
    clearFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

