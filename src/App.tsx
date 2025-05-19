
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';

// Import our auth API components
import { AuthProvider, ProtectedRoute, AuthCallback } from '@/features/auth/api';

// Import error boundary component
import { ErrorBoundary } from '@/ui/organisms/ErrorBoundary';

// Add global error handler and debugging
import { useEffect } from 'react';

// Print environment variables to console (without keys)
const DebugComponent = () => {
  useEffect(() => {
    console.log('Environment variables check:');
    console.log('VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_ENABLE_GOOGLE_AUTH:', import.meta.env.VITE_ENABLE_GOOGLE_AUTH);
  }, []);
  
  return null;
};

// Pages
import { LandingPage } from "./pages/LandingPage";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { SavedTrips } from "./pages/SavedTrips";
import { Billing } from "./pages/Billing";
import { TravelPreferencesPage } from "./pages/TravelPreferencesPage";
import { Notifications } from "./pages/Settings/Notifications";
import { PrivacySecurity } from "./pages/Settings/PrivacySecurity";
import { Support } from "./pages/Support";
import { DebugScreen } from "./pages/DebugScreen";

const queryClient = new QueryClient();

/**
 * Main App component
 * Integrates authentication and routing
 */
const App = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <DebugComponent />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/debug" element={<DebugScreen />} />
                
                {/* Protected routes that require authentication */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/preferences" element={
                  <ProtectedRoute>
                    <TravelPreferencesPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/saved-trips" element={
                  <ProtectedRoute>
                    <SavedTrips />
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/settings/privacy" element={
                  <ProtectedRoute>
                    <PrivacySecurity />
                  </ProtectedRoute>
                } />
                <Route path="/support" element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </ErrorBoundary>
);

export { App };
