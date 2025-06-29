import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import through proper API boundary rather than internal component
import { getTravelPreferencesPanelComponent } from "@/features/travel-preferences/travelPreferencesApi";

// Use factory function to get the component
const TravelPreferencesPanel = getTravelPreferencesPanelComponent();

/**
 * SmartTravel-Profile Page
 *
 * This page displays the TravelPreferencesPanel component in a standalone page.
 * It allows users to view and edit their SmartTravel-Profile.
 */
const TravelPreferencesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Modern Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Smart Travel Profile
                </h1>
                <p className="text-white/60 mt-2">Customize your travel preferences and recommendations</p>
              </div>
              <Button
                onClick={() => {
                  // Trigger edit mode in the TravelPreferencesPanel
                  const editButton = document.querySelector('[data-edit-profile-button]') as HTMLButtonElement;
                  if (editButton) editButton.click();
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <Edit className="h-5 w-5" />
                Edit Smart Travel Profile
              </Button>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="p-8 text-center animate-pulse">
                <div className="text-white/70 text-lg">Loading Smart Travel Profile...</div>
              </div>
            }
          >
            <TravelPreferencesPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export { TravelPreferencesPage };
