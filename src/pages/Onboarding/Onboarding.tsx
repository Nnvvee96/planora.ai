import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/ui/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/atoms/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/ui/atoms/Input";
import { Logo } from "@/ui/atoms/Logo";
import { useForm } from "react-hook-form";
import { GradientButton } from "@/ui/atoms/GradientButton";
import {
  Plane,
  Hotel,
  Building,
  Tent,
  Palmtree,
  Clock,
  Map,
  Compass,
  Check,
  MapPin,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import {
  saveTravelPreferences,
  updateOnboardingStatus,
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType,
} from "@/features/travel-preferences/travelPreferencesApi";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/features/auth/authApi";
// Import location data for country-city selection
import {
  countryOptions,
  getCityOptions,
  isCustomCityNeeded,
  CityOption,
} from "@/features/location-data/locationDataApi";
// Import feature APIs following architectural principles
import { userProfileService } from "@/features/user-profile/userProfileApi";
import { travelPreferencesService } from "@/features/travel-preferences/travelPreferencesApi";
// import { supabase } from '@/lib/supabase/client'; // Use services instead

// Import step components
import { BudgetRangeStep } from "./components/steps/BudgetRangeStep";
import { BudgetToleranceStep } from "./components/steps/BudgetToleranceStep";
import { TravelDurationStep } from "./components/steps/TravelDurationStep";

// Raw Supabase user interface for direct metadata access
interface SupabaseRawUser {
  id: string;
  email?: string;
  user_metadata?: {
    has_completed_onboarding?: boolean;
    country?: string;
    city?: string;
    customCity?: string;
    [key: string]: unknown;
  };
}

interface OnboardingFormData {
  departureCountry: string;
  departureCity: string;
  customDepartureCity?: string;
  budgetRange: { min: number; max: number };
  budgetTolerance: number;
  travelDuration: string;
  dateFlexibility: string | null;
  customDateFlexibility?: string;
  planningIntent: string;
  accommodationTypes: string[];
  accommodationComfort: string[];
  locationPreference: string;
  flightType: string;
  preferCheaperWithStopover: boolean;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Use the auth hook directly instead of managing authService state
  // Get auth data from the useAuth hook
  // Note: The user from useAuth might be a raw Supabase user with user_metadata
  const { user, loading: _authLoading, authService } = useAuth();

  const isModifyingPreferences = location.state?.fromDashboard === true;
  const [step, setStep] = useState(0);
  const [_loading, setLoading] = useState(false);

  // State for city selection
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);

  const form = useForm<OnboardingFormData>({
    defaultValues: {
      departureCountry: "", // Will be filled from user metadata if available
      departureCity: "", // Will be filled from user metadata if available
      customDepartureCity: "",
      budgetRange: { min: 1000, max: 2000 },
      budgetTolerance: 10,
      travelDuration: "week", // Set a default value to avoid validation errors
      dateFlexibility: "flexible-few",
      customDateFlexibility: "",
      planningIntent: "exploring", // Set a default value to avoid validation errors
      accommodationTypes: ["hotel"], // Set a default value to avoid validation errors
      accommodationComfort: ["private-room", "private-bathroom"], // Pre-select common comfort preferences
      locationPreference: "anywhere",
      flightType: "direct",
      preferCheaperWithStopover: true,
    },
  });

  // Watch country to update city options
  const selectedCountry = form.watch("departureCountry");
  const selectedCity = form.watch("departureCity");

  // Update city options when country changes
  useEffect(() => {
    if (selectedCountry) {
      const options = getCityOptions(selectedCountry);
      setCityOptions(options);

      // Reset city selection when country changes
      if (form.getValues("departureCity")) {
        // Only reset if we already had a value and it's not in the new options
        const currentCity = form.getValues("departureCity");
        const cityExists = options.some(
          (option) => option.value === currentCity,
        );
        if (!cityExists) {
          form.setValue("departureCity", "");
          form.setValue("customDepartureCity", "");
        }
      }
      setShowCustomCityInput(
        isCustomCityNeeded(form.getValues("departureCity")),
      );
    }
  }, [selectedCountry, form]);

  // Show custom city input when "Other" is selected
  useEffect(() => {
    if (selectedCity) {
      setShowCustomCityInput(isCustomCityNeeded(selectedCity));
      if (!isCustomCityNeeded(selectedCity)) {
        form.setValue("customDepartureCity", "");
      }
    }
  }, [selectedCity, form]);

  const totalSteps = 7;

  // Watch the travel duration and date flexibility to manage their relationship
  const [travelDuration, dateFlexibility] = form.watch([
    "travelDuration",
    "dateFlexibility",
  ]);

  // Effect to handle the relationship between travel duration and date flexibility
  useEffect(() => {
    if (travelDuration === "longer") {
      // Clear date flexibility when 'longer' is selected
      form.setValue("dateFlexibility", null);
      form.setValue("customDateFlexibility", "");
    } else if (!dateFlexibility || dateFlexibility === "") {
      // Set default date flexibility if not set
      form.setValue("dateFlexibility", "flexible-few");
    }
  }, [travelDuration, dateFlexibility, form]);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Use user directly from useAuth hook instead of calling getCurrentUser
        if (user) {
          // Use auth service to get current user
          const userData = await authService.getCurrentUser();

          if (!userData) {
            console.error("Error fetching user data");
            return;
          }

          // Access user metadata safely with null checks
          let userCountry = "";
          let userCity = "";
          let userCustomCity = "";

          try {
            // Try to access metadata from different possible locations
            const rawUser = user as unknown as SupabaseRawUser;
            const userMetadata = rawUser?.user_metadata || {};

            // Safely extract values with type checking
            userCountry =
              typeof userMetadata.country === "string"
                ? userMetadata.country
                : "";
            userCity =
              typeof userMetadata.city === "string" ? userMetadata.city : "";
            userCustomCity =
              typeof userMetadata.customCity === "string"
                ? userMetadata.customCity
                : "";
          } catch (metadataError) {
            console.warn("Could not access user metadata:", metadataError);
            // Continue with empty values - this is not a critical error
          }

          // Set form values for country and city
          if (typeof userCountry === "string") {
            form.setValue("departureCountry", userCountry);
          }

          if (typeof userCity === "string") {
            form.setValue("departureCity", userCity);
            // Check if we need to show custom city input
            if (
              typeof userCity === "string" &&
              isCustomCityNeeded(userCity) &&
              typeof userCustomCity === "string"
            ) {
              form.setValue("customDepartureCity", userCustomCity);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [form, user, authService]); // Updated dependency to include authService

  const validateCurrentStep = () => {
    // Step 1: Budget range (no validation needed)
    if (step === 0) {
      return true; // Budget range step has no validation
    }
    // Step 2: Budget tolerance (no validation needed)
    else if (step === 1) {
      return true; // Budget tolerance step has no validation
    }
    // Step 3: Travel duration and date flexibility
    else if (step === 2) {
      const travelDuration = form.getValues("travelDuration");
      if (!travelDuration) {
        toast({
          title: "Validation Error",
          description: "Please select a travel duration",
          variant: "destructive",
        });
        return false;
      }
    }
    // The next step checks for planning intent validation
    else if (step === 3) {
      // Planning intent validation
      const planningIntent = form.getValues("planningIntent");
      if (!planningIntent) {
        toast({
          title: "Validation Error",
          description: "Please select a travel purpose",
          variant: "destructive",
        });
        return false;
      }
    } else if (step === 4) {
      // Accommodation validation
      const accommodationTypes = form.getValues("accommodationTypes");
      if (!accommodationTypes.length) {
        toast({
          title: "Validation Error",
          description: "Please select at least one accommodation type",
          variant: "destructive",
        });
        return false;
      }
    } else if (step === 6) {
      // Last step (Departure Location)
      const departureCountry = form.getValues("departureCountry");
      const departureCity = form.getValues("departureCity");
      const customDepartureCity = form.getValues("customDepartureCity");

      if (!departureCountry) {
        toast({
          title: "Validation Error",
          description: "Please select a departure country",
          variant: "destructive",
        });
        return false;
      }

      if (!departureCity) {
        toast({
          title: "Validation Error",
          description: "Please select a departure city",
          variant: "destructive",
        });
        return false;
      }

      // If custom city is needed but not provided
      if (isCustomCityNeeded(departureCity) && !customDepartureCity) {
        toast({
          title: "Validation Error",
          description: "Please enter your custom city name",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const goToNextStep = async () => {
    // Validate current step first
    if (!validateCurrentStep()) {
      return;
    }

    // If we're on the last step, complete onboarding
    if (step === totalSteps - 1) {
      await handleCompleteOnboarding();
    } else {
      // Move to next step
      setStep(step + 1);
    }
  };

  // Complete onboarding and save preferences
  const handleCompleteOnboarding = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      setLoading(true);

      // Get current user from the useAuth hook
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Use user from useAuth hook directly
      const currentUser = user;

      // Get form data and ensure correct types
      const formData = form.getValues();
              if (import.meta.env.DEV) {
          console.log("Raw form data:", formData);
        }

      // Check if budgetRange is properly formatted as an object
      const budgetRangeData =
        typeof formData.budgetRange === "object"
          ? {
              min: Number(formData.budgetRange.min || 500),
              max: Number(formData.budgetRange.max || 2000),
            }
          : { min: 500, max: 2000 };

      // First, we need to ensure the session is still valid
      // Explicitly refresh the session before any operations
      // Check session using auth service
      await authService.refreshSession();

      // STEP 1: Get profile data BEFORE updating anything (to preserve name fields)
      let existingFirstName = "";
      let existingLastName = "";

      try {
        // Get profile using user profile service
        const profileData = await userProfileService.getUserProfile(
          currentUser.id,
        );

        if (profileData) {
          existingFirstName = profileData.firstName || "";
          existingLastName = profileData.lastName || "";
          if (import.meta.env.DEV) {
            console.log("Retrieved existing profile data:", {
              existingFirstName,
              existingLastName,
            });
          }
        }
      } catch (profileFetchError) {
        console.warn(
          "Could not fetch existing profile data:",
          profileFetchError,
        );
      }

      // STEP 2: Save travel preferences to the database first
              if (import.meta.env.DEV) {
          console.log(
            "🚀 DIRECT DB PATH: Saving travel preferences directly to database",
          );
          console.log("User ID:", currentUser.id);
        }

      // Ensure we have the latest session before proceeding
      await authService.refreshSession();

      // Prepare travel preferences data
      // Format departure location with both country and city
      let departureCity = formData.departureCity;
      // If it's a custom city entry, use that instead
      if (
        isCustomCityNeeded(formData.departureCity) &&
        formData.customDepartureCity
      ) {
        departureCity = formData.customDepartureCity;
      }

      const prefData = {
        user_id: currentUser.id,
        budget_min: budgetRangeData.min,
        budget_max: budgetRangeData.max,
        budget_flexibility: Number(formData.budgetTolerance || 10),
        travel_duration: formData.travelDuration || "week",
        date_flexibility: formData.dateFlexibility || "flexible-few",
        custom_date_flexibility: formData.customDateFlexibility || "",
        planning_intent: formData.planningIntent || "exploring",
        accommodation_types: formData.accommodationTypes || ["hotel"],
        accommodation_comfort: formData.accommodationComfort || [
          "private-room",
        ],
        location_preference: formData.locationPreference || "center",
        flight_type: formData.flightType || "direct",
        prefer_cheaper_with_stopover: Boolean(
          formData.preferCheaperWithStopover,
        ),
        departure_country: formData.departureCountry || "",
        departure_city: departureCity || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

              if (import.meta.env.DEV) {
          console.log("Travel preferences data for insertion:", prefData);
        }

      // First check if preferences already exist using travel preferences service
      const existingPrefs =
        await travelPreferencesService.getUserTravelPreferences(currentUser.id);

      if (import.meta.env.DEV) {
        console.log(
          "Existing preferences check:",
          existingPrefs ? "Found" : "Not found",
        );
      }

      // Format data for the travel preferences service
      const travelPreferencesData = {
        budgetRange: budgetRangeData,
        budgetFlexibility: Number(formData.budgetTolerance || 10),
        travelDuration: (formData.travelDuration ||
          "week") as TravelDurationType,
        dateFlexibility: (formData.dateFlexibility ||
          "flexible-few") as DateFlexibilityType,
        customDateFlexibility: formData.customDateFlexibility || "",
        planningIntent: (formData.planningIntent ||
          "exploring") as PlanningIntent,
        accommodationTypes: (formData.accommodationTypes || [
          "hotel",
        ]) as AccommodationType[],
        accommodationComfort: (formData.accommodationComfort || [
          "private-room",
        ]) as ComfortPreference[],
        locationPreference: (formData.locationPreference ||
          "center") as LocationPreference,
        flightType: (formData.flightType || "direct") as FlightType,
        preferCheaperWithStopover: Boolean(formData.preferCheaperWithStopover),
        departureCity: departureCity || "",
        departureCountry: formData.departureCountry || "",
      };

      // Save travel preferences using the proper service API
      const saveResult = await saveTravelPreferences(
        currentUser.id,
        travelPreferencesData,
      );

      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) {
          console.log("Travel preferences save result:", saveResult);
        }
      }

      if (!saveResult) {
        console.error("Error saving travel preferences");
        // Continue with other approaches - don't throw yet
      }

      // STEP 3: Update profiles table to mark onboarding as completed
      // IMPORTANT: Preserve existing first_name and last_name values!
      try {
        if (import.meta.env.DEV) {
          if (import.meta.env.DEV) {
          console.log("Updating profiles table directly...");
        }
        }

        // Prepare profile update data with preference for existing values
        // following Planora's API model conventions with camelCase fields
        const firstName = existingFirstName || currentUser.firstName || "";
        const lastName = existingLastName || currentUser.lastName || "";

        // CRITICAL FIX: Also save the departure location to profiles table
        let finalDepartureCity = formData.departureCity;
        if (
          isCustomCityNeeded(formData.departureCity) &&
          formData.customDepartureCity
        ) {
          finalDepartureCity = formData.customDepartureCity;
        }

        const profileUpdateData = {
          hasCompletedOnboarding: true,
          firstName: firstName,
          lastName: lastName,
          onboardingDepartureCountry: formData.departureCountry || "",
          onboardingDepartureCity: finalDepartureCity || "",
        };

        if (import.meta.env.DEV) {
          if (import.meta.env.DEV) {
          console.log("Profile update data:", profileUpdateData);
        }
        }

        const profileUpdate = await userProfileService.updateUserProfile(
          currentUser.id,
          profileUpdateData,
        );

        if (import.meta.env.DEV) {
          console.log("Profile update result:", profileUpdate);
        }

        if (!profileUpdate) {
          console.error("Profile update failed");
        }
      } catch (profileError) {
        console.error("Failed to update profile directly:", profileError);
      }

      // We already saved the travel preferences via the proper service API above
      // This duplicate step is removed following architectural principles

      // STEP 6: Update local storage BEFORE updating metadata (which triggers auth state change)
      localStorage.setItem("hasCompletedOnboarding", "true");
      localStorage.setItem("departureCountry", formData.departureCountry || "");
      localStorage.setItem("departureCity", departureCity || "");
      if (
        isCustomCityNeeded(formData.departureCity) &&
        formData.customDepartureCity
      ) {
        localStorage.setItem(
          "customDepartureCity",
          formData.customDepartureCity,
        );
      }
      localStorage.setItem(
        "userTravelPreferences",
        JSON.stringify(travelPreferencesData),
      );

      // STEP 7: Call the official onboarding status update function
      // This function already handles multiple sources (profile table, metadata, etc.)
      try {
        if (import.meta.env.DEV) {
          console.log("Updating onboarding status via official API...");
        }
        await updateOnboardingStatus(currentUser.id, true);
      } catch (onboardingError) {
        console.error(
          "Failed to update onboarding status via API:",
          onboardingError,
        );
      }

      // STEP 8: Update user metadata in Supabase Auth
      try {
        // STEP 4: Update user metadata to mark onboarding as complete
        // Include country and city in the metadata for profile display
        if (import.meta.env.DEV) {
          console.log("Updating user metadata with onboarding status");
        }

        // Format departure location with both country and city
        let departureCity = formData.departureCity;
        // If it's a custom city entry, use that instead
        if (
          isCustomCityNeeded(formData.departureCity) &&
          formData.customDepartureCity
        ) {
          departureCity = formData.customDepartureCity;
        }

        await authService.updateUserMetadata({
          has_completed_onboarding: true,
          country: formData.departureCountry || "",
          city: departureCity || "",
          customCity: isCustomCityNeeded(formData.departureCity)
            ? formData.customDepartureCity
            : "",
          planning_intent: formData.planningIntent || "exploring",
          location_preference: formData.locationPreference || "center",
          flight_type: formData.flightType || "direct",
          prefer_cheaper_with_stopover: Boolean(
            formData.preferCheaperWithStopover,
          ),
          departure_country: formData.departureCountry || "",
          departure_city: isCustomCityNeeded(formData.departureCity)
            ? formData.customDepartureCity
            : formData.departureCity || "",
        });
      } catch (metadataError) {
        console.error("Failed to update user metadata:", metadataError);
      }

      // STEP 9: Show success message and navigate to dashboard
      toast({
        title: "Preferences Saved",
        description: "Your travel preferences have been saved successfully",
      });

      // IMPORTANT: Before navigating, force refresh the session one final time
      // This ensures the session is fully updated with all metadata changes
      try {
        await authService.refreshSession();
        if (import.meta.env.DEV) {
          console.log("Session refreshed, redirecting to dashboard...");
        }

        // Navigate to dashboard with session intact
        navigate("/dashboard", { replace: true });
      } catch (navigationError) {
        console.error("Error during final navigation:", navigationError);
        // Fallback navigation
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while saving your preferences";
      toast({
        title: "Onboarding Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Helper component for multi-select options
  const OptionItem = ({
    icon: Icon,
    label,
    value,
    field,
    onChange,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    field: string[];
    onChange: (value: string) => void;
  }) => {
    const isSelected = field.includes(value);

    return (
      <div
        className={`flex flex-col items-center p-4 rounded-lg border ${
          isSelected
            ? "border-planora-accent-purple bg-planora-accent-purple/20"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        } cursor-pointer transition-all`}
        onClick={() => onChange(value)}
      >
        <Icon
          className={`h-8 w-8 mb-2 ${isSelected ? "text-planora-accent-purple" : "text-white/70"}`}
        />
        <span
          className={`text-sm ${isSelected ? "text-white" : "text-white/70"}`}
        >
          {label}
        </span>
        {isSelected && (
          <Check className="h-4 w-4 text-planora-accent-purple mt-2" />
        )}
      </div>
    );
  };

  // Helper function to toggle selections in arrays
  const toggleSelection = (field: string[], value: string): string[] => {
    if (field.includes(value)) {
      return field.filter((item) => item !== value);
    } else {
      return [...field, value];
    }
  };

  const formatBudgetRange = (min: number, max: number) => `€${min} - €${max}`;
  const formatBudgetTolerance = (value: number) => `±${value}%`;

  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col items-center justify-center p-4 relative">
      {/* Close button when modifying preferences */}
      {isModifyingPreferences && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          onClick={() => navigate("/dashboard")}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>
      )}
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-planora-accent-blue/10 via-background to-background"></div>

      {/* Logo */}
      <div className="mb-6 z-10">
        <Logo />
      </div>

      <Card className="w-full max-w-2xl z-10 bg-card/50 backdrop-blur-lg border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Travel Profile
          </CardTitle>
          <CardDescription className="text-center text-white/60">
            Help us personalize your experience
          </CardDescription>

          {/* Progress bar */}
          <div className="mt-4 flex justify-between items-center">
            <Progress
              value={((step + 1) / totalSteps) * 100}
              className="h-2 w-full bg-white/10"
            />
            <span className="ml-4 text-sm text-white/60">
              {step + 1}/{totalSteps}
            </span>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: Budget Range Selection */}
              {step === 0 && (
                <BudgetRangeStep 
                  control={form.control} 
                  formatBudgetRange={formatBudgetRange} 
                />
              )}

              {/* Step 2: Budget Tolerance */}
              {step === 1 && (
                <BudgetToleranceStep 
                  control={form.control} 
                  formatBudgetTolerance={formatBudgetTolerance} 
                />
              )}

              {/* Step 3: Travel Duration & Date Flexibility */}
              {step === 2 && (
                <TravelDurationStep 
                  control={form.control}
                  setValue={form.setValue}
                  travelDuration={travelDuration}
                  dateFlexibility={dateFlexibility}
                  Label={Label}
                />
              )}

              {/* Step 4: Planning Intent */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Are you dreaming or planning?
                  </h3>
                  <p className="text-sm text-white/60">
                    This helps us tailor our recommendations to your needs.
                  </p>

                  <FormField
                    control={form.control}
                    name="planningIntent"
                    render={({ field }) => (
                      <FormItem className="pt-4">
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-1 gap-4"
                          >
                            <div
                              className={`p-4 border rounded-lg flex items-start space-x-4 ${
                                field.value === "exploring"
                                  ? "border-planora-accent-purple bg-planora-accent-purple/20"
                                  : "border-white/10 bg-white/5"
                              }`}
                            >
                              <RadioGroupItem
                                value="exploring"
                                id="exploring"
                                className="mt-1"
                              />
                              <div>
                                <label
                                  htmlFor="exploring"
                                  className="font-medium cursor-pointer"
                                >
                                  Just exploring ideas
                                </label>
                                <p className="text-sm text-white/70 mt-1">
                                  I'm gathering inspiration for future travel
                                  possibilities
                                </p>
                              </div>
                            </div>
                            <div
                              className={`p-4 border rounded-lg flex items-start space-x-4 ${
                                field.value === "planning"
                                  ? "border-planora-accent-purple bg-planora-accent-purple/20"
                                  : "border-white/10 bg-white/5"
                              }`}
                            >
                              <RadioGroupItem
                                value="planning"
                                id="planning"
                                className="mt-1"
                              />
                              <div>
                                <label
                                  htmlFor="planning"
                                  className="font-medium cursor-pointer"
                                >
                                  Ready to plan a trip
                                </label>
                                <p className="text-sm text-white/70 mt-1">
                                  I have specific dates and destinations in mind
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 5: Accommodation Types (Multi-select) */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Where do you prefer to stay?
                  </h3>
                  <p className="text-sm text-white/60">
                    Select all that apply. We'll prioritize these in our
                    recommendations.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <FormField
                      control={form.control}
                      name="accommodationTypes"
                      render={({ field }) => (
                        <>
                          <OptionItem
                            icon={Hotel}
                            label="Hotel"
                            value="hotel"
                            field={field.value}
                            onChange={(value) =>
                              field.onChange(
                                toggleSelection(field.value, value),
                              )
                            }
                          />
                          <OptionItem
                            icon={Building}
                            label="Apartment"
                            value="apartment"
                            field={field.value}
                            onChange={(value) =>
                              field.onChange(
                                toggleSelection(field.value, value),
                              )
                            }
                          />
                          <OptionItem
                            icon={Tent}
                            label="Hostel"
                            value="hostel"
                            field={field.value}
                            onChange={(value) =>
                              field.onChange(
                                toggleSelection(field.value, value),
                              )
                            }
                          />
                          <OptionItem
                            icon={Palmtree}
                            label="Resort"
                            value="resort"
                            field={field.value}
                            onChange={(value) =>
                              field.onChange(
                                toggleSelection(field.value, value),
                              )
                            }
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Accommodation Comfort & Preferences */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-medium">
                      What are your accommodation preferences?
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      Select all that apply.
                    </p>

                    <FormField
                      control={form.control}
                      name="accommodationComfort"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-2">
                              <CheckboxCard
                                label="Private Room"
                                value="private-room"
                                field={field.value}
                                onChange={(value) =>
                                  field.onChange(
                                    toggleSelection(field.value, value),
                                  )
                                }
                              />
                              <CheckboxCard
                                label="Shared Room OK"
                                value="shared-room"
                                field={field.value}
                                onChange={(value) =>
                                  field.onChange(
                                    toggleSelection(field.value, value),
                                  )
                                }
                              />
                              <CheckboxCard
                                label="Private Bathroom"
                                value="private-bathroom"
                                field={field.value}
                                onChange={(value) =>
                                  field.onChange(
                                    toggleSelection(field.value, value),
                                  )
                                }
                              />
                              <CheckboxCard
                                label="Shared Bathroom OK"
                                value="shared-bathroom"
                                field={field.value}
                                onChange={(value) =>
                                  field.onChange(
                                    toggleSelection(field.value, value),
                                  )
                                }
                              />
                              <CheckboxCard
                                label="Luxury preferred"
                                value="luxury"
                                field={field.value}
                                onChange={(value) =>
                                  field.onChange(
                                    toggleSelection(field.value, value),
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-medium">
                      Preferred distance from city center?
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      Choose your location preference.
                    </p>

                    <FormField
                      control={form.control}
                      name="locationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="grid grid-cols-2 gap-2"
                            >
                              <Label value="center" field={field}>
                                City Center
                              </Label>
                              <Label value="near" field={field}>
                                Near Center (1-3km)
                              </Label>
                              <Label value="outskirts" field={field}>
                                Outskirts (3-10km)
                              </Label>
                              <Label value="anywhere" field={field}>
                                Location Not Important
                              </Label>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Flight Preferences */}
              {step === 6 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-medium">
                      What are your flight preferences?
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      Help us find the best flight options for you.
                    </p>

                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="flightType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center mb-2">
                              <Plane className="mr-2 h-4 w-4 text-planora-accent-purple" />
                              Flight Type
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-2 gap-2"
                              >
                                <Label value="direct" field={field}>
                                  Direct Only
                                </Label>
                                <Label value="any" field={field}>
                                  Stopovers OK
                                </Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferCheaperWithStopover"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-start space-x-3 p-3 border rounded-md bg-white/5 border-white/10">
                              <input
                                type="checkbox"
                                id="cheaperStopover"
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                                className="mt-1"
                              />
                              <div>
                                <label
                                  htmlFor="cheaperStopover"
                                  className="font-medium cursor-pointer"
                                >
                                  Show significantly cheaper stopovers
                                </label>
                                <p className="text-sm text-white/70 mt-1">
                                  We'll show you flights with stopovers if
                                  they're more than 25% cheaper
                                </p>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Compass className="mr-2 h-4 w-4 text-planora-accent-purple" />
                      Almost done!
                    </h4>
                    <p className="text-sm text-white/70">
                      Just one more step - let us know your departure location.
                    </p>
                  </div>
                </div>
              )}

              {/* Final Step (was Step 1): Departure Location (Moved to end) */}
              {step === totalSteps - 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Your Departure Location
                  </h3>
                  <p className="text-sm text-white/60">
                    This helps us find suitable routes for your trips.
                  </p>

                  {/* Country Selection */}
                  <FormField
                    control={form.control}
                    name="departureCountry"
                    render={({ field }) => (
                      <FormItem className="pt-4">
                        <div className="flex items-center mb-1">
                          <MapPin className="mr-2 h-4 w-4 text-planora-accent-purple" />
                          <FormLabel>Country</FormLabel>
                        </div>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            options={countryOptions}
                            className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 w-full"
                            placeholder="Select your country"
                          />
                        </FormControl>
                        <FormMessage className="text-planora-accent-pink" />
                      </FormItem>
                    )}
                  />

                  {/* City Selection */}
                  <FormField
                    control={form.control}
                    name="departureCity"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <div className="flex items-center mb-1">
                          <Plane className="mr-2 h-4 w-4 text-planora-accent-purple" />
                          <FormLabel>City</FormLabel>
                        </div>
                        <FormControl>
                          {selectedCountry ? (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              options={cityOptions}
                              className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 w-full"
                              placeholder="Select your city"
                            />
                          ) : (
                            <div className="h-10 flex items-center px-3 bg-white/5 border border-white/10 text-white/50 rounded-md cursor-not-allowed">
                              Select your city
                            </div>
                          )}
                        </FormControl>
                        {!selectedCountry && (
                          <p className="text-xs text-white/50 mt-1">
                            Please select a country first
                          </p>
                        )}
                        <FormMessage className="text-planora-accent-pink" />
                      </FormItem>
                    )}
                  />

                  {/* Custom City Input (shown only when needed) */}
                  {showCustomCityInput && (
                    <FormField
                      control={form.control}
                      name="customDepartureCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                            Custom City Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your city"
                              className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-planora-accent-pink" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={step === 0}
                  className="border-white/10 bg-white/5 text-white disabled:opacity-50"
                >
                  Back
                </Button>
                <GradientButton onClick={goToNextStep} type="button">
                  {step === totalSteps - 1 ? "Complete" : "Next"}
                </GradientButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
const Label = ({
  value,
  field,
  children,
}: {
  value: string;
  field: { value: string };
  children: React.ReactNode;
}) => (
  <div
    className={`p-3 border rounded-md text-center ${
      field.value === value
        ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
        : "border-white/10 bg-white/5 text-white/70"
    }`}
  >
    <RadioGroupItem value={value} id={value} className="hidden" />
    <label htmlFor={value} className="cursor-pointer block w-full h-full">
      {children}
    </label>
  </div>
);

const CheckboxCard = ({
  label,
  value,
  field,
  onChange,
}: {
  label: string;
  value: string;
  field: string[];
  onChange: (value: string) => void;
}) => {
  const isSelected = field.includes(value);

  return (
    <div
      className={`p-3 border rounded-md text-center cursor-pointer ${
        isSelected
          ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
      onClick={() => onChange(value)}
    >
      {label}
      {isSelected && (
        <Check className="h-3 w-3 inline-block ml-1 text-planora-accent-purple" />
      )}
    </div>
  );
};

export { Onboarding };
