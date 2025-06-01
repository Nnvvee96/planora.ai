/**
 * Store API
 * 
 * Public API for store-related functionality.
 * Following Planora's architectural principles with feature-first organization.
 *
 * Configures the global Redux store with all feature slices
 */
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';

// Configure the store with all reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other feature reducers here as the application grows
    // userProfile: userProfileReducer,
    // travelPlanning: travelPlanningReducer,
  },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
