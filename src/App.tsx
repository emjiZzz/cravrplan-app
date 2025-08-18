// Main App component - handles routing and authentication
import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage';
import OnboardingPage from './pages/Auth/OnboardingPage';
import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import FridgePage from './pages/FridgePage';
import { PlanProvider } from './context/PlanContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GuestProvider } from './context/GuestContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoading } from './components/LoadingStates';
import { Routes, Route, useLocation } from 'react-router-dom';

// This component handles the main app content and routing
const AppContent: React.FC = () => {
  const location = useLocation();
  const { isLoading } = useAuth();

  // Check if we're on login or onboarding pages to hide header
  const isLoginPage = location.pathname === '/login';
  const isOnboardingPage = location.pathname === '/onboarding';

  // Show loading screen while checking authentication
  if (isLoading) {
    return <PageLoading message="Loading your account..." />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Only show header if not on login/onboarding pages */}
      {!isLoginPage && !isOnboardingPage && <Header />}

      {/* Main content area */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          {/* Home page shows recipes */}
          <Route path="/" element={<RecipesPage />} />

          {/* Login page - doesn't require authentication */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />

          {/* Onboarding page - doesn't require authentication */}
          <Route path="/onboarding" element={
            <ProtectedRoute requireAuth={false}>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          {/* Recipes pages */}
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />

          {/* Meal plan page - doesn't require authentication */}
          <Route path="/plan" element={
            <ProtectedRoute requireAuth={false}>
              <PlanPage />
            </ProtectedRoute>
          } />

          {/* Fridge page */}
          <Route path="/fridge" element={<FridgePage />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App component that wraps everything in context providers
function App() {
  return (
    <AuthProvider>
      <GuestProvider>
        <FavoritesProvider>
          <PlanProvider>
            <AppContent />
          </PlanProvider>
        </FavoritesProvider>
      </GuestProvider>
    </AuthProvider>
  );
}

export default App;
