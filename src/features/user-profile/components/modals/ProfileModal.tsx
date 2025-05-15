import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DatePickerInput } from '@/components/ui/DatePickerInput';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase/supabaseClient';

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  birthdate: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userEmail: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  onProfileUpdate?: (data: ProfileFormValues) => void;
}

/**
 * ProfileModal - A component for editing user profile information
 * This modal allows users to update their personal details such as name, email, and birthdate
 */
const ProfileModal: React.FC<ProfileModalProps> = ({ 
  open, 
  onOpenChange, 
  userName, 
  userEmail, 
  firstName, 
  lastName, 
  birthdate,
  onProfileUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  
  // Initialize form with empty values - we'll populate them when the modal opens
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      birthdate: '',
    },
  });
  
  // Fetch user data when the modal opens to ensure we have fresh data
  useEffect(() => {
    const fetchUserData = async () => {
      if (open) {
        setLoading(true);
        try {
          // Get current user data directly from Supabase
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Get Google identity data if available
            const identities = userData.user.identities || [];
            const googleIdentity = identities.find((identity: any) => identity.provider === 'google');
            const googleData = googleIdentity?.identity_data || {};
            
            // Get user metadata
            const metadata = userData.user.user_metadata || {};
            
            // Get profile data from profiles table
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userData.user.id)
              .single();
            
            // Combine all sources with priority: provided props > profile data > metadata > google data
            const combinedFirstName = firstName || profileData?.first_name || metadata.first_name || googleData.given_name || userName.split(' ')[0] || '';
            const combinedLastName = lastName || profileData?.last_name || metadata.last_name || googleData.family_name || userName.split(' ')[1] || '';
            const combinedEmail = userEmail || profileData?.email || userData.user.email || googleData.email || '';
            const combinedBirthdate = birthdate || profileData?.birthdate || metadata.birthdate || '';
            
            // Reset form with combined data
            form.reset({
              firstName: combinedFirstName,
              lastName: combinedLastName,
              email: combinedEmail,
              birthdate: combinedBirthdate,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [open, firstName, lastName, userEmail, birthdate, userName, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          birthdate: data.birthdate,
        }
      });
      
      // Update the profile table (upsert operation)
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        birthdate: data.birthdate,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      // Call the onProfileUpdate callback if provided
      if (onProfileUpdate) {
        onProfileUpdate(data);
      }
      
      // Show success message
      alert('Profile updated successfully!');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nameInitial = userName.charAt(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-planora-accent-purple text-white text-xl">
              {nameInitial}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthday</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <DatePickerInput
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(date ? date.toISOString().split('T')[0] : '');
                        }}
                        placeholder="MM / DD / YYYY"
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="py-2">
              <Label htmlFor="profileImage">Profile Picture</Label>
              <div className="mt-1 flex items-center">
                <Button type="button" variant="outline" className="w-full">
                  Change Picture
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
