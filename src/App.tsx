import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';

import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import ShopPage from './pages/ShopPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import FridgePage from './pages/FridgePage';
import { PlanProvider } from './context/PlanContext';

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';

  return (
    <PlanProvider>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {!isLoginPage && !isSignUpPage && <Header />}

        <main style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<h2>Welcome to CravrPlan! Navigate using the links!</h2>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/fridge" element={<FridgePage />} />
          </Routes>
        </main>
      </div>
    </PlanProvider>
  );
}

export default App;
