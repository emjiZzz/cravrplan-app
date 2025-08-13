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

export interface UserData {
  id: string;
  email: string;
  fullName: string;
  createdAt: any;
  lastLogin: any;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  cookingLevel: string;
  timePreferences: string[];
  allergies: string[];
  spiceLevel: string;
  servingSize: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  title: string;
  events: PlanEvent[];
  createdAt: any;
  updatedAt: any;
}

export interface FavoriteRecipe {
  id: string;
  userId: string;
  recipeId: string;
  recipe: any;
  addedAt: any;
}

export interface FridgeIngredient {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  addedAt: any;
}

class FirestoreService {
  // User data operations
  async createUser(userData: Omit<UserData, 'createdAt' | 'lastLogin'>): Promise<void> {
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  }

  async getUser(userId: string): Promise<UserData | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserData;
    }
    return null;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  }

  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences: preferences
    });
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData;
      return userData.preferences || null;
    }
    return null;
  }

  // Meal plan operations
  async saveMealPlan(mealPlan: Omit<MealPlan, 'createdAt' | 'updatedAt'>): Promise<void> {
    const planRef = doc(db, 'mealPlans', mealPlan.id);
    await setDoc(planRef, {
      ...mealPlan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getMealPlans(userId: string): Promise<MealPlan[]> {
    const q = query(collection(db, 'mealPlans'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MealPlan[];
  }

  async deleteMealPlan(planId: string): Promise<void> {
    const planRef = doc(db, 'mealPlans', planId);
    await deleteDoc(planRef);
  }

  // Favorite recipes operations
  async saveFavoriteRecipe(favorite: Omit<FavoriteRecipe, 'addedAt'>): Promise<void> {
    const favoriteRef = doc(db, 'favoriteRecipes', favorite.id);
    await setDoc(favoriteRef, {
      ...favorite,
      addedAt: serverTimestamp()
    });
  }

  async getFavoriteRecipes(userId: string): Promise<FavoriteRecipe[]> {
    const q = query(collection(db, 'favoriteRecipes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FavoriteRecipe[];
  }

  async deleteFavoriteRecipe(favoriteId: string): Promise<void> {
    const favoriteRef = doc(db, 'favoriteRecipes', favoriteId);
    await deleteDoc(favoriteRef);
  }

  async isRecipeFavorited(userId: string, recipeId: string): Promise<boolean> {
    const q = query(
      collection(db, 'favoriteRecipes'),
      where('userId', '==', userId),
      where('recipeId', '==', recipeId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Fridge ingredients operations
  async saveFridgeIngredient(ingredient: Omit<FridgeIngredient, 'addedAt'>): Promise<void> {
    const ingredientRef = doc(db, 'fridgeIngredients', ingredient.id);
    await setDoc(ingredientRef, {
      ...ingredient,
      addedAt: serverTimestamp()
    });
  }

  async getFridgeIngredients(userId: string): Promise<FridgeIngredient[]> {
    const q = query(collection(db, 'fridgeIngredients'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FridgeIngredient[];
  }

  async deleteFridgeIngredient(ingredientId: string): Promise<void> {
    const ingredientRef = doc(db, 'fridgeIngredients', ingredientId);
    await deleteDoc(ingredientRef);
  }

  async updateFridgeIngredient(ingredientId: string, updates: Partial<FridgeIngredient>): Promise<void> {
    const ingredientRef = doc(db, 'fridgeIngredients', ingredientId);
    await updateDoc(ingredientRef, updates);
  }

}

export const firestoreService = new FirestoreService();

