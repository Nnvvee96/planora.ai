/**
 * useTravelPlanningIntegration hook
 * 
 * This is an integration hook that provides a clean interface to the travel-planning feature.
 * It isolates the implementation details of the travel-planning feature and provides only what other
 * features need to know about travel planning.
 */

// Import only from the feature's public API
import { TravelPlan } from '@/features/travel-planning/api';
import { useAuthIntegration } from './useAuthIntegration';

/**
 * useTravelPlanningIntegration
 * 
 * @returns Interface to interact with the travel-planning feature
 */
export function useTravelPlanningIntegration() {
  // Use the auth integration to get necessary user info
  const { isAuthenticated, user } = useAuthIntegration();
  
  // In a real app, we would have a useTravelPlanning hook in the travel-planning feature
  // that would fetch the user's travel plans based on their authentication
  
  // For now, mock the interface that would be provided
  const mockPlans: TravelPlan[] = isAuthenticated ? [
    {
      id: '1',
      title: 'Summer in Europe',
      description: 'A summer tour of major European cities',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-15'),
      destinations: [
        {
          id: '1',
          name: 'Paris',
          country: 'France',
          arrivalDate: new Date('2025-07-01'),
          departureDate: new Date('2025-07-05')
        },
        {
          id: '2',
          name: 'Rome',
          country: 'Italy',
          arrivalDate: new Date('2025-07-05'),
          departureDate: new Date('2025-07-10')
        },
        {
          id: '3',
          name: 'Barcelona',
          country: 'Spain',
          arrivalDate: new Date('2025-07-10'),
          departureDate: new Date('2025-07-15')
        }
      ],
      activities: [],
      createdBy: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false
    }
  ] : [];
  
  // Return a clean interface that other features can use
  return {
    // Only expose what's needed by other features
    userTravelPlans: mockPlans,
    hasTravelPlans: mockPlans.length > 0,
    
    // In a real app, we would expose methods to manage travel plans
    // createTravelPlan: (plan) => { ... },
    // updateTravelPlan: (id, updates) => { ... },
    // deleteTravelPlan: (id) => { ... },
    
    // Derived data that might be useful for other features
    upcomingTravelPlan: mockPlans.length > 0 ? 
      mockPlans.filter(plan => new Date(plan.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0] 
      : null,
  };
}
