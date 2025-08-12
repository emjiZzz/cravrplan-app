import Header from './Header/Header';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import OnboardingPage from './pages/Auth/OnboardingPage';

import RecipesPage from './pages/RecipesPage';
import PlanPage from './pages/PlanPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import FridgePage from './pages/FridgePage';
import AdminPage from './pages/AdminPage';
import { PlanProvider } from './context/PlanContext';

import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GuestProvider, useGuest } from './context/GuestContext';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoading } from './components/LoadingStates';
import { Routes, Route, useLocation } from 'react-router-dom';
import './utils/demoSetup'; // Auto-setup demo users

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();
  const { isGuestMode } = useGuest();

  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';
  const isOnboardingPage = location.pathname === '/onboarding';

  if (isLoading) {
    return <PageLoading message="Loading your account..." />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isLoginPage && !isSignUpPage && !isOnboardingPage && <Header />}

      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<RecipesPage />} />
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
          <Route path="/signup" element={
            <ProtectedRoute requireAuth={false}>
              <SignUpPage />
            </ProtectedRoute>
          } />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/plan" element={
            <ProtectedRoute requireAuth={false}>
              <PlanPage />
            </ProtectedRoute>
          } />
          <Route path="/fridge" element={<FridgePage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

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
