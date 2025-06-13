import { supabase } from '@/database/databaseApi';
import { UserProfile, DbUserProfile, mapDbUserToAppUser } from '@/features/user-profile/userProfileApi';

export const adminService = {
  getAllUsers: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      return [];
    }

    // The data from supabase is DbUserProfile[], so we map it.
    const users: DbUserProfile[] = data;
    return users.map(mapDbUserToAppUser);
  },

  updateBetaTesterStatus: async (userId: string, isBetaTester: boolean): Promise<UserProfile> => {
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
    
    // The single returned record also needs mapping.
    const dbUser: DbUserProfile = data;
    return mapDbUserToAppUser(dbUser);
  },
}; 