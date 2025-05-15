/**
 * Mock feature API exports for integration testing
 * 
 * These mock implementations allow us to test cross-feature communication
 * without relying on the actual feature implementations.
 */

// Define action types
type AuthAction = 
  | { type: 'auth/setUser'; payload: unknown }
  | { type: 'auth/setLoading'; payload: boolean };

type UserProfileAction = 
  | { type: 'userProfile/setProfile'; payload: unknown }
  | { type: 'userProfile/setLoading'; payload: boolean };

type TravelPlanningAction = 
  | { type: 'travelPlanning/setPlans'; payload: unknown[] }
  | { type: 'travelPlanning/setCurrentPlan'; payload: unknown };

// Mock auth feature exports
export const authReducer = (state = {
  user: null,
  isAuthenticated: false,
  loading: false
}, action: AuthAction) => {
  switch (action.type) {
    case 'auth/setUser':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case 'auth/setLoading':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Mock user profile feature exports
export const userProfileReducer = (state = {
  profile: null,
  loading: false
}, action: UserProfileAction) => {
  switch (action.type) {
    case 'userProfile/setProfile':
      return {
        ...state,
        profile: action.payload
      };
    case 'userProfile/setLoading':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Mock travel planning feature exports
export const travelPlanningReducer = (state = {
  plans: [],
  currentPlan: null,
  loading: false
}, action: TravelPlanningAction) => {
  switch (action.type) {
    case 'travelPlanning/setPlans':
      return {
        ...state,
        plans: action.payload
      };
    case 'travelPlanning/setCurrentPlan':
      return {
        ...state,
        currentPlan: action.payload
      };
    default:
      return state;
  }
};
