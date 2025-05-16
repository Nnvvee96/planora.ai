/**
 * Database types for the travel-preferences feature
 * These types represent the shape of data as it exists in the database
 * before transformation to frontend types
 * 
 * Following architecture principles:
 * - Feature-First Organization: Types specific to the travel-preferences feature
 * - Clean Code: Clear type definitions with proper documentation
 * - Separation of Concerns: Separating database schema from application types
 */

import { Database as SupabaseDatabase } from '@/lib/supabase/supabaseTypes';

/**
 * Database representation of travel preferences
 * Uses snake_case and lowercase naming to match Supabase columns
 */
// Import types from the Supabase shared type definitions
import { Database } from '@/lib/supabase/supabaseTypes';

// Create a type alias for travel preferences directly from the database schema
export type TravelPreferencesRow = Database['public']['Tables']['travel_preferences']['Row'];
export type TravelPreferencesInsert = Database['public']['Tables']['travel_preferences']['Insert'];
export type TravelPreferencesUpdate = Database['public']['Tables']['travel_preferences']['Update'];

// For backward compatibility, keep the old interface but define it in terms of the new types
// This maintains a proper mapping between DB types and our existing application code
export interface TravelPreferencesDatabase {
  id: string;
  userid: string; // Maps to user_id in the database
  budgetrange: {
    min: number;
    max: number;
  }; // Maps to budget_range in the database
  budgetflexibility: number; // Maps to budget_flexibility in the database
  travelduration: string; // Maps to travel_duration in the database
  dateflexibility: string; // Maps to date_flexibility in the database
  customdateflexibility?: string; // Maps to custom_date_flexibility in the database
  planningintent: string; // Maps to planning_intent in the database
  accommodationtypes: string[]; // Maps to accommodation_types in the database
  accommodationcomfort: string[]; // Maps to accommodation_comfort in the database
  locationpreference: string; // Maps to location_preference in the database
  departurecity?: string; // Maps to departure_city in the database
  flighttype: string; // Maps to flight_type in the database
  prefercheaperwithstopover: boolean; // Maps to prefer_cheaper_with_stopover in the database
  created_at: string;
  updated_at: string;
}
