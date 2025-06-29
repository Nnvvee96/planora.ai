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
} from "@/components/ui/form";
import { Logo } from "@/ui/atoms/Logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check as _Check } from "lucide-react";
import { RadioGroupItem as _RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { OnboardingFormData, onboardingSchema } from "./types/onboardingTypes";

// Import step components
import { BudgetRangeStep } from "./components/steps/BudgetRangeStep";
import { BudgetToleranceStep } from "./components/steps/BudgetToleranceStep";
import { TravelDurationStep } from "./components/steps/TravelDurationStep";
import { PlanningIntentStep } from "./components/steps/PlanningIntentStep";
import { AccommodationTypesStep } from "./components/steps/AccommodationTypesStep";
import { AccommodationPreferencesStep } from "./components/steps/AccommodationPreferencesStep";
import { LocationPreferencesStep } from "./components/steps/LocationPreferencesStep";
import { FlightPreferencesStep } from "./components/steps/FlightPreferencesStep";

// Import services
import { useAuth } from "@/features/auth/authApi";
import { userProfileService } from "@/features/user-profile/userProfileApi";
import { travelPreferencesService, TravelDurationType } from "@/features/travel-preferences/travelPreferencesApi";

// Import location data
import { countryOptions, getCityOptions, isCustomCityNeeded, CityOption } from "@/features/location-data/locationDataApi";

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

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: _authLoading, authService } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const isModifyingPreferences = location.state?.fromDashboard === true;
  
  // Initialize step from localStorage or default to 0
  const [step, setStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem('onboardingStep');
      return savedStep ? parseInt(savedStep, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Persist step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboardingStep', step.toString());
  }, [step]);

  // State for city selection
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      departureCountry: "",
      departureCity: "",
      customDepartureCity: "",
      budgetRange: { min: 500, max: 2000 },
      budgetTolerance: 20,
      travelDuration: "week",
      dateFlexibility: "flexible-few",
      customDateFlexibility: "",
      planningIntent: "exploring",
      accommodationTypes: [],
      accommodationComfort: [],
      comfortLevel: "standard",
      locationPreference: "anywhere",
      cityDistancePreference: "",
      flightType: "direct",
      priceConvenience: "convenience",
      preferCheaperWithStopover: false,
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

  const totalSteps = 9; // Updated to 9 steps to include Location Preferences

  // Watch the travel duration and date flexibility to manage their relationship
  const [travelDuration, dateFlexibility] = form.watch([
    "travelDuration",
    "dateFlexibility",
  ]);

  // Effect to handle the relationship between travel duration and date flexibility
  useEffect(() => {
    // Only set default date flexibility when travel duration is first selected AND no date flexibility is set yet
    // This prevents interference with user selections
    if (travelDuration && !dateFlexibility) {
      form.setValue("dateFlexibility", "flexible-few");
    }
  }, [travelDuration, dateFlexibility, form]); // Added missing dependencies

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Use user directly from useAuth hook instead of calling getCurrentUser
        if (user) {
          // Use auth service to get current user
          const userData = await authService.getCurrentUser();

          if (!userData) {
            if (import.meta.env.DEV) console.error("Error fetching user data");
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
        if (import.meta.env.DEV) console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [form, user, authService]); // Updated dependency to include authService

  // Load persisted form data on mount
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem('onboardingFormData');
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        // Restore form values but skip null/empty values that would break selections
        Object.keys(parsedData).forEach(key => {
          const value = parsedData[key];
          // Only restore non-null, non-empty values, and skip restoring null dateFlexibility or empty planningIntent
          if (value !== undefined && value !== null && value !== "" && 
              !(key === 'dateFlexibility' && value === null) &&
              !(key === 'planningIntent' && value === "")) {
            form.setValue(key as keyof OnboardingFormData, value);
          }
        });
      }
    } catch (error) {
      console.warn('Could not restore form data:', error);
    }
  }, [form]);

  // Persist form data to localStorage whenever form changes
  useEffect(() => {
    const subscription = form.watch((formData) => {
      try {
        localStorage.setItem('onboardingFormData', JSON.stringify(formData));
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Could not save form data:', error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Clear onboarding persistence when completed
  const clearOnboardingProgress = () => {
    try {
      localStorage.removeItem('onboardingStep');
      localStorage.removeItem('onboardingFormData');
    } catch (error) {
      console.warn('Could not clear onboarding progress:', error);
    }
  };

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
      const dateFlexibility = form.getValues("dateFlexibility");
      
      if (!travelDuration) {
        toast({
          title: "Validation Error",
          description: "Please select a travel duration",
          variant: "destructive",
        });
        return false;
      }
      
      // Always validate date flexibility - it's now required for all travel durations
      if (!dateFlexibility) {
        toast({
          title: "Validation Error", 
          description: "Please select your date flexibility",
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
    } else if (step === 5) {
      // Accommodation comfort and preferences validation
      const accommodationComfort = form.getValues("accommodationComfort");
      if (!accommodationComfort.length) {
        toast({
          title: "Validation Error",
          description: "Please select at least one accommodation comfort",
          variant: "destructive",
        });
        return false;
      }
    } else if (step === 6) {
      // Location preferences validation
      const locationPreference = form.getValues("locationPreference");
      if (!locationPreference) {
        toast({
          title: "Validation Error",
          description: "Please select a location preference",
          variant: "destructive",
        });
        return false;
      }
      
      // If City Center is selected, validate distance preference
      if (locationPreference === 'center') {
        const cityDistancePreference = form.getValues("cityDistancePreference");
        if (!cityDistancePreference) {
          toast({
            title: "Validation Error",
            description: "Please select how far from city center you're willing to stay",
            variant: "destructive",
          });
          return false;
        }
      }
    } else if (step === 7) {
      // Flight preferences validation
      const flightType = form.getValues("flightType");
      if (!flightType) {
        toast({
          title: "Validation Error",
          description: "Please select a flight type",
          variant: "destructive",
        });
        return false;
      }
    } else if (step === 8) {
      // Departure location validation
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
        if (import.meta.env.DEV) console.log("Raw form data:", formData);
        if (import.meta.env.DEV) console.log("Location preference:", formData.locationPreference);
        if (import.meta.env.DEV) console.log("City distance preference:", formData.cityDistancePreference);
      }

      // Check if budgetRange is properly formatted as an object
      const _budgetRangeData =
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
        if (import.meta.env.DEV) console.warn(
          "Could not fetch existing profile data:",
          profileFetchError,
        );
      }

      // STEP 2: Save SmartTravel-Profile to the database first
      console.log(
        "🚀 DIRECT DB PATH: Saving SmartTravel-Profile directly to database",
        formData
      );

      // Prepare SmartTravel-Profile data
      const prefData = {
        budget_min: formData.budgetRange?.min || 500,
        budget_max: formData.budgetRange?.max || 1000,
        budget_flexibility: formData.budgetTolerance || 20,
        travel_duration: formData.travelDuration || 'week',
        date_flexibility: formData.dateFlexibility || 'flexible-few',
        planning_intent: formData.planningIntent || 'exploring',
        accommodation_types: formData.accommodationTypes || ['hotel'],
        accommodation_comfort: formData.accommodationComfort || ['private-room'],
        comfort_level: formData.comfortLevel || 'standard',
        location_preference: formData.locationPreference || 'anywhere',
        city_distance_preference: formData.cityDistancePreference || null,
        flight_type: formData.flightType || 'direct',
        price_vs_convenience: formData.priceConvenience || 'convenience',
        departure_country: formData.departureCountry || '',
        departure_city: formData.departureCity || '',
        custom_departure_city: formData.customDepartureCity || null,
        user_id: user.id
      };

      console.log("SmartTravel-Profile data for insertion:", prefData);

      // First check if preferences already exist using SmartTravel-Profile service
      const existingPrefs = await travelPreferencesService.getUserTravelPreferences(user.id);
      
      if (existingPrefs) {
        if (import.meta.env.DEV) console.log("Existing preferences found, updating...");
      }

      // Format data for the SmartTravel-Profile service with proper type mapping
      const serviceData = {
        budgetRange: {
          min: prefData.budget_min,
          max: prefData.budget_max,
        },
        budgetFlexibility: prefData.budget_flexibility,
        travelDuration: prefData.travel_duration as TravelDurationType,
        dateFlexibility: prefData.date_flexibility,
        customDateFlexibility: formData.customDateFlexibility || undefined,
        planningIntent: prefData.planning_intent,
        accommodationTypes: prefData.accommodation_types,
        accommodationComfort: Array.isArray(prefData.accommodation_comfort) 
          ? prefData.accommodation_comfort 
          : [prefData.accommodation_comfort],
        comfortLevel: prefData.comfort_level,
        locationPreference: prefData.location_preference,
        // Only include cityDistancePreference if locationPreference is 'center' and we have a value
        cityDistancePreference: (prefData.location_preference === 'center' && prefData.city_distance_preference) 
          ? prefData.city_distance_preference 
          : undefined,
        flightType: prefData.flight_type,
        preferCheaperWithStopover: prefData.price_vs_convenience === 'price',
        departureCountry: prefData.departure_country,
        departureCity: prefData.departure_city,
        customDepartureCity: prefData.custom_departure_city || undefined
      };

      // Save SmartTravel-Profile using the proper service API
      const saveResult = await travelPreferencesService.saveTravelPreferences(user.id, serviceData);
      
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.log("Service data being saved:", serviceData);
        if (import.meta.env.DEV) console.log("cityDistancePreference in serviceData:", serviceData.cityDistancePreference);
      }
      
      if (!saveResult) {
        throw new Error("Failed to save SmartTravel-Profile");
      }
      
      console.log("SmartTravel-Profile save result:", saveResult);

      // STEP 3: Update profiles table to mark onboarding as completed
      // IMPORTANT: Preserve existing first_name and last_name values!
      
      // CRITICAL FIX: Also save the departure location to profiles table
      let finalDepartureCity = formData.departureCity;
      if (
        isCustomCityNeeded(formData.departureCity) &&
        formData.customDepartureCity
      ) {
        finalDepartureCity = formData.customDepartureCity;
      }

      try {
        if (import.meta.env.DEV) {
          console.log("Updating profiles table directly...");
        }

        // Prepare profile update data with preference for existing values
        // following Planora's API model conventions with camelCase fields
        const firstName = existingFirstName || currentUser.firstName || "";
        const lastName = existingLastName || currentUser.lastName || "";

        const profileUpdateData = {
          hasCompletedOnboarding: true,
          firstName: firstName,
          lastName: lastName,
          onboardingDepartureCountry: formData.departureCountry || "",
          onboardingDepartureCity: finalDepartureCity || "",
        };

        if (import.meta.env.DEV) {
          console.log("Profile update data:", profileUpdateData);
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
        if (import.meta.env.DEV) console.error("Failed to update profile directly:", profileError);
      }

      // STEP 4: Update local storage BEFORE updating metadata (which triggers auth state change)
      localStorage.setItem("hasCompletedOnboarding", "true");
      localStorage.setItem("departureCountry", formData.departureCountry || "");
      localStorage.setItem("departureCity", finalDepartureCity || "");
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
        JSON.stringify(prefData),
      );

      // STEP 5: Call the official onboarding status update function
      // This function already handles multiple sources (profile table, metadata, etc.)
      try {
        if (import.meta.env.DEV) {
          console.log("Updating onboarding status via official API...");
        }
        await userProfileService.updateOnboardingStatus(currentUser.id, true);
      } catch (onboardingError) {
        if (import.meta.env.DEV) console.error(
          "Failed to update onboarding status via API:",
          onboardingError,
        );
      }

      // STEP 6: Update user metadata in Supabase Auth
      try {
        // Include country and city in the metadata for profile display
        if (import.meta.env.DEV) {
          console.log("Updating user metadata with onboarding status");
        }

        // Format departure location with both country and city
        let departureCity = finalDepartureCity;
        // If it's a custom city entry, use that instead
        if (
          isCustomCityNeeded(finalDepartureCity) &&
          formData.customDepartureCity
        ) {
          departureCity = formData.customDepartureCity;
        }

        await authService.updateUserMetadata({
          has_completed_onboarding: true,
          country: formData.departureCountry || "",
          city: departureCity || "",
          customCity: isCustomCityNeeded(finalDepartureCity)
            ? formData.customDepartureCity
            : "",
          planning_intent: formData.planningIntent || "exploring",
          location_preference: formData.locationPreference || "center",
          flight_type: formData.flightType || "direct",
          prefer_cheaper_with_stopover: Boolean(
            formData.preferCheaperWithStopover,
          ),
          departure_country: formData.departureCountry || "",
          departure_city: isCustomCityNeeded(finalDepartureCity)
            ? formData.customDepartureCity
            : finalDepartureCity || "",
        });
      } catch (metadataError) {
        if (import.meta.env.DEV) console.error("Failed to update user metadata:", metadataError);
      }

      // STEP 7: Clear onboarding persistence and show success message
      clearOnboardingProgress();
      
      toast({
        title: "Welcome to Planora! 🎉",
        description: "Your SmartTravel-Profile has been saved successfully",
        variant: "default",
      });

      // STEP 8: Navigate to dashboard
      try {
        await authService.refreshSession();
        if (import.meta.env.DEV) {
          console.log("Session refreshed, redirecting to dashboard...");
        }

        // Navigate to dashboard with session intact
        navigate("/dashboard", { replace: true });
      } catch (navigationError) {
        if (import.meta.env.DEV) console.error("Error during final navigation:", navigationError);
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
          <_Check className="h-4 w-4 text-planora-accent-purple mt-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Modern layered background with sophisticated gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/80 to-transparent"></div>
      
      {/* Subtle animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse-light"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse-light" style={{ animationDelay: '2s' }}></div>
      
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Close button when modifying preferences */}
      {isModifyingPreferences && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl z-20 transition-all duration-200"
          onClick={() => navigate("/dashboard")}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      )}

      {/* Logo */}
      <div className="mb-8 z-10">
        <Logo />
      </div>

      <Card className="w-full max-w-4xl z-10 bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
        {/* Enhanced glass morphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/[0.03] to-emerald-500/[0.03] rounded-2xl"></div>
        
        <CardHeader className="space-y-6 pb-8 relative">
          <div className="text-center space-y-3">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-emerald-100 bg-clip-text text-transparent">
              Complete Your SmartTravel-Profile
            </CardTitle>
            <CardDescription className="text-lg text-white/70 max-w-2xl mx-auto">
              Help us personalize your travel experience with these quick preferences
            </CardDescription>
          </div>

          {/* Modern progress section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60 font-medium">Progress</span>
              <span className="text-white/80 font-semibold">
                Step {step + 1} of {totalSteps}
              </span>
            </div>
            <div className="relative">
              {/* Progress track */}
              <div className="h-3 bg-gradient-to-r from-slate-700/60 to-slate-700/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-purple-500/30 relative"
                  style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                >
                  {/* Progress shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
              {/* Progress overlay for extra depth */}
              <div className="absolute inset-0 h-3 bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-full pointer-events-none"></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-8 relative">
          <Form {...form}>
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Step content with enhanced styling */}
              <div className="min-h-[450px] relative">
                {/* Content background with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-xl"></div>
                
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
                    _setValue={form.setValue}
                    travelDuration={travelDuration}
                    _dateFlexibility={dateFlexibility}
                    Label={Label}
                  />
                )}

                {/* Step 4: Planning Intent */}
                {step === 3 && (
                  <PlanningIntentStep control={form.control} />
                )}

                {/* Step 5: Accommodation Types (Multi-select) */}
                {step === 4 && (
                  <AccommodationTypesStep 
                    control={form.control}
                    OptionItem={OptionItem}
                    toggleSelection={toggleSelection}
                  />
                )}

                {/* Step 6: Accommodation Comfort & Preferences */}
                {step === 5 && (
                  <AccommodationPreferencesStep 
                    control={form.control}
                    CheckboxCard={CheckboxCard}
                    Label={Label}
                    toggleSelection={toggleSelection}
                  />
                )}

                {/* Step 7: Location Preferences */}
                {step === 6 && (
                  <LocationPreferencesStep 
                    control={form.control}
                  />
                )}

                {/* Step 8: Flight Preferences */}
                {step === 7 && (
                  <FlightPreferencesStep 
                    control={form.control}
                    step={6}
                    totalSteps={totalSteps}
                    Label={Label}
                    countryOptions={countryOptions}
                    _cityOptions={cityOptions}
                    getCityOptions={getCityOptions}
                    selectedCountry={selectedCountry}
                    showCustomCityInput={showCustomCityInput}
                  />
                )}

                {/* Step 9: Departure Location */}
                {step === 8 && (
                  <FlightPreferencesStep 
                    control={form.control}
                    step={7}
                    totalSteps={totalSteps}
                    Label={Label}
                    countryOptions={countryOptions}
                    _cityOptions={cityOptions}
                    getCityOptions={getCityOptions}
                    selectedCountry={selectedCountry}
                    showCustomCityInput={showCustomCityInput}
                  />
                )}
              </div>

              {/* Enhanced navigation section */}
              <div className="flex justify-between items-center pt-8 border-t border-white/10 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent rounded-xl">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={step === 0}
                  className="px-8 py-3 border-white/25 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">←</span>
                  Back
                </Button>
                
                {/* Enhanced step indicators */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-black/20 rounded-full border border-white/10 backdrop-blur-sm">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i <= step 
                          ? 'bg-gradient-to-r from-purple-400 to-emerald-400 shadow-sm shadow-purple-400/50 scale-110' 
                          : 'bg-white/25 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={goToNextStep}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border border-white/20 shadow-lg hover:shadow-xl hover:border-white/30 transition-all duration-300 disabled:opacity-50 rounded-xl font-medium backdrop-blur-sm"
                >
                  {step === totalSteps - 1 ? (
                    <>
                      <span className="mr-2">🎉</span>
                      Complete Profile
                    </>
                  ) : (
                    <>
                      Next
                      <span className="ml-2">→</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Modernized decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-500/8 to-pink-500/8 rounded-full blur-2xl animate-drift"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-emerald-500/8 to-cyan-500/8 rounded-full blur-2xl animate-drift" style={{ animationDelay: '8s' }}></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/6 to-indigo-500/6 rounded-full blur-xl animate-pulse-light" style={{ animationDelay: '4s' }}></div>
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
    <_RadioGroupItem value={value} id={value} className="hidden" />
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
        <_Check className="h-3 w-3 inline-block ml-1 text-planora-accent-purple" />
      )}
    </div>
  );
};

export { Onboarding };
