// Recipe API Types

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string[];
  maxReadyTime?: number;
  minProtein?: number;
  maxCalories?: number;
  offset?: number;
  number?: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  license?: string;
  sourceName?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  aggregateLikes: number;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  analyzedInstructions: AnalyzedInstruction[];
  cheap: boolean;
  creditsText?: string;
  cuisines: string[];
  dairyFree: boolean;
  diets: string[];
  gaps: string;
  glutenFree: boolean;
  instructions: string;
  ketogenic: boolean;
  lowFodmap: boolean;
  occasions: string[];
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  dishTypes: string[];
  extendedIngredients: ExtendedIngredient[];
  summary: string;
  nutrition?: Nutrition;
}

export interface AnalyzedInstruction {
  name: string;
  steps: Step[];
}

export interface Step {
  id: number;
  number: number;
  step: string;
  ingredients: Ingredient[];
  equipment: Equipment[];
  length?: Length;
}

export interface Ingredient {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface Equipment {
  id: number;
  name: string;
  localizedName: string;
  image: string;
  temperature?: Temperature;
}

export interface Temperature {
  number: number;
  unit: string;
}

export interface Length {
  number: number;
  unit: string;
}

export interface ExtendedIngredient {
  id: number;
  aisle: string;
  amount: number;
  unit: string;
  name: string;
  original: string;
  originalName: string;
  meta: string[];
  image: string;
}

export interface Nutrition {
  nutrients: Nutrient[];
  properties: Property[];
  flavonoids: Flavonoid[];
  ingredients: NutritionIngredient[];
  caloricBreakdown: CaloricBreakdown;
  weightPerServing: WeightPerServing;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface Property {
  name: string;
  amount: number;
  unit: string;
}

export interface Flavonoid {
  name: string;
  amount: number;
  unit: string;
}

export interface NutritionIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  nutrients: Nutrient[];
}

export interface CaloricBreakdown {
  percentProtein: number;
  percentFat: number;
  percentCarbs: number;
}

export interface WeightPerServing {
  amount: number;
  unit: string;
}

export interface RecipeSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface RecipeDetailResponse extends Recipe {
  // Additional fields for detailed view
  winePairing?: WinePairing;
  taste?: Taste;
}

export interface WinePairing {
  pairedWines: string[];
  pairingText: string;
  productMatches: ProductMatch[];
}

export interface ProductMatch {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  averageRating: number;
  ratingCount: number;
  score: number;
  link: string;
}

export interface Taste {
  sweetness: number;
  saltiness: number;
  sourness: number;
  bitterness: number;
  savoriness: number;
  fattiness: number;
  spiciness: number;
}

// Filter options
export interface FilterOptions {
  cuisines: string[];
  diets: string[];
  intolerances: string[];
  mealTypes: string[];
}

export interface FilterOptionsResponse {
  cuisines: { name: string; value: string }[];
  diets: { name: string; value: string }[];
  intolerances: { name: string; value: string }[];
  mealTypes: { name: string; value: string }[];
}
