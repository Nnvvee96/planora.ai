/**
 * Onboarding Helper Functions
 * 
 * Utility functions for onboarding flow
 */

// Helper function to toggle selections in arrays
export const toggleSelection = (field: string[], value: string): string[] => {
  if (field.includes(value)) {
    return field.filter((item) => item !== value);
  } else {
    return [...field, value];
  }
};

// Formatting functions
export const formatBudgetRange = (min: number, max: number) => `€${min} - €${max}`;
export const formatBudgetTolerance = (value: number) => `±${value}%`;

// Default form values
export const getDefaultFormValues = () => ({
  departureCountry: "",
  departureCity: "",
  customDepartureCity: "",
  budgetRange: { min: 1000, max: 2000 },
  budgetTolerance: 10,
  travelDuration: "week",
  dateFlexibility: "flexible-few",
  customDateFlexibility: "",
  planningIntent: "exploring",
  accommodationTypes: ["hotel"],
  accommodationComfort: ["private-room", "private-bathroom"],
  locationPreference: "anywhere",
  flightType: "direct",
  preferCheaperWithStopover: true,
}); 