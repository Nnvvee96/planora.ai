import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getAuthService, AuthService } from "@/features/auth/authApi";
// Properly import from API boundary
import { userProfileService } from "../../services/userProfileService";
import { useUserProfileAuthIntegration } from "../../hooks/useUserProfileAuthIntegration";
import { useToast } from "@/hooks/use-toast";
import { Select } from "@/components/ui/select";
import {
  countryOptions,
  getCityOptions,
} from "@/features/location-data/locationDataApi";
// import { supabase } from '@/lib/supabase/client'; // Removed: Use services instead

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
import { ProfileDialogProps } from "@/features/user-profile/types/profileTypes";

/**
 * ProfileDialog - A component for editing user profile information
 * This dialog allows users to update their personal details such as name, email, and birthdate
 */
const ProfileDialog = ({
  open,
  onOpenChange,
  userName,
  userEmail,
  firstName,
  lastName,
  birthdate,
  onProfileUpdate,
}: ProfileDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // For initial data loading
  const [isSaving, setIsSaving] = useState(false); // For saving changes
  // Initialize auth service using factory function
  const [authService, setAuthService] = useState<AuthService | null>(null);

  // Helper function to format date to YYYY-MM-DD string
  const _formatDateString = (
    date: Date | string | undefined | null,
  ): string => {
    if (!date) return "";
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
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
      firstName: "",
      lastName: "",
      email: "",
      birthdate: "",
      country: "",
      city: "",
      customCity: "",
    },
  });

  const [cityOptions, setCityOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);
  const hasLoadedData = useRef(false); // Track if we've loaded data to prevent loops

  const userProfileIntegration = useUserProfileAuthIntegration();

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      // Only load data if dialog is open and we haven't loaded it yet
      if (!open || !authService || hasLoadedData.current) {
        return;
      }

      hasLoadedData.current = true; // Prevent multiple loads
      setIsLoading(true);

      try {
        const currentUser = await authService.getCurrentUser();

        if (currentUser && isMounted) {
          console.log(
            "ProfileDialog: Loading profile for user:",
            currentUser.id,
          );

          // Get the most recent data from the database via service
          let dbProfile = null;
          try {
            dbProfile = await userProfileService.getUserProfile(currentUser.id);
          } catch (error) {
            console.error("ProfileDialog: Database error:", error);
          }

          // Prepare form data with fallbacks
          const formData = {
            firstName:
              dbProfile?.first_name || currentUser.firstName || firstName || "",
            lastName:
              dbProfile?.last_name || currentUser.lastName || lastName || "",
            email: dbProfile?.email || currentUser.email || userEmail || "",
            birthdate: dbProfile?.birthdate || birthdate || "",
            country: dbProfile?.country || "",
            city: dbProfile?.city || "",
            customCity: dbProfile?.custom_city || "",
          };

          if (import.meta.env.DEV) {
            console.log("ProfileDialog: Form data prepared:", formData);
          }
          form.reset(formData);

          // Set up city options if country is selected
          if (formData.country) {
            try {
              setCityOptions(getCityOptions(formData.country));

              if (formData.city === "Other" && formData.customCity) {
                setShowCustomCityInput(true);
              }
            } catch (cityError) {
              console.warn(
                "ProfileDialog: Error setting city options:",
                cityError,
              );
              setCityOptions([]);
            }
          }
        }
      } catch (error) {
        console.error("ProfileDialog: Error loading user data:", error);

        // Use fallback data from props
        const fallbackData = {
          firstName: firstName || "",
          lastName: lastName || "",
          email: userEmail || "",
          birthdate: birthdate || "",
          country: "",
          city: "",
          customCity: "",
        };

        if (import.meta.env.DEV) {
          console.log("ProfileDialog: Using fallback data:", fallbackData);
        }
        form.reset(fallbackData);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [open, authService, birthdate, firstName, lastName, userEmail, form]); // Include all dependencies

  // Reset hasLoadedData when dialog closes
  useEffect(() => {
    if (!open) {
      hasLoadedData.current = false;
    }
  }, [open]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!authService) {
      console.error("Auth service not initialized");
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = await authService.getCurrentUser();

      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      const profileUpdateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate,
        country: data.country || null,
        city:
          data.city === "Other" && data.customCity
            ? "Other"
            : data.city || null,
        customCity: data.city === "Other" ? data.customCity : null,
      };

      const _effectiveCity =
        data.city === "Other" && data.customCity ? data.customCity : data.city;

      const isEmailChanged =
        currentUser.email.toLowerCase() !== data.email.toLowerCase();

      const profileUpdated = await userProfileService.updateUserProfile(
        currentUser.id,
        profileUpdateData,
      );

      if (!profileUpdated) {
        throw new Error("Failed to update profile");
      }

      if (isEmailChanged) {
        try {
          const emailChangeResult =
            await userProfileIntegration.handleEmailChangeRequest(
              currentUser.id,
              data.email,
            );

          if (emailChangeResult.success) {
            toast({
              title: "Profile Updated",
              description:
                emailChangeResult.message ||
                "Your profile has been updated. A verification email has been sent to your new email address.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Email Update Failed",
              description:
                emailChangeResult.message ||
                "Could not update email address. Your other profile changes were saved.",
            });
          }
        } catch (emailError) {
          console.error("Error updating email:", emailError);

          toast({
            variant: "destructive",
            title: "Email Update Failed",
            description:
              emailError instanceof Error
                ? emailError.message
                : "Could not update email address. Your other profile changes were saved.",
          });
        }
      } else {
        toast({
          title: "Profile Updated",
          description:
            "Your profile information has been successfully updated.",
        });
      }

      // Update auth user metadata for name changes
      try {
        await authService.updateUserMetadata({
          first_name: data.firstName,
          last_name: data.lastName,
        });
      } catch (authError) {
        console.warn("Failed to update auth user metadata:", authError);
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
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nameInitial = userName ? userName.charAt(0) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-white/70 text-base">
            Update your profile information below
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur"></div>
            <Avatar className="h-24 w-24 relative border-2 border-white/20">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                {nameInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-white/80">
              Loading profile data...
            </span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-semibold">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                        />
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
                      <FormLabel className="text-white/90 font-semibold">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                      />
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
                    <FormLabel className="text-white/90 font-semibold">Birthdate</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <DatePickerInput
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => {
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : "",
                            );
                          }}
                          placeholder="MM / DD / YYYY"
                          className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-semibold">Country</FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset city when country changes
                            form.setValue("city", "");
                            form.setValue("customCity", "");
                            setShowCustomCityInput(false);
                            // Update city options
                            setCityOptions(getCityOptions(value));
                          }}
                          placeholder="Select your country"
                          className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white rounded-xl"
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
                      <FormLabel className="text-white/90 font-semibold">City</FormLabel>
                      <FormControl>
                        <Select
                          options={cityOptions}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Show custom city input if 'Other' is selected
                            setShowCustomCityInput(value === "Other");
                            if (value !== "Other") {
                              form.setValue("customCity", "");
                            }
                          }}
                          placeholder="Select your city"
                          className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showCustomCityInput && (
                <FormField
                  control={form.control}
                  name="customCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-semibold">Specify City</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your city" 
                          className="bg-black/40 border-white/20 focus:border-purple-400/50 focus:ring-purple-400/20 text-white placeholder:text-white/50 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="pt-6 flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                  className="border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all duration-300 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl font-semibold transition-all duration-300"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ProfileDialog };
