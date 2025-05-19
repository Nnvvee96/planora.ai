import React, { Suspense, lazy } from 'react';
import { getTravelPreferencesPanelComponent } from '@/features/travel-preferences/api';

/**
 * Travel Preferences Page
 * 
 * This page displays the TravelPreferencesPanel component in a standalone page.
 * It allows users to view and edit their saved travel preferences.
 */
const TravelPreferencesPage = () => {
  // Get the TravelPreferencesPanel component using the factory function
  const TravelPreferencesPanel = getTravelPreferencesPanelComponent();
  
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
