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
  events: any[];
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

  // Demo account setup
  async setupDemoAccount(userId: string): Promise<void> {
    // Create sample meal plans
    const sampleMealPlan: Omit<MealPlan, 'createdAt' | 'updatedAt'> = {
      id: `demo-plan-${Date.now()}`,
      userId,
      title: 'Sample Weekly Plan',
      events: [
        {
          id: 'demo-event-1',
          title: 'Grilled Chicken Salad',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          mealType: 'lunch',
          recipe: {
            id: 12345,
            title: 'Grilled Chicken Salad',
            image: 'https://spoonacular.com/recipeImages/12345-312x231.jpg'
          }
        }
      ]
    };

    // Create sample favorites
    const sampleFavorites: Omit<FavoriteRecipe, 'addedAt'>[] = [
      {
        id: `demo-fav-1-${Date.now()}`,
        userId,
        recipeId: '12345',
        recipe: {
          id: 12345,
          title: 'Grilled Chicken Salad',
          image: 'https://spoonacular.com/recipeImages/12345-312x231.jpg',
          readyInMinutes: 20,
          servings: 2
        }
      },
      {
        id: `demo-fav-2-${Date.now()}`,
        userId,
        recipeId: '67890',
        recipe: {
          id: 67890,
          title: 'Pasta Carbonara',
          image: 'https://spoonacular.com/recipeImages/67890-312x231.jpg',
          readyInMinutes: 25,
          servings: 4
        }
      }
    ];

    // Create sample fridge ingredients
    const sampleIngredients: Omit<FridgeIngredient, 'addedAt'>[] = [
      {
        id: `demo-ingredient-1-${Date.now()}`,
        userId,
        name: 'Chicken Breast',
        quantity: 2,
        unit: 'pieces',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: `demo-ingredient-2-${Date.now()}`,
        userId,
        name: 'Mixed Greens',
        quantity: 1,
        unit: 'bag',
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    // Save all demo data
    await this.saveMealPlan(sampleMealPlan);

    for (const favorite of sampleFavorites) {
      await this.saveFavoriteRecipe(favorite);
    }

    for (const ingredient of sampleIngredients) {
      await this.saveFridgeIngredient(ingredient);
    }
  }
}

export const firestoreService = new FirestoreService();

