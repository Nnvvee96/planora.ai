/**
 * Common test setup for integration tests
 * 
 * This file provides reusable utilities for integration tests to ensure
 * proper TypeScript typing and consistent test setup across all tests.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, EnhancedStore, combineReducers } from '@reduxjs/toolkit';
import { authReducer, userProfileReducer, travelPlanningReducer } from './mocks/featureApis';

// Define core state types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface UserProfileState {
  profile: unknown | null;
  loading: boolean;
}

export interface TravelPlanningState {
  plans: unknown[];
  currentPlan: unknown | null;
  loading: boolean;
}

export interface RootState {
  auth: AuthState;
  userProfile: UserProfileState;
  travelPlanning: TravelPlanningState;
}

/**
 * Creates a test store with all or selected slices
 */
export function createTestStore(preloadedState: Partial<RootState> = {}): EnhancedStore {
  // Use combineReducers to properly type the root reducer
  const rootReducer = combineReducers({
    auth: authReducer,
    userProfile: userProfileReducer,
    travelPlanning: travelPlanningReducer,
  });
  
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as unknown as ReturnType<typeof rootReducer>,
  });
}

/**
 * Creates a wrapper component for tests
 */
export function createTestWrapper(preloadedState: Partial<RootState> = {}) {
  const TestWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const store = createTestStore(preloadedState);
    return <Provider store={store}>{children}</Provider>;
  };
  
  return TestWrapper;
}
