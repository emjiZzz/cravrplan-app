/* src/pages/RecipesPage.TSX */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeDetails } from '../services/apiService';
import type { Recipe } from '../types/recipeTypes';
import styles from './RecipeDetailPage.module.css';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Use for the back button
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients'); // State for tabs

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const data = await getRecipeDetails(Number(id));
          setRecipe(data);
        } else {
          setError('No recipe ID provided.');
        }
      } catch (err) {
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading recipe...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!recipe) return <div className={styles.error}>No recipe found.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.recipeHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>&larr;</button>
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.imageSection}>
          <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
          <button className={styles.addFavoriteButton}>+</button>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.active : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'instructions' ? styles.active : ''}`}
              onClick={() => setActiveTab('instructions')}
            >
              Cook & Satisfied!
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'ingredients' ? (
              <ul className={styles.ingredientsList}>
                {recipe.extendedIngredients?.map((ing) => (
                  <li key={ing.id}>
                    <span>{ing.original}</span>
                    {/* Add quantity here if available from API */}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.instructionsList}>
                <div dangerouslySetInnerHTML={{ __html: recipe.instructions || 'No instructions provided.' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;