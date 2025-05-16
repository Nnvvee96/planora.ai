export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          email: string
          created_at: string
          updated_at: string | null
          preferences: Json | null
        }
        Insert: {
          id: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email: string
          created_at?: string
          updated_at?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          email?: string
          created_at?: string
          updated_at?: string | null
          preferences?: Json | null
        }
      }
      travel_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          destination: string
          start_date: string | null
          end_date: string | null
          budget: number | null
          status: string
          created_at: string
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          destination: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          created_at?: string
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          destination?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          created_at?: string
          updated_at?: string | null
          metadata?: Json | null
        }
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
