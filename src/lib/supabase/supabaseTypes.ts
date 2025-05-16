/**
 * Supabase Database Types
 * 
 * This file defines the TypeScript types that correspond to your Supabase database schema.
 * Following the architectural principles of type safety and separation of concerns.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          first_name: string
          last_name: string
          email: string
          city: string | null
          country: string | null
          birthdate: string | null
          created_at: string
          has_completed_onboarding: boolean
        }
        Insert: {
          id: string
          username: string
          first_name: string
          last_name: string
          email: string
          city?: string | null
          country?: string | null
          birthdate?: string | null
          created_at?: string
          has_completed_onboarding?: boolean
        }
        Update: {
          id?: string
          username?: string
          first_name?: string
          last_name?: string
          email?: string
          city?: string | null
          country?: string | null
          birthdate?: string | null
          created_at?: string
          has_completed_onboarding?: boolean
        }
      },
      travel_preferences: {
        Row: {
          id: string
          user_id: string
          budget_range: { min: number; max: number }
          budget_flexibility: number
          travel_duration: string
          date_flexibility: string
          custom_date_flexibility: string | null
          planning_intent: string
          accommodation_types: string[]
          accommodation_comfort: string[]
          location_preference: string
          departure_city: string | null
          flight_type: string
          prefer_cheaper_with_stopover: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          budget_range: { min: number; max: number }
          budget_flexibility: number
          travel_duration: string
          date_flexibility: string
          custom_date_flexibility?: string | null
          planning_intent: string
          accommodation_types: string[]
          accommodation_comfort: string[]
          location_preference: string
          departure_city?: string | null
          flight_type: string
          prefer_cheaper_with_stopover: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget_range?: { min: number; max: number }
          budget_flexibility?: number
          travel_duration?: string
          date_flexibility?: string
          custom_date_flexibility?: string | null
          planning_intent?: string
          accommodation_types?: string[]
          accommodation_comfort?: string[]
          location_preference?: string
          departure_city?: string | null
          flight_type?: string
          prefer_cheaper_with_stopover?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Supabase schema types to be used in queries
// Following the architectural principles of named exports and clean type definitions

// Profile types
export type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
export type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfilesUpdate = Database['public']['Tables']['profiles']['Update'];

// Travel preferences types
export type TravelPreferencesRow = Database['public']['Tables']['travel_preferences']['Row'];
export type TravelPreferencesInsert = Database['public']['Tables']['travel_preferences']['Insert'];
export type TravelPreferencesUpdate = Database['public']['Tables']['travel_preferences']['Update'];

// Add more named exports as needed for other tables
