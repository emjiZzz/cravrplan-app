import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface GuestData {
  mealPlans: any[];
  favoriteRecipes: any[];
  fridgeIngredients: any[];
}

interface GuestContextType {
  isGuestMode: boolean;
  guestData: GuestData;
  saveGuestMealPlan: (plan: any) => void;
  deleteGuestMealPlan: (planId: string) => void;
  addGuestFavorite: (recipe: any) => void;
  removeGuestFavorite: (recipeId: string) => void;
  addGuestFridgeIngredient: (ingredient: any) => void;
  removeGuestFridgeIngredient: (ingredientId: string) => void;
  updateGuestFridgeIngredient: (ingredientId: string, updates: any) => void;
  clearGuestData: () => void;
  showGuestModeNotification: () => void;
}

const GuestContext = createContext<GuestContextType | null>(null);

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};

interface GuestProviderProps {
  children: ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {
  const [guestData, setGuestData] = useState<GuestData>({
    mealPlans: [],
    favoriteRecipes: [],
    fridgeIngredients: []
  });

  const [isGuestMode, setIsGuestMode] = useState(false);
  const location = useLocation();

  // Check if user is in guest mode
  useEffect(() => {
    const checkGuestMode = () => {
      const user = localStorage.getItem('cravrplan_user');
      const newGuestMode = !user;
      console.log('Guest mode check:', {
        user: !!user,
        isGuestMode: newGuestMode,
        localStorageUser: user
      });
      setIsGuestMode(newGuestMode);
    };

    checkGuestMode();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkGuestMode();
    };

    // Also check on focus to catch any changes
    const handleFocus = () => {
      checkGuestMode();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Clear guest data when entering guest mode (fresh start)
  useEffect(() => {
    if (isGuestMode) {
      setGuestData({
        mealPlans: [],
        favoriteRecipes: [],
        fridgeIngredients: []
      });
    }
  }, [isGuestMode]);

  // Clear guest data when page is refreshed or app is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isGuestMode) {
        setGuestData({
          mealPlans: [],
          favoriteRecipes: [],
          fridgeIngredients: []
        });
      }
    };

    const handlePageHide = () => {
      if (isGuestMode) {
        setGuestData({
          mealPlans: [],
          favoriteRecipes: [],
          fridgeIngredients: []
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isGuestMode]);

  const saveGuestMealPlan = (plan: any) => {
    setGuestData(prev => ({
      ...prev,
      mealPlans: [...prev.mealPlans, { ...plan, id: `guest-${Date.now()}` }]
    }));
  };

  const deleteGuestMealPlan = (planId: string) => {
    setGuestData(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.filter(plan => plan.id !== planId)
    }));
  };

  const addGuestFavorite = (recipe: any) => {
    setGuestData(prev => ({
      ...prev,
      favoriteRecipes: [...prev.favoriteRecipes, { ...recipe, id: `guest-fav-${Date.now()}` }]
    }));
  };

  const removeGuestFavorite = (recipeId: string) => {
    setGuestData(prev => ({
      ...prev,
      favoriteRecipes: prev.favoriteRecipes.filter(fav => fav.recipeId !== recipeId)
    }));
  };

  const addGuestFridgeIngredient = (ingredient: any) => {
    setGuestData(prev => ({
      ...prev,
      fridgeIngredients: [...prev.fridgeIngredients, { ...ingredient, id: `guest-ingredient-${Date.now()}` }]
    }));
  };

  const removeGuestFridgeIngredient = (ingredientId: string) => {
    setGuestData(prev => ({
      ...prev,
      fridgeIngredients: prev.fridgeIngredients.filter(ingredient => ingredient.id !== ingredientId)
    }));
  };

  const updateGuestFridgeIngredient = (ingredientId: string, updates: any) => {
    setGuestData(prev => ({
      ...prev,
      fridgeIngredients: prev.fridgeIngredients.map(ingredient =>
        ingredient.id === ingredientId ? { ...ingredient, ...updates } : ingredient
      )
    }));
  };

  const clearGuestData = () => {
    setGuestData({
      mealPlans: [],
      favoriteRecipes: [],
      fridgeIngredients: []
    });
  };

  const showGuestModeNotification = () => {
    // Show a simple notification that guest data was cleared
    alert('Guest mode: Your data has been cleared. Sign up to save your data permanently!');
  };

  const value: GuestContextType = {
    isGuestMode,
    guestData,
    saveGuestMealPlan,
    deleteGuestMealPlan,
    addGuestFavorite,
    removeGuestFavorite,
    addGuestFridgeIngredient,
    removeGuestFridgeIngredient,
    updateGuestFridgeIngredient,
    clearGuestData,
    showGuestModeNotification
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};


