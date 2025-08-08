import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import LandingPage from './pages/LandingPage';

import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import FridgePage from './pages/FridgePage';
import { PlanProvider } from './context/PlanContext';
import { ShoppingListProvider } from './context/ShoppingListContext';

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  return (
    <PlanProvider>
      <ShoppingListProvider>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {!isLoginPage && !isSignUpPage && !isLandingPage && <Header />}

          <main style={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/plan" element={<PlanPage />} />
              {/* Shop page removed */}
              <Route path="/fridge" element={<FridgePage />} />
            </Routes>
          </main>
        </div>
      </ShoppingListProvider>
    </PlanProvider>
  );
}

export default App;
