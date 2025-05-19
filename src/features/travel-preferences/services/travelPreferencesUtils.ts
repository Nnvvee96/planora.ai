/**
 * Travel Preferences Utilities
 * 
 * Additional utility functions for travel preferences that supplement the main service
 * Following Planora's architectural principles of separation of concerns
 */

import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Checks if travel preferences exist for a user
 * A lightweight utility function that doesn't return the full data
 * 
 * @param userId The ID of the user
 * @returns Boolean indicating if travel preferences exist
 */
export const checkTravelPreferencesExist = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('Cannot check travel preferences: No user ID provided');
      return false;
    }
    
    // Use a lightweight count query instead of fetching all data
    // The 'userid' column is snake_case in the actual database schema
    const { count, error } = await supabase
      .from('travelpreferences')
      .select('*', { count: 'exact', head: true })
      // Type-safe approach without using 'any'
      .filter('userid', 'eq', userId)
      
    if (error) {
      console.error('Error checking travel preferences existence:', error.message);
      return false;
    }
    
    return count ? count > 0 : false;
  } catch (error) {
    console.error('Exception checking travel preferences existence:', error);
    return false;
  }
};
