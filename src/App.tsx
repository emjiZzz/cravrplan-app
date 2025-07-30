import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage'; // Import the LoginPage component

// Import placeholder components for other pages (we'll create these next)
import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import ShopPage from './pages/ShopPage';
import RecipeDetailPage from './pages/RecipeDetailPage';


import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header /> {/* The Header component remains visible on all pages */}

      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<h2>Welcome to CravrPlan! Navigate using the links!</h2>} /> {/* Home page */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/shop" element={<ShopPage />} />
          {/* Add more routes here as you build out other features */}
        </Routes>
      </main>
    </div>
  );
}

export default App;