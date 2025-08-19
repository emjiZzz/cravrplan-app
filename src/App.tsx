// Main App Component - Handles routing and application structure
// This component sets up the app layout, routing, and context providers
// It's the top-level component that wraps all other components

// Page imports - These are the main pages of the application
import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage';
import OnboardingPage from './pages/Auth/OnboardingPage';
import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import FridgePage from './pages/FridgePage';

// Context provider imports - These provide data and functions to all components
import { PlanProvider } from './context/PlanContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GuestProvider } from './context/GuestContext';

// Component imports - Reusable components used throughout the app
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoading } from './components/LoadingStates';

// Router imports - For handling navigation between pages
import { Routes, Route, useLocation } from 'react-router-dom';

// Styles - Global styles for the app
import './styles/app.css';

/**
 * Main app content component - handles routing and layout
 * This component manages the app structure and determines which pages to show
 * It also handles authentication state and loading screens
 */
const AppContent: React.FC = () => {
  // Get current location and authentication state
  const location = useLocation();  // Tells us which page the user is currently on
  const { isLoading } = useAuth(); // Tells us if the app is checking if user is logged in

  // Check if current page is an authentication page (login or onboarding)
  // We hide the header on these pages for a cleaner look
  const isAuthPage = location.pathname === '/login' || location.pathname === '/onboarding';

  // Show loading screen while authentication is being checked
  // This prevents showing the wrong content while we figure out if user is logged in
  if (isLoading) {
    return <PageLoading message="Loading your account..." />;
  }

  return (
    <div className="app-container">
      {/* Hide header on authentication pages for a cleaner look */}
      {!isAuthPage && <Header />}

      <main className="main-content">
        <Routes>
          {/* Home page - shows recipes */}
          <Route path="/" element={<RecipesPage />} />

          {/* Authentication routes - don't require authentication */}
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

          {/* Recipe routes - show recipe lists and details */}
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />

          {/* Meal planning route - accessible without authentication */}
          <Route path="/plan" element={
            <ProtectedRoute requireAuth={false}>
              <PlanPage />
            </ProtectedRoute>
          } />

          {/* Fridge management route - for managing ingredients */}
          <Route path="/fridge" element={<FridgePage />} />
        </Routes>
      </main>
    </div>
  );
};

/**
 * Main App component - wraps the app with all necessary context providers
 * This component provides authentication, favorites, and meal planning context to the entire app
 * Context providers allow any component in the app to access shared data and functions
 */
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
