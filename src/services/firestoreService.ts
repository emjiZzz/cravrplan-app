// Firestore Service - Handles all database operations for the app
// This service manages user data, meal plans, favorite recipes, and fridge ingredients
// Firestore is Google's NoSQL database that stores data in collections and documents

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { PlanEvent } from '../context/PlanContextTypes';

// Interface definitions for different data types
// These define the structure of data we store in the database

// User data structure - information about each user
export interface UserData {
  id: string;           // Unique user ID from Firebase Authentication
  email: string;        // User's email address
  fullName: string;     // User's full name
  createdAt: any;       // When the user account was created
  lastLogin: any;       // When the user last logged in
  preferences?: UserPreferences;  // User's dietary and cooking preferences
}

// User preferences for dietary restrictions and cooking preferences
// This data is collected during the onboarding process
export interface UserPreferences {
  dietaryRestrictions: string[];  // e.g., ["Vegetarian", "Gluten-Free"]
  cuisinePreferences: string[];   // e.g., ["Italian", "Mexican"]
  cookingLevel: string;           // e.g., "beginner", "intermediate", "advanced"
  timePreferences: string[];      // e.g., ["15-30", "30-60"]
}

// Meal plan data structure - stores user's meal planning data
export interface MealPlan {
  id: string;           // Unique meal plan ID
  userId: string;       // ID of the user who owns this meal plan
  title: string;        // Title of the meal plan
  events: PlanEvent[];  // Array of meal events in the plan
  createdAt: any;       // When the meal plan was created
  updatedAt: any;       // When the meal plan was last updated
}

// Favorite recipe data structure - stores user's favorite recipes
export interface FavoriteRecipe {
  id: string;           // Unique favorite recipe ID
  userId: string;       // ID of the user who favorited this recipe
  recipeId: string;     // ID of the recipe that was favorited
  recipe: any;          // The actual recipe data
  addedAt: any;         // When the recipe was added to favorites
}

// Fridge ingredient data structure - stores user's fridge ingredients
export interface FridgeIngredient {
  id: string;           // Unique ingredient ID
  userId: string;       // ID of the user who owns this ingredient
  name: string;         // Name of the ingredient
  quantity: number;     // Amount of the ingredient
  unit: string;         // Unit of measurement (e.g., "cups", "grams")
  expiryDate?: string;  // When the ingredient expires (optional)
  addedAt: any;         // When the ingredient was added to fridge
}

// Main Firestore Service Class - Handles all database operations
// This class provides methods to create, read, update, and delete data in Firestore
class FirestoreService {

  // ===== USER DATA OPERATIONS =====

  /**
   * Create a new user in the database
   * @param userData - User data to store (without timestamps)
   * 
   * This function is called when a new user signs up.
   * It creates a new document in the 'users' collection with the user's information.
   */
  async createUser(userData: Omit<UserData, 'createdAt' | 'lastLogin'>): Promise<void> {
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),  // Automatically set by Firestore
      lastLogin: serverTimestamp()   // Automatically set by Firestore
    });
  }

  /**
   * Get user data by user ID
   * @param userId - The user's unique ID
   * @returns User data or null if user doesn't exist
   * 
   * This function retrieves a user's data from the database.
   * It's used to check if a user exists and get their information.
   */
  async getUser(userId: string): Promise<UserData | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserData;
    }
    return null;
  }

  /**
   * Update user's last login timestamp
   * @param userId - The user's unique ID
   * 
   * This function is called every time a user logs in.
   * It updates the 'lastLogin' field to track when the user was last active.
   */
  async updateUserLastLogin(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  }

  /**
   * Save user preferences to the database
   * @param userId - The user's unique ID
   * @param preferences - User's dietary and cooking preferences
   * 
   * This function saves the preferences that users select during onboarding.
   * These preferences are used to personalize recipe recommendations.
   */
  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences: preferences
    });
  }

  /**
   * Get user preferences from the database
   * @param userId - The user's unique ID
   * @returns User preferences or null if not found
   * 
   * This function retrieves a user's preferences from the database.
   * It's used to apply user preferences to recipe searches.
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData;
      return userData.preferences || null;
    }
    return null;
  }

  // ===== MEAL PLAN OPERATIONS =====

  /**
   * Save a meal plan to the database
   * @param mealPlan - Meal plan data to save (without timestamps)
   * 
   * This function saves a user's meal plan to the database.
   * It's called when users create or update their meal plans.
   */
  async saveMealPlan(mealPlan: Omit<MealPlan, 'createdAt' | 'updatedAt'>): Promise<void> {
    const planRef = doc(db, 'mealPlans', mealPlan.id);
    await setDoc(planRef, {
      ...mealPlan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get all meal plans for a specific user
   * @param userId - The user's unique ID
   * @returns Array of meal plans for the user
   * 
   * This function retrieves all meal plans that belong to a specific user.
   * It's used to load a user's meal plans when they visit the meal planning page.
   */
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    const q = query(collection(db, 'mealPlans'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as MealPlan[];
  }

  /**
   * Delete a meal plan from the database
   * @param planId - The meal plan's unique ID
   * 
   * This function permanently removes a meal plan from the database.
   * It's called when users delete their meal plans.
   */
  async deleteMealPlan(planId: string): Promise<void> {
    const planRef = doc(db, 'mealPlans', planId);
    await deleteDoc(planRef);
  }

  // ===== FAVORITE RECIPES OPERATIONS =====

  /**
   * Save a favorite recipe to the database
   * @param favorite - Favorite recipe data to save (without timestamp)
   * 
   * This function saves a recipe to a user's favorites list.
   * It's called when users click the heart icon on a recipe.
   */
  async saveFavoriteRecipe(favorite: Omit<FavoriteRecipe, 'addedAt'>): Promise<void> {
    const favoriteRef = doc(db, 'favoriteRecipes', favorite.id);
    await setDoc(favoriteRef, {
      ...favorite,
      addedAt: serverTimestamp()
    });
  }

  /**
   * Get all favorite recipes for a specific user
   * @param userId - The user's unique ID
   * @returns Array of favorite recipes for the user
   * 
   * This function retrieves all recipes that a user has marked as favorites.
   * It's used to show the user's favorite recipes on the recipes page.
   */
  async getFavoriteRecipes(userId: string): Promise<FavoriteRecipe[]> {
    const q = query(collection(db, 'favoriteRecipes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as FavoriteRecipe[];
  }

  /**
   * Delete a favorite recipe from the database
   * @param favoriteId - The favorite recipe's unique ID
   * 
   * This function removes a recipe from a user's favorites list.
   * It's called when users un-favorite a recipe.
   */
  async deleteFavoriteRecipe(favoriteId: string): Promise<void> {
    const favoriteRef = doc(db, 'favoriteRecipes', favoriteId);
    await deleteDoc(favoriteRef);
  }

  /**
   * Check if a recipe is favorited by a user
   * @param userId - The user's unique ID
   * @param recipeId - The recipe's unique ID
   * @returns True if the recipe is favorited, false otherwise
   * 
   * This function checks if a specific recipe is in a user's favorites list.
   * It's used to show the correct heart icon state (filled or empty).
   * 
   * ⚠️ Possibly unused - please double check
   */
  async isRecipeFavorited(userId: string, recipeId: string): Promise<boolean> {
    const q = query(
      collection(db, 'favoriteRecipes'),
      where('userId', '==', userId),
      where('recipeId', '==', recipeId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // ===== FRIDGE INGREDIENTS OPERATIONS =====

  /**
   * Save a fridge ingredient to the database
   * @param ingredient - Ingredient data to save (without timestamp)
   * 
   * This function saves an ingredient to a user's fridge list.
   * It's called when users add ingredients to their virtual fridge.
   * 
   * ⚠️ Possibly unused - please double check
   */
  async saveFridgeIngredient(ingredient: Omit<FridgeIngredient, 'addedAt'>): Promise<void> {
    const ingredientRef = doc(db, 'fridgeIngredients', ingredient.id);
    await setDoc(ingredientRef, {
      ...ingredient,
      addedAt: serverTimestamp()
    });
  }

  /**
   * Get all fridge ingredients for a specific user
   * @param userId - The user's unique ID
   * @returns Array of fridge ingredients for the user
   * 
   * This function retrieves all ingredients in a user's virtual fridge.
   * It's used to show the user's ingredients on the fridge page.
   * 
   * ⚠️ Possibly unused - please double check
   */
  async getFridgeIngredients(userId: string): Promise<FridgeIngredient[]> {
    const q = query(collection(db, 'fridgeIngredients'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as FridgeIngredient[];
  }

  /**
   * Delete a fridge ingredient from the database
   * @param ingredientId - The ingredient's unique ID
   * 
   * This function removes an ingredient from a user's virtual fridge.
   * It's called when users remove ingredients from their fridge.
   * 
   * ⚠️ Possibly unused - please double check
   */
  async deleteFridgeIngredient(ingredientId: string): Promise<void> {
    const ingredientRef = doc(db, 'fridgeIngredients', ingredientId);
    await deleteDoc(ingredientRef);
  }

  /**
   * Update a fridge ingredient in the database
   * @param ingredientId - The ingredient's unique ID
   * @param updates - Partial ingredient data to update
   * 
   * This function updates an existing ingredient in a user's virtual fridge.
   * It's called when users modify ingredient quantities or expiry dates.
   * 
   * ⚠️ Possibly unused - please double check
   */
  async updateFridgeIngredient(ingredientId: string, updates: Partial<FridgeIngredient>): Promise<void> {
    const ingredientRef = doc(db, 'fridgeIngredients', ingredientId);
    await updateDoc(ingredientRef, updates);
  }

  /**
   * Delete all fridge ingredients for a specific user
   * @param userId - The user's unique ID
   * 
   * This function removes all ingredients from a user's virtual fridge.
   * It's called when users click the "Clear All" button.
   */
  async deleteAllFridgeIngredients(userId: string): Promise<void> {
    const q = query(collection(db, 'fridgeIngredients'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((doc: any) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}

// Create and export a single instance of the Firestore service
// This ensures we only have one instance of the service throughout the app
export const firestoreService = new FirestoreService();

