import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import PlanTripPage from "./pages/PlanTripPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import HelpFeedbackPage from "./pages/HelpFeedbackPage";
import UpgradePlanPage from "./pages/UpgradePlanPage";
import ExplorePage from "./pages/ExplorePage";
import PastTripsPage from "./pages/PastTripsPage";
import SavedTripsPage from "./pages/SavedTripsPage";
import TripDetailsPage from "./pages/TripDetailsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan-trip"
            element={
              <ProtectedRoute>
                <PlanTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help-feedback"
            element={
              <ProtectedRoute>
                <HelpFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upgrade-plan"
            element={
              <ProtectedRoute>
                <UpgradePlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/past-trips"
            element={
              <ProtectedRoute>
                <PastTripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-trips"
            element={
              <ProtectedRoute>
                <SavedTripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-results"
            element={
              <ProtectedRoute>
                <SearchResultsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;