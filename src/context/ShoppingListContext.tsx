import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ShoppingList, ShoppingItem, ShoppingCategory, ShoppingListStats, GenerateListOptions } from '../types/shoppingListTypes';
import type { PlanEvent } from './PlanContextTypes';
import { getRecipeDetails } from '../services/apiService';

interface ShoppingListContextType {
  // Lists management
  lists: ShoppingList[];
  activeList: ShoppingList | null;
  createList: (name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string) => void;
  clearActiveList: () => void;

  // Items management
  addItem: (item: Omit<ShoppingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeItem: (id: string) => void;
  toggleItemChecked: (id: string) => void;
  clearCheckedItems: () => void;

  // List generation
  generateFromMealPlan: (events: PlanEvent[], options?: GenerateListOptions) => Promise<void>;
  generateFromRecipes: (recipeIds: number[], options?: GenerateListOptions) => Promise<void>;

  // Statistics and filtering
  getStats: () => ShoppingListStats;
  getItemsByCategory: (category: ShoppingCategory) => ShoppingItem[];
  getUncheckedItems: () => ShoppingItem[];

  // Utilities
  exportList: (format: 'text' | 'json') => string;
  importList: (data: string) => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | null>(null);

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};

interface ShoppingListProviderProps {
  children: ReactNode;
}

// Helper function to categorize ingredients
const categorizeIngredient = (ingredientName: string): ShoppingCategory => {
  const name = ingredientName.toLowerCase();

  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('cream') || name.includes('egg')) {
    return 'Dairy & Eggs';
  }
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish') || name.includes('shrimp') || name.includes('salmon')) {
    return 'Meat & Seafood';
  }
  if (name.includes('apple') || name.includes('banana') || name.includes('tomato') || name.includes('onion') || name.includes('carrot') || name.includes('lettuce')) {
    return 'Produce';
  }
  if (name.includes('bread') || name.includes('tortilla') || name.includes('pasta') || name.includes('rice')) {
    return 'Pantry';
  }
  if (name.includes('frozen') || name.includes('ice')) {
    return 'Frozen';
  }
  if (name.includes('water') || name.includes('juice') || name.includes('soda') || name.includes('coffee')) {
    return 'Beverages';
  }
  if (name.includes('cake') || name.includes('cookie') || name.includes('pastry')) {
    return 'Bakery';
  }
  if (name.includes('chip') || name.includes('candy') || name.includes('snack')) {
    return 'Snacks';
  }
  if (name.includes('sauce') || name.includes('oil') || name.includes('vinegar') || name.includes('spice')) {
    return 'Condiments';
  }

  return 'Other';
};

// Helper function to merge similar items
const mergeSimilarItems = (items: ShoppingItem[]): ShoppingItem[] => {
  const merged: Record<string, ShoppingItem> = {};

  items.forEach(item => {
    const key = `${item.name.toLowerCase()}-${item.unit}`;
    if (merged[key]) {
      merged[key].quantity += item.quantity;
      if (item.notes) {
        merged[key].notes = merged[key].notes ? `${merged[key].notes}, ${item.notes}` : item.notes;
      }
    } else {
      merged[key] = { ...item };
    }
  });

  return Object.values(merged);
};

export const ShoppingListProvider: React.FC<ShoppingListProviderProps> = ({ children }) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  // Load lists from localStorage on mount
  useEffect(() => {
    const savedLists = localStorage.getItem('shoppingLists');
    const savedActiveId = localStorage.getItem('activeShoppingListId');

    if (savedLists) {
      const parsedLists = JSON.parse(savedLists).map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt)
      }));
      setLists(parsedLists);
    }

    if (savedActiveId) {
      setActiveListId(savedActiveId);
    }
  }, []);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shoppingLists', JSON.stringify(lists));
  }, [lists]);

  // Save active list ID to localStorage
  useEffect(() => {
    if (activeListId) {
      localStorage.setItem('activeShoppingListId', activeListId);
    } else {
      localStorage.removeItem('activeShoppingListId');
    }
  }, [activeListId]);

  const activeList = lists.find(list => list.id === activeListId) || null;

  const createList = (name: string) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      estimatedTotal: 0
    };

    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
  };

  const deleteList = (id: string) => {
    setLists(prev => prev.filter(list => list.id !== id));
    if (activeListId === id) {
      setActiveListId(null);
    }
  };

  const setActiveList = (id: string) => {
    setActiveListId(id);
  };

  const clearActiveList = () => {
    setActiveListId(null);
  };

  const addItem = (item: Omit<ShoppingItem, 'id'>) => {
    if (!activeList) return;

    const newItem: ShoppingItem = {
      ...item,
      id: Date.now().toString()
    };

    setLists(prev => prev.map(list =>
      list.id === activeListId
        ? {
          ...list,
          items: [...list.items, newItem],
          updatedAt: new Date()
        }
        : list
    ));
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    if (!activeList) return;

    setLists(prev => prev.map(list =>
      list.id === activeListId
        ? {
          ...list,
          items: list.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
          updatedAt: new Date()
        }
        : list
    ));
  };

  const removeItem = (id: string) => {
    if (!activeList) return;

    setLists(prev => prev.map(list =>
      list.id === activeListId
        ? {
          ...list,
          items: list.items.filter(item => item.id !== id),
          updatedAt: new Date()
        }
        : list
    ));
  };

  const toggleItemChecked = (id: string) => {
    if (!activeList) return;

    setLists(prev => prev.map(list =>
      list.id === activeListId
        ? {
          ...list,
          items: list.items.map(item =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
          ),
          updatedAt: new Date()
        }
        : list
    ));
  };

  const clearCheckedItems = () => {
    if (!activeList) return;

    setLists(prev => prev.map(list =>
      list.id === activeListId
        ? {
          ...list,
          items: list.items.filter(item => !item.isChecked),
          updatedAt: new Date()
        }
        : list
    ));
  };

  const generateFromMealPlan = async (events: PlanEvent[], options: GenerateListOptions = {}) => {
    if (!activeList) return;

    const recipeIds = events.map(event => event.recipeId).filter(Boolean) as number[];
    await generateFromRecipes(recipeIds, options);
  };

  const generateFromRecipes = async (recipeIds: number[], options: GenerateListOptions = {}) => {
    if (!activeList) return;

    const newItems: ShoppingItem[] = [];

    try {
      for (const recipeId of recipeIds) {
        const recipe = await getRecipeDetails(recipeId);

        recipe.extendedIngredients.forEach(ingredient => {
          const category = categorizeIngredient(ingredient.name);

          newItems.push({
            id: `${recipeId}-${ingredient.id}`,
            name: ingredient.name,
            quantity: ingredient.amount,
            unit: ingredient.unit,
            category,
            isChecked: false,
            notes: options.includeNotes ? `From: ${recipe.title}` : undefined,
            recipeId,
            estimatedPrice: ingredient.estimatedPrice
          });
        });
      }

      let finalItems = newItems;

      if (options.mergeSimilarItems) {
        finalItems = mergeSimilarItems(newItems);
      }

      if (!options.includeExistingItems) {
        // Only add items that don't already exist
        const existingNames = activeList.items.map(item => item.name.toLowerCase());
        finalItems = finalItems.filter(item =>
          !existingNames.includes(item.name.toLowerCase())
        );
      }

      setLists(prev => prev.map(list =>
        list.id === activeListId
          ? {
            ...list,
            items: [...list.items, ...finalItems],
            updatedAt: new Date()
          }
          : list
      ));
    } catch (error) {
      console.error('Error generating shopping list from recipes:', error);
    }
  };

  const getStats = (): ShoppingListStats => {
    if (!activeList) {
      return {
        totalItems: 0,
        checkedItems: 0,
        uncheckedItems: 0,
        estimatedTotal: 0,
        categories: {} as Record<ShoppingCategory, number>
      };
    }

    const checkedItems = activeList.items.filter(item => item.isChecked);
    const uncheckedItems = activeList.items.filter(item => !item.isChecked);
    const estimatedTotal = activeList.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

    const categories: Record<ShoppingCategory, number> = {} as Record<ShoppingCategory, number>;
    activeList.items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    return {
      totalItems: activeList.items.length,
      checkedItems: checkedItems.length,
      uncheckedItems: uncheckedItems.length,
      estimatedTotal,
      categories
    };
  };

  const getItemsByCategory = (category: ShoppingCategory): ShoppingItem[] => {
    return activeList?.items.filter(item => item.category === category) || [];
  };

  const getUncheckedItems = (): ShoppingItem[] => {
    return activeList?.items.filter(item => !item.isChecked) || [];
  };

  const exportList = (format: 'text' | 'json'): string => {
    if (!activeList) return '';

    if (format === 'json') {
      return JSON.stringify(activeList, null, 2);
    }

    // Text format
    let text = `${activeList.name}\n`;
    text += `${'='.repeat(activeList.name.length)}\n\n`;

    const categories = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry', 'Frozen', 'Beverages', 'Bakery', 'Snacks', 'Condiments', 'Other'];

    categories.forEach(category => {
      const items = activeList.items.filter(item => item.category === category);
      if (items.length > 0) {
        text += `${category}:\n`;
        items.forEach(item => {
          const checkmark = item.isChecked ? '✓' : '☐';
          text += `  ${checkmark} ${item.quantity} ${item.unit} ${item.name}`;
          if (item.notes) text += ` (${item.notes})`;
          text += '\n';
        });
        text += '\n';
      }
    });

    return text;
  };

  const importList = (data: string) => {
    try {
      const importedList = JSON.parse(data);
      setLists(prev => [...prev, importedList]);
    } catch (error) {
      console.error('Error importing shopping list:', error);
    }
  };

  const value: ShoppingListContextType = {
    lists,
    activeList,
    createList,
    deleteList,
    setActiveList,
    clearActiveList,
    addItem,
    updateItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    generateFromMealPlan,
    generateFromRecipes,
    getStats,
    getItemsByCategory,
    getUncheckedItems,
    exportList,
    importList
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
}; 