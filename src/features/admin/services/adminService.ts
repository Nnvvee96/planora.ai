import { supabase } from '../../../lib/supabaseClient';
import { Profile } from '../../user-profile/types/userProfileTypes';

export const adminService = {
  getAllUsers: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.message);
    }

    return data || [];
  },

  updateBetaTesterStatus: async (userId: string, isBetaTester: boolean): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_beta_tester: isBetaTester })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating beta tester status:', error);
      throw new Error(error.message);
    }

    return data;
  },
}; 