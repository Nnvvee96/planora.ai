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
import { getAuthService, AuthService } from '@/features/auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // Initialize auth service using factory function
  const [authService, setAuthService] = useState<AuthService | null>(null);
  
  // Helper function to format date to YYYY-MM-DD string
  const formatDateString = (date: Date | string | undefined | null): string => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };
  
  // Load auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, []);
  
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
    let isMounted = true;
    
    const fetchUserData = async () => {
      if (open && authService) {
        setLoading(true);
        try {
          // Get current user through the auth service API
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser && isMounted) {
            console.log('Current user from auth:', currentUser);
            
            // Get profile data through the user profile service
            const profileData = await userProfileService.getUserProfile(currentUser.id);
            console.log('Profile data from service:', profileData);
            
            // Format birthdate if it exists from any source
            const birthdateFromProfile = profileData?.birthdate || birthdate;
            const formattedBirthdate = formatDateString(birthdateFromProfile);
            
            // Combine all sources with priority: provided props > profile data > current user data
            const combinedData = {
              firstName: firstName || profileData?.firstName || currentUser.firstName || 
                        (userName ? userName.split(' ')[0] : '') || '',
              lastName: lastName || profileData?.lastName || currentUser.lastName || 
                       (userName ? userName.split(' ').slice(1).join(' ') : '') || '',
              email: userEmail || profileData?.email || currentUser.email || '',
              birthdate: formattedBirthdate
            };
            
            console.log('Setting form data:', combinedData);
            
            // Reset form with combined data
            if (isMounted) {
              form.reset(combinedData);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (isMounted) {
            toast({
              title: 'Error',
              description: 'Failed to load profile data. Please try again.',
              variant: 'destructive',
            });
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    
    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [open, firstName, lastName, userEmail, birthdate, userName, form, authService, toast]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      
      // Get the current user through the auth service
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      
      // Debug log the form data
      console.log('Form data being submitted:', JSON.stringify(data, null, 2));
      console.log('Birthdate value type:', typeof data.birthdate, 'Value:', data.birthdate);
      
      // Log the data being sent to updateUserProfile
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        birthdate: data.birthdate || undefined,
      };
      
      console.log('Data being sent to updateUserProfile:', JSON.stringify(updateData, null, 2));
      
      // Update the user profile through the user profile service
      const updated = await userProfileService.updateUserProfile(currentUser.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        birthdate: data.birthdate || undefined,
      });
      
      if (!updated) {
        throw new Error('Failed to update profile in the database');
      }
      
      // Update auth user metadata if email changed
      if (data.email && data.email !== currentUser.email) {
        try {
          await authService.updateUserMetadata({
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName
          });
        } catch (authError) {
          console.warn('Failed to update auth user metadata:', authError);
          // Non-critical error, continue
        }
      }
      
      // Call the onProfileUpdate callback if provided
      if (onProfileUpdate) {
        onProfileUpdate({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          birthdate: data.birthdate
        });
      }
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      
      // Close the modal
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
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
