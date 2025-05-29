/**
 * Location Data API
 * 
 * Public API for location data functionality.
 * Exports services, types, and utilities for location data.
 * Following Planora's architectural principles with feature-first organization.
 */

// Export types and data
export type { CountryOption, CityOption } from './data/countryCityData';
export {
  countryOptions,
  getCityOptions,
  isCustomCityNeeded
} from './data/countryCityData';

// Additional helper functions can be added here as needed
