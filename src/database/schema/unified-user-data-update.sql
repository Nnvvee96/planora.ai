-- Unified user data update stored procedure
-- Add this to the existing supabase-database-setup.sql file

-- This stored procedure provides a centralized way to update user data across multiple tables
-- It follows Planora's architectural principles by reducing redundancy and centralizing logic
CREATE OR REPLACE FUNCTION update_user_data_unified(
  p_user_id UUID,
  p_profile_data JSONB DEFAULT NULL,
  p_user_metadata JSONB DEFAULT NULL,
  p_travel_preferences JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_profile_updated BOOLEAN := FALSE;
  v_metadata_updated BOOLEAN := FALSE;
  v_preferences_updated BOOLEAN := FALSE;
BEGIN
  -- Update profile if data provided
  IF p_profile_data IS NOT NULL AND p_profile_data != '{}' THEN
    UPDATE public.profiles
    SET
      first_name = COALESCE(p_profile_data->>'firstName', first_name),
      last_name = COALESCE(p_profile_data->>'lastName', last_name),
      email = COALESCE(p_profile_data->>'email', email),
      avatar_url = COALESCE(p_profile_data->>'avatarUrl', avatar_url),
      birthdate = CASE WHEN p_profile_data->>'birthdate' IS NOT NULL 
                      THEN (p_profile_data->>'birthdate')::DATE 
                      ELSE birthdate END,
      has_completed_onboarding = CASE WHEN p_profile_data->>'hasCompletedOnboarding' IS NOT NULL 
                                     THEN (p_profile_data->>'hasCompletedOnboarding')::BOOLEAN 
                                     ELSE has_completed_onboarding END,
      email_verified = CASE WHEN p_profile_data->>'emailVerified' IS NOT NULL 
                           THEN (p_profile_data->>'emailVerified')::BOOLEAN 
                           ELSE email_verified END,
      updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Check if update was successful
    IF FOUND THEN
      v_profile_updated := TRUE;
    END IF;
  END IF;
  
  -- Update travel preferences if data provided
  -- This handles the travel preferences table but doesn't use the Supabase auth.update_user API
  -- which would be needed for true metadata updates
  IF p_travel_preferences IS NOT NULL AND p_travel_preferences != '{}' THEN
    -- Using upsert pattern (insert or update)
    INSERT INTO public.travel_preferences (
      user_id,
      trip_duration_min,
      trip_duration_max,
      budget_range_min,
      budget_range_max,
      travel_style,
      activity_level,
      accommodation_type,
      destination_type,
      custom_date_flexibility
    ) VALUES (
      p_user_id,
      (p_travel_preferences->>'tripDurationMin')::INTEGER,
      (p_travel_preferences->>'tripDurationMax')::INTEGER,
      (p_travel_preferences->>'budgetRangeMin')::INTEGER,
      (p_travel_preferences->>'budgetRangeMax')::INTEGER,
      p_travel_preferences->>'travelStyle',
      p_travel_preferences->>'activityLevel',
      p_travel_preferences->>'accommodationType',
      p_travel_preferences->>'destinationType',
      p_travel_preferences->>'customDateFlexibility'
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      trip_duration_min = EXCLUDED.trip_duration_min,
      trip_duration_max = EXCLUDED.trip_duration_max,
      budget_range_min = EXCLUDED.budget_range_min,
      budget_range_max = EXCLUDED.budget_range_max,
      travel_style = EXCLUDED.travel_style,
      activity_level = EXCLUDED.activity_level,
      accommodation_type = EXCLUDED.accommodation_type,
      destination_type = EXCLUDED.destination_type,
      custom_date_flexibility = EXCLUDED.custom_date_flexibility,
      updated_at = NOW();
      
    -- Check if update was successful
    IF FOUND THEN
      v_preferences_updated := TRUE;
    END IF;
  END IF;

  -- Note: User metadata updates would require the auth.update_user() function
  -- which requires admin privileges. This would typically be handled by a
  -- server-side function or Supabase Edge Function
  
  -- Build result object
  v_result := jsonb_build_object(
    'profile_updated', v_profile_updated,
    'metadata_updated', v_metadata_updated,
    'preferences_updated', v_preferences_updated
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to the function
COMMENT ON FUNCTION update_user_data_unified IS 'Unified function to update user data across multiple tables';
