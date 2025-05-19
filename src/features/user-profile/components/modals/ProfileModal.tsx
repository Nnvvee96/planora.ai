import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/ui/atoms/Label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DatePickerInput } from '@/components/ui/DatePickerInput';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  birthdate: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Import shared types from the types directory to prevent circular dependencies
import { ProfileModalProps } from '@/features/user-profile/types/profileTypes';

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
          // Get current user through the auth service API
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            // Get profile data through the user profile service
            const profileData = await userProfileService.getUserProfile(currentUser.id);
            
            // Combine all sources with priority: provided props > profile data > current user data
            const combinedFirstName = firstName || profileData?.firstName || currentUser.firstName || userName.split(' ')[0] || '';
            const combinedLastName = lastName || profileData?.lastName || currentUser.lastName || userName.split(' ')[1] || '';
            const combinedEmail = userEmail || profileData?.email || currentUser.email || '';
            const combinedBirthdate = birthdate || '';
            
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
      
      // Get the current user through the auth service
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      
      // Update the user profile through the user profile service
      const profileData = {
        id: currentUser.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        birthdate: data.birthdate,
        updated_at: new Date().toISOString()
      };
      
      // Use the user profile service to update the profile
      const updatedProfile = await userProfileService.updateUserProfile(currentUser.id, profileData);
      
      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }
      
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

export { ProfileModal };
