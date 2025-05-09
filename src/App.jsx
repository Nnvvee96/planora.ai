import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./utils/protectedRoute.jsx";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PlanTripPage from "./pages/PlanTripPage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import PastTripsPage from "./pages/PastTripsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpFeedbackPage from "./pages/HelpFeedbackPage";
import UpgradePlanPage from "./pages/UpgradePlanPage";
import ErrorPage from "./pages/ErrorPage";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import SavedTripsPage from "./pages/SavedTripsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import TripDetailsPage from "./pages/TripDetailsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
          <Route path="/plan-trip" element={<ProtectedRoute component={PlanTripPage} />} />
          <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
          <Route path="/explore" element={<ProtectedRoute component={ExplorePage} />} />
          <Route path="/past-trips" element={<ProtectedRoute component={PastTripsPage} />} />
          <Route path="/settings" element={<ProtectedRoute component={SettingsPage} />} />
          <Route path="/help-feedback" element={<ProtectedRoute component={HelpFeedbackPage} />} />
          <Route path="/upgrade-plan" element={<ProtectedRoute component={UpgradePlanPage} />} />
          <Route path="/saved-trips" element={<ProtectedRoute component={SavedTripsPage} />} />
          <Route path="/search-results" element={<ProtectedRoute component={SearchResultsPage} />} />
          <Route path="/trip/:id" element={<ProtectedRoute component={TripDetailsPage} />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;