// User Data Management Utility
// Handles user-specific data persistence, migration, and cleanup

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export class UserDataManager {
  private static instance: UserDataManager;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Generate user-specific localStorage key
  private getStorageKey(key: string): string {
    return this.currentUser 
      ? `${key}_${this.currentUser.id}_data` 
      : `${key}_guest_data`;
  }

  // Save data for current user
  saveData<T>(category: string, data: T): void {
    try {
      const key = this.getStorageKey(category);
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved ${category} data for user:`, this.currentUser?.id || 'guest');
    } catch (error) {
      console.error(`Error saving ${category} data:`, error);
    }
  }

  // Load data for current user
  loadData<T>(category: string, defaultValue: T): T {
    try {
      const key = this.getStorageKey(category);
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log(`Loaded ${category} data for user:`, this.currentUser?.id || 'guest');
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading ${category} data:`, error);
      this.clearData(category);
    }
    return defaultValue;
  }

  // Clear data for current user
  clearData(category: string): void {
    try {
      const key = this.getStorageKey(category);
      localStorage.removeItem(key);
      console.log(`Cleared ${category} data for user:`, this.currentUser?.id || 'guest');
    } catch (error) {
      console.error(`Error clearing ${category} data:`, error);
    }
  }

  // Clear all data for current user
  clearAllUserData(): void {
    if (!this.currentUser) return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`_${this.currentUser.id}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared all data for user:`, this.currentUser.id);
    } catch (error) {
      console.error('Error clearing all user data:', error);
    }
  }

  // Migrate legacy data to user-specific storage
  migrateLegacyData(user: User): void {
    try {
      const legacyMappings = [
        { legacy: 'mealPlans', new: 'mealPlans_events' },
        { legacy: 'recipeFavorites', new: 'recipeFavorites_favorites' },
        { legacy: 'recipeFavoriteRecipes', new: 'recipeFavorites_recipes' },
        { legacy: 'fridgeIngredients', new: 'fridgeIngredients_ingredients' }
      ];

      legacyMappings.forEach(mapping => {
        const legacyData = localStorage.getItem(mapping.legacy);
        if (legacyData) {
          const newKey = `${mapping.new}_${user.id}_data`;
          localStorage.setItem(newKey, legacyData);
          localStorage.removeItem(mapping.legacy);
          console.log(`Migrated ${mapping.legacy} to ${newKey}`);
        }
      });

      console.log('Legacy data migration completed for user:', user.id);
    } catch (error) {
      console.error('Error migrating legacy data:', error);
    }
  }

  // Get all user-specific keys
  getUserKeys(): string[] {
    if (!this.currentUser) return [];

    const userKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`_${this.currentUser.id}_`)) {
        userKeys.push(key);
      }
    }
    return userKeys;
  }

  // Export user data (for backup purposes)
  exportUserData(): Record<string, any> {
    if (!this.currentUser) return {};

    const userData: Record<string, any> = {};
    const userKeys = this.getUserKeys();

    userKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          userData[key] = JSON.parse(data);
        }
      } catch (error) {
        console.error(`Error exporting data from key ${key}:`, error);
      }
    });

    return userData;
  }

  // Import user data (for restore purposes)
  importUserData(data: Record<string, any>): void {
    if (!this.currentUser) return;

    try {
      Object.entries(data).forEach(([key, value]) => {
        if (key.includes(`_${this.currentUser!.id}_`)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      console.log('User data imported successfully');
    } catch (error) {
      console.error('Error importing user data:', error);
    }
  }

  // Check if user has any data
  hasUserData(): boolean {
    return this.getUserKeys().length > 0;
  }

  // Get data size for current user
  getUserDataSize(): number {
    const userKeys = this.getUserKeys();
    let totalSize = 0;

    userKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    });

    return totalSize;
  }
}

// Export singleton instance
export const userDataManager = UserDataManager.getInstance();

// Convenience functions for common data types
export const saveMealPlans = (data: any) => userDataManager.saveData('mealPlans', data);
export const loadMealPlans = (defaultValue: any) => userDataManager.loadData('mealPlans', defaultValue);

export const saveFavorites = (data: any) => userDataManager.saveData('recipeFavorites', data);
export const loadFavorites = (defaultValue: any) => userDataManager.loadData('recipeFavorites', defaultValue);

export const saveFridgeIngredients = (data: any) => userDataManager.saveData('fridgeIngredients', data);
export const loadFridgeIngredients = (defaultValue: any) => userDataManager.loadData('fridgeIngredients', defaultValue);
