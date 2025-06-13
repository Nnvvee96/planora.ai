import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/storeApi';
import { Suspense, lazy } from 'react';

// Import the auth components directly using named imports following Planora's architectural principles
import { EmailConfirmation } from './features/auth/components/EmailConfirmation';
import { EmailChangeVerification } from './features/auth/components/EmailChangeVerification';
import { ResetPassword } from './features/auth/components/ResetPassword';

// Import our auth API components using factory functions
import { 
  getAuthProviderComponent,
  getProtectedRouteComponent,
  getAuthCallbackComponent
} from '@/features/auth/authApi';

// Import error boundary component
import { ErrorBoundary } from '@/ui/organisms/ErrorBoundary';

// Add global error handler and debugging
import { useEffect } from 'react';

// Import dev tools
import { getTestModeIndicatorComponent } from '@/features/dev-tools/devToolsApi';
import { ScrollToTop } from './utils/ScrollToTop'; // Adjusted import path

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
import { SupportPage } from "./pages/SupportPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { DebugScreen } from "./pages/DebugScreen";
import AccountRecoveryPage from "./features/user-profile/components/AccountRecoveryPage";
import { AdminPage } from "./pages/Admin/AdminPage";

const queryClient = new QueryClient();

/**
 * Main App component
 * Integrates authentication and routing
 */
const App = () => {
  // Initialize lazy-loaded auth components
  const AuthProvider = getAuthProviderComponent();
  const ProtectedRoute = getProtectedRouteComponent();
  const AuthCallback = getAuthCallbackComponent();
  
  // Initialize test mode indicator component
  const TestModeIndicator = getTestModeIndicatorComponent();
  
  return (
  <ErrorBoundary>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="flex items-center justify-center h-screen bg-planora-background-dark">
            <div className="p-6 rounded-lg bg-planora-background-light border border-planora-accent-purple/20 shadow-lg">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-10 w-40 bg-planora-accent-purple/20 rounded"></div>
                <div className="h-6 w-56 bg-planora-accent-purple/20 rounded"></div>
                <div className="h-4 w-36 bg-planora-accent-purple/20 rounded"></div>
              </div>
            </div>
          </div>}>
            <AuthProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <DebugComponent />
              <TestModeIndicator />
              <Routes>
                {/* Public routes - with authentication check for root path */}
                <Route path="/" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                    <ProtectedRoute redirectToIfAuthenticated="/dashboard" requireAuth={false}>
                      <LandingPage />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<Suspense fallback={<div className="flex items-center justify-center h-screen">Processing authentication...</div>}><AuthCallback /></Suspense>} />
                <Route path="/auth/email-confirmation" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Verifying your email...</div>}>
                    <EmailConfirmation />
                  </Suspense>
                } />
                <Route path="/auth/verification" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Verifying your account...</div>}>
                    <EmailConfirmation />
                  </Suspense>
                } />
                <Route path="/auth/email-change-verification" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Verifying your email change...</div>}>
                    <EmailChangeVerification />
                  </Suspense>
                } />
                <Route path="/auth/reset-password" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading password reset...</div>}>
                    <ResetPassword />
                  </Suspense>
                } />
                <Route path="/account-recovery" element={<Suspense fallback={<div className="flex items-center justify-center h-screen">Processing account recovery...</div>}><AccountRecoveryPage /></Suspense>} />
                <Route path="/debug" element={<DebugScreen />} />
                
                {/* Protected routes that require authentication */}
                <Route path="/admin" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Admin Dashboard...</div>}>
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/onboarding" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading onboarding...</div>}>
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/preferences" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading preferences...</div>}>
                    <ProtectedRoute>
                      <TravelPreferencesPage />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading dashboard...</div>}>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/chat" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading chat...</div>}>
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/profile" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading profile...</div>}>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/saved-trips" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading saved trips...</div>}>
                    <ProtectedRoute>
                      <SavedTrips />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/billing" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading billing...</div>}>
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading settings...</div>}>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/settings/notifications" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading notifications settings...</div>}>
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route path="/settings/privacy" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading privacy settings...</div>}>
                    <ProtectedRoute>
                      <PrivacySecurity />
                    </ProtectedRoute>
                  </Suspense>
                } />
                <Route 
                  path="/support"
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading support...</div>}>
                      <SupportPage />
                    </Suspense>
                  }
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
            </AuthProvider>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </ErrorBoundary>
  );
};

export { App };
