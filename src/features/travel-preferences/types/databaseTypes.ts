/**
 * Database types for the travel-preferences feature
 * These types represent the shape of data as it exists in the database
 * before transformation to frontend types
 */

/**
 * Database representation of travel preferences
 * Uses snake_case and lowercase naming to match Supabase columns
 */
export interface TravelPreferencesDatabase {
  id: string;
  userid: string;
  budgetrange: {
    min: number;
    max: number;
  };
  budgetflexibility: number;
  travelduration: string;
  dateflexibility: string;
  customdateflexibility?: string;
  planningintent: string;
  accommodationtypes: string[];
  accommodationcomfort: string[];
  locationpreference: string;
  departurecity?: string;
  flighttype: string;
  prefercheaperwithstopover: boolean;
  created_at: string;
  updated_at: string;
}
