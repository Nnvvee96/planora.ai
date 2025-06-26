/**
 * Public API for the travel-planning feature
 * This file exports only what should be accessible to other parts of the application
 * It serves as the boundary for this feature
 */

// Export types that should be available to other features
import {
  TravelPlan,
  Destination,
  Activity,
  Budget,
  Accommodation,
  Transportation,
} from "./types/travelPlanningTypes";

export type {
  TravelPlan,
  Destination,
  Activity,
  Budget,
  Accommodation,
  Transportation,
};

// Import lazy for component lazy loading
import { lazy } from "react";

// Export a factory function for the TravelCards component
// This follows Planora's architectural principles and avoids circular dependencies
export const getTravelCardsComponent = () => {
  return lazy(() =>
    import("./components/TravelCards").then((module) => ({
      default: module.TravelCards,
    })),
  );
};

// When we add hooks, they would be exported as factory functions too
// export const getTravelPlanningHook = async () => {
//   const module = await import('./hooks/useTravelPlanning');
//   return module.useTravelPlanning;
// };
