import React, { Suspense } from 'react';

// Import through proper API boundary rather than internal component
import { getTravelPreferencesPanelComponent } from '@/features/travel-preferences/travelPreferencesApi';

// Use factory function to get the component
const TravelPreferencesPanel = getTravelPreferencesPanelComponent();

/**
 * Smart Travel Profile Page
 * 
 * This page displays the TravelPreferencesPanel component in a standalone page.
 * It allows users to view and edit their smart travel profile.
 */
const TravelPreferencesPage = () => {
  
  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-planora-accent-blue/10 via-background to-background"></div>
      <div className="z-10 w-full">
        <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading travel preferences...</div>}>
          <TravelPreferencesPanel />
        </Suspense>
      </div>
    </div>
  );
};

export { TravelPreferencesPage };
