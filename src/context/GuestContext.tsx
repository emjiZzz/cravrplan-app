import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// ===== TYPE DEFINITIONS =====

/**
 * FavoriteRecipe interface - defines the structure of a favorite recipe
 * Same structure as used in FavoritesContext for consistency
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
 * GuestData interface - defines the structure of guest user data
 * Contains all data that guest users can create during their session
 */
interface GuestData {
  mealPlans: any[];              // Array of meal plans created by guest user
  favoriteRecipes: Array<{       // Array of favorite recipes
    id: number;                  // Recipe ID
    recipeId: string;            // Recipe ID as string
    recipe: FavoriteRecipe;      // Complete recipe data
  }>;
  fridgeIngredients: any[];      // Array of ingredients in guest's virtual fridge
}

/**
 * GuestContext interface - defines what the context provides to components
 */
interface GuestContextType {
  isGuestMode: boolean;          // Whether the user is currently in guest mode
  guestData: GuestData;          // All guest user data
  saveGuestMealPlan: (plan: any) => void;  // Save a new meal plan
  deleteGuestMealPlan: (planId: string) => void;  // Delete a meal plan
  addGuestFavorite: (recipeData: { id: number; recipeId: string; recipe: FavoriteRecipe }) => void;  // Add recipe to favorites
  removeGuestFavorite: (recipeId: string) => void;  // Remove recipe from favorites
  addGuestFridgeIngredient: (ingredient: any) => void;  // Add ingredient to fridge
  removeGuestFridgeIngredient: (ingredientId: string) => void;  // Remove ingredient from fridge
  updateGuestFridgeIngredient: (ingredientId: string, updates: any) => void;  // Update ingredient in fridge
  clearGuestData: () => void;    // Clear all guest data
  clearGuestDataOnLogin: () => void;  // Clear guest data when user logs in
  showGuestModeNotification: () => void;  // Show notification about guest mode
}

// ===== CONTEXT CREATION =====

/**
 * Create the guest context
 * This will hold all guest mode-related state and functions
 */
const GuestContext = createContext<GuestContextType | null>(null);

/**
 * Custom hook to use the guest context
 * Provides easy access to guest functions and state from any component
 */
export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};

// ===== PROVIDER PROPS =====

/**
 * Props for the GuestProvider component
 */
interface GuestProviderProps {
  children: ReactNode;  // React components that will have access to guest context
}

// ===== GUEST PROVIDER COMPONENT =====

/**
 * GuestProvider Component
 * 
 * Provides guest mode functionality to the entire app.
 * Manages temporary data for users who haven't signed up yet.
 * All guest data is cleared when the user signs up or the session ends.
 */
export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {
  // ===== STATE MANAGEMENT =====

  const [guestData, setGuestData] = useState<GuestData>({
    mealPlans: [],
    favoriteRecipes: [],
    fridgeIngredients: []
  });

  const [isGuestMode, setIsGuestMode] = useState(false);

  // ===== GUEST MODE DETECTION =====

  /**
   * Check if user is in guest mode and set up listeners
   * This runs when the component mounts and monitors for changes
   */
  useEffect(() => {
    const checkGuestMode = () => {
      const user = localStorage.getItem('cravrplan_user');
      const newGuestMode = !user;
      setIsGuestMode(newGuestMode);
    };

    checkGuestMode();

    // Listen for storage changes (when user logs in/out in another tab)
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

  // ===== GUEST DATA MANAGEMENT =====

  /**
   * Load guest data when entering guest mode
   * This ensures guest data persists across page refreshes
   */
  useEffect(() => {
    if (isGuestMode) {
      // Load existing guest data from localStorage if available
      const savedGuestData = localStorage.getItem('cravrplan_guest_data');
      if (savedGuestData) {
        try {
          const parsedData = JSON.parse(savedGuestData);
          setGuestData(parsedData);
        } catch (error) {
          console.error('Error loading guest data from localStorage:', error);
          // If there's an error, start with empty data
          setGuestData({
            mealPlans: [],
            favoriteRecipes: [],
            fridgeIngredients: []
          });
        }
      } else {
        setGuestData({
          mealPlans: [],
          favoriteRecipes: [],
          fridgeIngredients: []
        });
      }
    }
  }, [isGuestMode]);

  /**
   * Save guest data to localStorage whenever it changes
   * This ensures guest data persists across page refreshes
   */
  useEffect(() => {
    if (isGuestMode) {
      localStorage.setItem('cravrplan_guest_data', JSON.stringify(guestData));
    }
  }, [guestData, isGuestMode]);

  /**
   * Clear guest data when page is refreshed or app is closed
   * This ensures guest data doesn't persist between sessions
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isGuestMode) {
        // Don't clear data on refresh - let it persist
        // Only clear on actual page close if needed
      }
    };

    const handlePageHide = () => {
      if (isGuestMode) {
        // Don't clear data on page hide - let it persist
        // Only clear on actual app close if needed
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isGuestMode]);

  // ===== MEAL PLAN FUNCTIONS =====

  /**
   * Save a new meal plan for guest user
   * Creates a unique ID for the plan and adds it to guest data
   */
  const saveGuestMealPlan = (plan: any) => {
    setGuestData(prev => ({
      ...prev,
      mealPlans: [...prev.mealPlans, { ...plan, id: `guest-${Date.now()}` }]
    }));
  };

  /**
   * Delete a meal plan from guest data
   * Removes the plan with the specified ID
   */
  const deleteGuestMealPlan = (planId: string) => {
    setGuestData(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.filter(plan => plan.id !== planId)
    }));
  };

  // ===== FAVORITES FUNCTIONS =====

  /**
   * Add a recipe to guest user's favorites
   * Stores the complete recipe data for later use
   */
  const addGuestFavorite = (recipeData: { id: number; recipeId: string; recipe: FavoriteRecipe }) => {
    setGuestData(prev => ({
      ...prev,
      favoriteRecipes: [...prev.favoriteRecipes, recipeData]
    }));
  };

  /**
   * Remove a recipe from guest user's favorites
   * Removes the recipe with the specified recipe ID
   */
  const removeGuestFavorite = (recipeId: string) => {
    setGuestData(prev => ({
      ...prev,
      favoriteRecipes: prev.favoriteRecipes.filter(fav => fav.recipeId !== recipeId)
    }));
  };

  // ===== FRIDGE FUNCTIONS =====

  /**
   * Add an ingredient to guest user's virtual fridge
   * Creates a unique ID for the ingredient and adds it to fridge data
   */
  const addGuestFridgeIngredient = (ingredient: any) => {
    setGuestData(prev => ({
      ...prev,
      fridgeIngredients: [...prev.fridgeIngredients, { ...ingredient, id: `guest-ingredient-${Date.now()}` }]
    }));
  };

  /**
   * Remove an ingredient from guest user's virtual fridge
   * Removes the ingredient with the specified ID
   */
  const removeGuestFridgeIngredient = (ingredientId: string) => {
    setGuestData(prev => ({
      ...prev,
      fridgeIngredients: prev.fridgeIngredients.filter(ingredient => ingredient.id !== ingredientId)
    }));
  };

  /**
   * Update an ingredient in guest user's virtual fridge
   * Updates the ingredient with the specified ID using the provided updates
   */
  const updateGuestFridgeIngredient = (ingredientId: string, updates: any) => {
    setGuestData(prev => ({
      ...prev,
      fridgeIngredients: prev.fridgeIngredients.map(ingredient =>
        ingredient.id === ingredientId ? { ...ingredient, ...updates } : ingredient
      )
    }));
  };

  // ===== UTILITY FUNCTIONS =====

  /**
   * Clear all guest data
   * Resets all guest data to empty arrays
   */
  const clearGuestData = () => {
    setGuestData({
      mealPlans: [],
      favoriteRecipes: [],
      fridgeIngredients: []
    });
    // Also clear from localStorage
    localStorage.removeItem('cravrplan_guest_data');
  };

  /**
   * Clear guest data from localStorage when user logs in
   * This ensures clean transitions from guest to authenticated mode
   */
  const clearGuestDataOnLogin = () => {
    localStorage.removeItem('cravrplan_guest_data');
  };

  /**
   * Show a notification about guest mode
   * Informs users that their data will be cleared and they should sign up
   */
  const showGuestModeNotification = () => {
    // Show a simple notification that guest data was cleared
    alert('Guest mode: Your data has been cleared. Sign up to save your data permanently!');
  };

  // ===== CONTEXT VALUE =====

  /**
   * What we provide to other components through the context
   */
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
    clearGuestDataOnLogin,
    showGuestModeNotification
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};


