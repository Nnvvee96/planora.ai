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
  Transportation 
} from './types/travelPlanningTypes';

export type { 
  TravelPlan, 
  Destination, 
  Activity, 
  Budget,
  Accommodation, 
  Transportation 
};

// Export components that should be accessible outside this feature
export { TravelCards } from './components/TravelCards';

// When we add hooks, they would be exported here
// export { useTravelPlanning } from './hooks/useTravelPlanning';
