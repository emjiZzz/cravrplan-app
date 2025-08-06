export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  isChecked: boolean;
  notes?: string;
  estimatedPrice?: number;
  recipeId?: number; // If item comes from a specific recipe
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export type ShoppingCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Pantry'
  | 'Frozen'
  | 'Beverages'
  | 'Bakery'
  | 'Snacks'
  | 'Condiments'
  | 'Other';

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  estimatedTotal?: number;
}

export interface ShoppingListStats {
  totalItems: number;
  checkedItems: number;
  uncheckedItems: number;
  estimatedTotal: number;
  categories: Record<ShoppingCategory, number>;
}

export interface GenerateListOptions {
  includeExistingItems?: boolean;
  mergeSimilarItems?: boolean;
  addQuantities?: boolean;
  includeNotes?: boolean;
}

export interface ShoppingListFilters {
  category?: ShoppingCategory;
  checked?: boolean;
  searchQuery?: string;
} 