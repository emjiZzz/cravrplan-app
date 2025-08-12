# Migration Guide: Spoonacular to TheMealDB API

## Why Migrate to TheMealDB?

✅ **Completely Free**: No API key required, no limits  
✅ **No Trial Period**: Works forever without restrictions  
✅ **Reliable Service**: Used by many food apps and websites  
✅ **Simple Setup**: No registration or API keys needed  
✅ **Good Documentation**: Well-structured API with clear examples  

## TheMealDB vs Other APIs

| API | Free Tier | Trial Period | Setup Complexity |
|-----|-----------|--------------|------------------|
| **TheMealDB** | ✅ Unlimited | ❌ None needed | 🟢 Very Easy |
| Edamam | ❌ 10 days only | ❌ 10 days | 🟡 Medium |
| Spoonacular | ❌ 150/day | ❌ None | 🟡 Medium |
| Recipe Puppy | ✅ Unlimited | ❌ None needed | 🟢 Very Easy |

## Step 1: No Setup Required!

TheMealDB requires **no API keys, no registration, no setup**. You can start using it immediately!

## Step 2: Update API Service

Replace your current API service imports:

```typescript
// OLD: Using Spoonacular
import { searchRecipes, getRecipeDetails, getFilterOptions } from '../services/apiService';

// NEW: Using TheMealDB
import { searchRecipes, getRecipeDetails, getFilterOptions } from '../services/themealdbApiService';
```

## Step 3: Test the Migration

1. Start your development server
2. Test recipe search functionality
3. Test recipe details loading
4. Test shopping list generation

## API Differences

### Spoonacular vs TheMealDB Response Format

**Spoonacular Recipe:**
```json
{
  "id": 123,
  "title": "Recipe Title",
  "image": "image_url",
  "readyInMinutes": 30,
  "servings": 4
}
```

**TheMealDB Recipe:**
```json
{
  "idMeal": "123",
  "strMeal": "Recipe Title",
  "strMealThumb": "image_url",
  "strInstructions": "Step 1... Step 2...",
  "strIngredient1": "ingredient1",
  "strMeasure1": "measure1"
}
```

### Key Differences:

1. **Recipe ID**: TheMealDB uses string IDs, we convert to numbers
2. **Field Names**: Different naming convention (strMeal vs title)
3. **Ingredients**: Stored as strIngredient1, strIngredient2, etc.
4. **Instructions**: Single string that we split into steps
5. **No Nutrition Data**: TheMealDB doesn't provide nutrition info
6. **No Diet Labels**: Limited diet/health information

## Benefits After Migration

- **Unlimited Requests**: No limits at all
- **No API Keys**: No setup or configuration needed
- **No Costs**: Completely free forever
- **Reliable**: Stable and well-maintained API
- **Good Coverage**: Large database of recipes

## Limitations

- **No Nutrition Data**: Can't provide calorie/nutrition info
- **Limited Diet Info**: No detailed diet/health labels
- **No Cooking Time**: Estimated cooking times not provided
- **No Servings**: Default to 4 servings
- **Smaller Database**: Fewer recipes than Spoonacular

## Testing Your Migration

Use these test functions in your browser console:

```javascript
// Test basic functionality
testTheMealDBApi()

// Compare with Spoonacular
compareApis()

// Test specific features
testTheMealDBFeatures()
```

## Troubleshooting

### Common Issues:

1. **No Results**: TheMealDB has a smaller database than Spoonacular
2. **Missing Data**: Some fields are not available (nutrition, cooking time)
3. **Different Format**: Recipe structure is different but converted automatically

### Fallback Strategy:

The new service includes fallback to mock data if the API fails, ensuring your app continues to work.

## TheMealDB API Endpoints

- **Search by name**: `/search.php?s=chicken`
- **Search by area**: `/filter.php?a=italian`
- **Search by category**: `/filter.php?c=dessert`
- **Random recipes**: `/random.php`
- **Recipe details**: `/lookup.php?i=52772`
- **Categories**: `/categories.php`
- **Areas**: `/list.php?a=list`

## Next Steps

1. Test thoroughly in development
2. Update any hardcoded expectations about data format
3. Consider adding nutrition data from a separate API if needed
4. Update documentation for your team

## Support

- TheMealDB API Documentation: https://www.themealdb.com/api.php
- API Status: Generally very reliable
- Community: Active developer community

## Alternative: Hybrid Approach

If you need nutrition data, consider:

1. **Primary**: TheMealDB for recipes (unlimited, free)
2. **Secondary**: Separate nutrition API for calorie data
3. **Fallback**: Mock data for missing information

This gives you unlimited recipe access while still providing nutrition information when needed.
