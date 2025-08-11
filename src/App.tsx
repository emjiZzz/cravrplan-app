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
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoading } from './components/LoadingStates';

import { Routes, Route, useLocation } from 'react-router-dom';

// Separate component to handle auth-dependent rendering
const AppContent: React.FC = () => {
  const location = useLocation();
  const { isLoading } = useAuth();

  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoading message="Loading your account..." />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isLoginPage && !isSignUpPage && !isLandingPage && <Header />}

      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/signup" element={
            <ProtectedRoute requireAuth={false}>
              <SignUpPage />
            </ProtectedRoute>
          } />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/plan" element={
            <ProtectedRoute>
              <PlanPage />
            </ProtectedRoute>
          } />
          {/* Shop page removed */}
          <Route path="/fridge" element={<FridgePage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <ShoppingListProvider>
          <AppContent />
        </ShoppingListProvider>
      </PlanProvider>
    </AuthProvider>
  );
}

export default App;
