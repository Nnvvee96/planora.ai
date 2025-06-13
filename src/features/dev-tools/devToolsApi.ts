/**
 * Dev Tools API
 * 
 * Public API for development tools functionality.
 * Following Planora's architectural principles with feature-first organization.
 */

import { lazy } from 'react';
import type { TestModeIndicatorProps } from './components/TestModeIndicator';

/**
 * Factory function for Test Mode Indicator component
 * This avoids circular dependencies by dynamically importing the component only when needed
 */
export const getTestModeIndicatorComponent = () => {
  return lazy(() => import('./components/TestModeIndicator').then(module => ({
    default: module.TestModeIndicator
  })));
};

/**
 * Check if the application is running in test mode
 * @returns True if the application is in test mode
 */
export const isInTestMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'test';
};

// Re-export types
export type { TestModeIndicatorProps };

export { BetaFeature } from './components/BetaFeature';
