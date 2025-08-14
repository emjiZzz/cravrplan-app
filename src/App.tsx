// Main App component - handles routing and providers

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
import './styles/app.css';

// Component that handles the main app content and routing
const AppContent: React.FC = () => {
  const location = useLocation();
  const { isLoading } = useAuth();

  // Check if we're on auth pages (login, onboarding)
  const isLoginPage = location.pathname === '/login';
  const isOnboardingPage = location.pathname === '/onboarding';

  // Show loading screen while checking if user is logged in
  if (isLoading) {
    return <PageLoading message="Creating Account, please wait..." />;
  }

  return (
    <div className="app-container">
      {/* Don't show header on auth pages */}
      {!isLoginPage && !isOnboardingPage && <Header />}

      <main className="main-content">
        <Routes>
          {/* Home page - shows recipes */}
          <Route path="/" element={<RecipesPage />} />

          {/* Auth pages - don't require authentication */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute requireAuth={false}>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          {/* Recipe pages */}
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />

          {/* Meal plan page - requires authentication */}
          <Route path="/plan" element={
            <ProtectedRoute requireAuth={false}>
              <PlanPage />
            </ProtectedRoute>
          } />

          {/* Fridge page - anyone can access */}
          <Route path="/fridge" element={<FridgePage />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App component that sets up all the providers
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
