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
import { getAuthService, AuthService } from '@/features/auth/authApi';
// Properly import from API boundary
import { userProfileService } from '@/features/user-profile/userProfileApi';
import { useUserProfileIntegration } from '@/features/user-profile/hooks/useUserProfileIntegration';
import { useToast } from '@/components/ui/use-toast';
import { Select } from '@/components/ui/select';
import { countryOptions, getCityOptions } from '@/features/location-data/data/countryCityData';

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  birthdate: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  customCity: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Import shared types from the types directory to prevent circular dependencies
import { ProfileDialogProps } from '@/features/user-profile/types/profileTypes';

/**
 * ProfileDialog - A component for editing user profile information
 * This dialog allows users to update their personal details such as name, email, and birthdate
 */
const ProfileDialog: React.FC<ProfileDialogProps> = ({ 
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
      country: '',
      city: '',
      customCity: '',
    },
  });
  
  const [cityOptions, setCityOptions] = useState<Array<{value: string, label: string}>>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);
  
  const userProfileIntegration = useUserProfileIntegration();

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      if (open && authService) {
        setLoading(true);
        try {
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser && isMounted) {
            const userData = await userProfileIntegration.getUserWithProfile(currentUser.id);
            
            if (!userData) {
              throw new Error('Failed to load user profile data');
            }
            
            const formData = {
              firstName: userData.firstName || firstName || '',
              lastName: userData.lastName || lastName || '',
              email: userData.email || userEmail || '',
              birthdate: userData.birthdate || birthdate || '',
              country: userData.country || '',
              city: userData.city || '',
              customCity: userData.customCity || '',
            };
            
            form.reset(formData);
            
            if (formData.country) {
              setCityOptions(getCityOptions(formData.country));
              
              if (formData.city === 'Other' && formData.customCity) {
                setShowCustomCityInput(true);
              }
            }
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load profile data. Please try again.",
          });
          
          form.reset({
            firstName: firstName || '',
            lastName: lastName || '',
            email: userEmail || '',
            birthdate: birthdate || '',
            country: '',
            city: '',
            customCity: '',
          });
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
  }, [open, authService, form, firstName, lastName, userEmail, birthdate, toast, userProfileIntegration]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!authService) {
      console.error('Auth service not initialized');
      return;
    }
    
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const profileUpdateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate,
        country: data.country || null,
        city: data.city === 'Other' && data.customCity ? 'Other' : data.city || null,
        customCity: data.city === 'Other' ? data.customCity : null,
      };
      
      const effectiveCity = data.city === 'Other' && data.customCity ? data.customCity : data.city;
      
      const isEmailChanged = currentUser.email.toLowerCase() !== data.email.toLowerCase();
      
      const profileUpdated = await userProfileService.updateUserProfile(currentUser.id, profileUpdateData);
      
      if (!profileUpdated) {
        throw new Error('Failed to update profile');
      }
      
      if (isEmailChanged) {
        try {
          const emailChangeResult = await userProfileIntegration.handleEmailChangeRequest(
            currentUser.id,
            data.email
          );
          
          if (emailChangeResult.success) {
            toast({
              title: "Profile Updated",
              description: emailChangeResult.message || "Your profile has been updated. A verification email has been sent to your new email address.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Email Update Failed",
              description: emailChangeResult.message || "Could not update email address. Your other profile changes were saved.",
            });
          }
        } catch (emailError) {
          console.error('Error updating email:', emailError);
          
          toast({
            variant: "destructive",
            title: "Email Update Failed",
            description: emailError instanceof Error ? emailError.message : "Could not update email address. Your other profile changes were saved.",
          });
        }
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
        });
      }
      
      // Update auth user metadata for name changes
      try {
        await authService.updateUserMetadata({
          first_name: data.firstName,
          last_name: data.lastName
        });
      } catch (authError) {
        console.warn('Failed to update auth user metadata:', authError);
        // Non-critical error, continue
      }
      
      // Call the callback if provided
      if (onProfileUpdate) {
        onProfileUpdate({
          ...profileUpdateData,
          email: currentUser.email, // Use current email since new one requires verification
        });
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred while updating your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const nameInitial = userName ? userName.charAt(0) : '';

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
                  <FormLabel>Birthdate</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <DatePickerInput
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          field.onChange(date ? date.toISOString().split('T')[0] : '');
                        }}
                        placeholder="MM / DD / YYYY"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select
                      options={countryOptions}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset city when country changes
                        form.setValue('city', '');
                        form.setValue('customCity', '');
                        setShowCustomCityInput(false);
                        // Update city options
                        setCityOptions(getCityOptions(value));
                      }}
                      placeholder="Select your country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Select
                      options={cityOptions}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Show custom city input if 'Other' is selected
                        setShowCustomCityInput(value === 'Other');
                        if (value !== 'Other') {
                          form.setValue('customCity', '');
                        }
                      }}
                      placeholder="Select your city"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showCustomCityInput && (
              <FormField
                control={form.control}
                name="customCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

export { ProfileDialog };
