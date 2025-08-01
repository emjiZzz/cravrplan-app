import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import ShopPage from './pages/ShopPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import { PlanProvider } from './context/PlanContext';

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';

  return (
    <PlanProvider>
      {isLoginPage || isSignUpPage ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      ) : (
        <Header>
          <Routes>
            <Route path="/" element={<h2>Welcome to CravrPlan! Navigate using the sidebar!</h2>} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </Header>
      )}
    </PlanProvider>
  );
}

export default App;