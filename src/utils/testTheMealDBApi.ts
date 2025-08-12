// Test utility for TheMealDB API integration
import { searchRecipes, getRecipeDetails, getFilterOptions } from '../services/themealdbApiService';

export const testTheMealDBApi = async () => {
  console.log('🧪 Testing TheMealDB API Integration...');

  try {
    // Test 1: Get filter options
    console.log('📋 Testing filter options...');
    const filterOptions = await getFilterOptions();
    console.log('✅ Filter options loaded:', filterOptions.cuisines.length, 'cuisines');

    // Test 2: Search recipes
    console.log('🔍 Testing recipe search...');
    const searchResults = await searchRecipes({
      query: 'chicken',
      number: 5,
      offset: 0
    });
    console.log('✅ Recipe search successful:', searchResults.results.length, 'recipes found');

    // Test 3: Get recipe details (if we have results)
    if (searchResults.results.length > 0) {
      console.log('📖 Testing recipe details...');
      const firstRecipe = searchResults.results[0];
      const recipeDetails = await getRecipeDetails(firstRecipe.id);
      console.log('✅ Recipe details loaded for:', recipeDetails.title);

      // Test 4: Check shopping list generation
      console.log('🛒 Testing shopping list generation...');
      if (recipeDetails.extendedIngredients && recipeDetails.extendedIngredients.length > 0) {
        console.log('✅ Recipe has ingredients:', recipeDetails.extendedIngredients.length, 'ingredients');
        console.log('📝 Sample ingredient:', recipeDetails.extendedIngredients[0]);
      }
    }

    console.log('🎉 All TheMealDB API tests passed!');
    return true;

  } catch (error) {
    console.error('❌ TheMealDB API test failed:', error);
    return false;
  }
};

// Function to compare API responses
export const compareApis = async () => {
  console.log('🔄 Comparing Spoonacular vs TheMealDB APIs...');

  try {
    // Import Spoonacular API for comparison
    const { searchRecipes: spoonacularSearch } = await import('../services/apiService');

    // Test both APIs with same query
    const query = 'pasta';

    console.log('🔍 Testing Spoonacular...');
    const spoonacularResults = await spoonacularSearch({
      query,
      number: 3,
      offset: 0
    });

    console.log('🔍 Testing TheMealDB...');
    const themealdbResults = await searchRecipes({
      query,
      number: 3,
      offset: 0
    });

    console.log('📊 Comparison Results:');
    console.log('Spoonacular:', spoonacularResults.results.length, 'recipes');
    console.log('TheMealDB:', themealdbResults.results.length, 'recipes');

    if (themealdbResults.results.length > 0) {
      console.log('✅ TheMealDB API is working correctly');
      console.log('📝 Sample TheMealDB recipe:', themealdbResults.results[0].title);
    }

    return {
      spoonacular: spoonacularResults.results.length,
      themealdb: themealdbResults.results.length,
      success: true
    };

  } catch (error) {
    console.error('❌ API comparison failed:', error);
    return { success: false, error };
  }
};

// Test specific TheMealDB features
export const testTheMealDBFeatures = async () => {
  console.log('🔍 Testing TheMealDB specific features...');

  try {
    // Test random recipes
    console.log('🎲 Testing random recipes...');
    const randomResults = await searchRecipes({
      number: 3,
      offset: 0
    });
    console.log('✅ Random recipes:', randomResults.results.length, 'found');

    // Test cuisine filter
    console.log('🍕 Testing cuisine filter...');
    const italianResults = await searchRecipes({
      cuisine: 'Italian',
      number: 3,
      offset: 0
    });
    console.log('✅ Italian recipes:', italianResults.results.length, 'found');

    // Test category filter
    console.log('🍳 Testing category filter...');
    const dessertResults = await searchRecipes({
      type: 'Dessert',
      number: 3,
      offset: 0
    });
    console.log('✅ Dessert recipes:', dessertResults.results.length, 'found');

    console.log('🎉 All TheMealDB features working!');
    return true;

  } catch (error) {
    console.error('❌ TheMealDB features test failed:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testTheMealDBApi = testTheMealDBApi;
  (window as any).compareApis = compareApis;
  (window as any).testTheMealDBFeatures = testTheMealDBFeatures;
}
