/**
 * Travel Persona Edit Panel (Complete Chat-Friendly Version)
 * 
 * This component provides a complete slide-out panel for editing SmartTravel-Profile
 * from within the chat interface. It includes all fields from the dashboard version
 * in a minimal, chat-friendly design.
 */

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import {
  Plane,
  Hotel,
  Building,
  Tent,
  Palmtree,
  Euro,
  _Settings,
  X,
  Sparkles,
  MapPin,
  Clock,
  _Calendar,
  Compass,
  Star,
  Navigation,
  Home,
  _DollarSign,
} from "lucide-react";
import {
  useTravelPreferencesIntegration,
  TravelPreferences,
} from "@/hooks/integration/useTravelPreferencesIntegration";
import {
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType,
} from "@/hooks/integration/useTravelPreferencesIntegration";
import { CheckboxCard } from "@/ui/molecules/CheckboxCard";

// Complete schema for chat-friendly version with all fields
const travelPersonaSchema = z.object({
  // Budget
  budgetRange: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),
  budgetFlexibility: z.number().min(0).max(25),
  
  // Trip Duration & Dates
  travelDuration: z.nativeEnum(TravelDurationType),
  dateFlexibility: z.nativeEnum(DateFlexibilityType),
  customDateFlexibility: z.string().optional(),
  
  // Planning Intent
  planningIntent: z.nativeEnum(PlanningIntent),
  
  // Accommodation
  accommodationTypes: z
    .array(z.nativeEnum(AccommodationType))
    .min(1, "Please select at least one accommodation type"),
  accommodationComfort: z
    .array(z.nativeEnum(ComfortPreference))
    .min(1, "Please select at least one comfort preference"),
  comfortLevel: z.enum(["budget", "standard", "premium", "luxury"]),
  
  // Location
  locationPreference: z.nativeEnum(LocationPreference),
  cityDistancePreference: z.enum(["very-close", "up-to-5km", "up-to-10km", "more-than-10km"]).optional(),
  
  // Flight
  flightType: z.nativeEnum(FlightType),
  preferCheaperWithStopover: z.boolean(),
  priceVsConvenience: z.enum(["price", "balanced", "convenience"]),
  
  // Departure
  departureCountry: z.string().min(1, "Please enter a departure country"),
  departureCity: z.string().min(1, "Please enter a departure city"),
});

type TravelPersonaFormValues = z.infer<typeof travelPersonaSchema>;

interface TravelPersonaEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Simple option button component
 */
const OptionButton = ({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-300 text-center ${
        selected
          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/40 text-white"
          : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
      } ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * Travel Persona Edit Panel Component (Complete Chat-Friendly Version)
 */
export const TravelPersonaEditPanel = ({
  isOpen,
  onClose,
}: TravelPersonaEditPanelProps) => {
  const { preferences, savePreferences, isLoading } =
    useTravelPreferencesIntegration();

  // Set up form with React Hook Form
  const form = useForm<TravelPersonaFormValues>({
    resolver: zodResolver(travelPersonaSchema),
    defaultValues: {
      budgetRange: { min: 500, max: 1000 },
      budgetFlexibility: 10,
      travelDuration: TravelDurationType.WEEK,
      dateFlexibility: DateFlexibilityType.FLEXIBLE_FEW,
      customDateFlexibility: "",
      planningIntent: PlanningIntent.EXPLORING,
      accommodationTypes: [AccommodationType.HOTEL],
      accommodationComfort: [ComfortPreference.PRIVATE_ROOM],
      comfortLevel: "standard",
      locationPreference: LocationPreference.ANYWHERE,
      cityDistancePreference: undefined,
      flightType: FlightType.DIRECT,
      preferCheaperWithStopover: false,
      priceVsConvenience: "balanced",
      departureCountry: "",
      departureCity: "",
    },
  });

  // Watch location preference to show/hide city distance
  const locationPreference = form.watch("locationPreference");
  const travelDuration = form.watch("travelDuration");

  // Load preferences when available
  useEffect(() => {
    if (preferences && preferences.budgetRange) {
      form.reset({
        budgetRange: {
          min: preferences.budgetRange.min,
          max: preferences.budgetRange.max,
        },
        budgetFlexibility: preferences.budgetFlexibility || 10,
        travelDuration: preferences.travelDuration || TravelDurationType.WEEK,
        dateFlexibility: preferences.dateFlexibility || DateFlexibilityType.FLEXIBLE_FEW,
        customDateFlexibility: preferences.customDateFlexibility || "",
        planningIntent: preferences.planningIntent || PlanningIntent.EXPLORING,
        accommodationTypes: preferences.accommodationTypes || [AccommodationType.HOTEL],
        accommodationComfort: preferences.accommodationComfort || [ComfortPreference.PRIVATE_ROOM],
        comfortLevel: preferences.comfortLevel || "standard",
        locationPreference: preferences.locationPreference || LocationPreference.ANYWHERE,
        cityDistancePreference: preferences.cityDistancePreference,
        flightType: preferences.flightType || FlightType.DIRECT,
        preferCheaperWithStopover: preferences.preferCheaperWithStopover || false,
        priceVsConvenience: "balanced", // Default since this might not exist in old preferences
        departureCountry: preferences.departureCountry || "",
        departureCity: preferences.departureCity || "",
      });
    }
  }, [preferences, form]);

  // Handle form submission
  const onSubmit = async (data: TravelPersonaFormValues) => {
    try {
      if (preferences?.userId) {
        const updatedPreferences: TravelPreferences = {
          ...preferences,
          budgetRange: {
            min: data.budgetRange.min || 500,
            max: data.budgetRange.max || 1000,
          },
          budgetFlexibility: data.budgetFlexibility,
          travelDuration: data.travelDuration,
          dateFlexibility: data.dateFlexibility,
          customDateFlexibility: data.customDateFlexibility,
          planningIntent: data.planningIntent,
          accommodationTypes: data.accommodationTypes,
          accommodationComfort: data.accommodationComfort,
          comfortLevel: data.comfortLevel,
          locationPreference: data.locationPreference,
          cityDistancePreference: data.cityDistancePreference,
          flightType: data.flightType,
          preferCheaperWithStopover: data.preferCheaperWithStopover,
          departureCountry: data.departureCountry,
          departureCity: data.departureCity,
        };

        await savePreferences(updatedPreferences);
        toast({
          title: "SmartTravel-Profile updated",
          description: "Your preferences have been saved successfully.",
          variant: "default",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error saving SmartTravel-Profile:", error);
      toast({
        title: "Error",
        description: "Failed to update SmartTravel-Profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-black/40 backdrop-blur-2xl border-l border-white/20 shadow-2xl overflow-y-auto">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none"></div>
      
      {/* Header */}
      <div className="sticky top-0 z-20 p-6 border-b border-white/20 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                SmartTravel-Profile
              </h2>
              <p className="text-white/60 text-sm">Complete travel preferences</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Budget Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Euro className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Budget</h3>
              </div>
              
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Budget Range (€)</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FormLabel className="text-white/50 text-xs">Min</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value.min}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                min: parseInt(e.target.value) || 0,
                              })
                            }
                            className="bg-white/10 border-white/20 text-white rounded-xl"
                          />
                        </FormControl>
                      </div>
                      <div>
                        <FormLabel className="text-white/50 text-xs">Max</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value.max}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                max: parseInt(e.target.value) || 0,
                              })
                            }
                            className="bg-white/10 border-white/20 text-white rounded-xl"
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetFlexibility"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="text-white/70 text-sm">
                      Budget Flexibility: {field.value}%
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={25}
                        step={5}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Trip Duration & Date Flexibility */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Trip Duration & Dates</h3>
              </div>
              
              <FormField
                control={form.control}
                name="travelDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Preferred Trip Duration</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: TravelDurationType.WEEKEND, label: "Weekend" },
                        { value: TravelDurationType.WEEK, label: "Week" },
                        { value: TravelDurationType.TWO_WEEKS, label: "Two Weeks" },
                        { value: TravelDurationType.LONGER, label: "Longer" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateFlexibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Date Flexibility</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: DateFlexibilityType.FIXED, label: "Fixed Dates" },
                        { value: DateFlexibilityType.FLEXIBLE_FEW, label: "± 3 Days" },
                        { value: DateFlexibilityType.FLEXIBLE_WEEK, label: "± 1 Week" },
                        { value: DateFlexibilityType.VERY_FLEXIBLE, label: "Very Flexible" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {travelDuration === TravelDurationType.LONGER && (
                <FormField
                  control={form.control}
                  name="customDateFlexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">Custom Date Flexibility</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 3-6 months"
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Planning Intent */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Planning Intent</h3>
              </div>
              
              <FormField
                control={form.control}
                name="planningIntent"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { value: PlanningIntent.EXPLORING, label: "Just Exploring Ideas", description: "Gathering inspiration for future travel" },
                        { value: PlanningIntent.PLANNING, label: "Ready to Plan a Trip", description: "Have specific dates and want to start booking" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                          className="text-left"
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-white/60 mt-1">{option.description}</div>
                          </div>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Accommodation Preferences */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Accommodation</h3>
              </div>
              
              {/* Accommodation Types */}
              <FormField
                control={form.control}
                name="accommodationTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Accommodation Types</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: AccommodationType.HOTEL, icon: Hotel, label: "Hotel" },
                        { value: AccommodationType.APARTMENT, icon: Building, label: "Apartment" },
                        { value: AccommodationType.HOSTEL, icon: Tent, label: "Hostel" },
                        { value: AccommodationType.RESORT, icon: Palmtree, label: "Resort" },
                      ].map((accommodation) => (
                        <CheckboxCard
                          key={accommodation.value}
                          variant="boolean"
                          checked={field.value.includes(accommodation.value)}
                          onChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, accommodation.value]
                              : field.value.filter((v) => v !== accommodation.value);
                            field.onChange(newValue);
                          }}
                          icon={accommodation.icon}
                          label={accommodation.label}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comfort Preferences */}
              <FormField
                control={form.control}
                name="accommodationComfort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Comfort Preferences</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: ComfortPreference.PRIVATE_ROOM, icon: Home, label: "Private Room" },
                        { value: ComfortPreference.PRIVATE_BATHROOM, icon: Home, label: "Private Bathroom" },
                        { value: ComfortPreference.SHARED_ROOM, icon: Building, label: "Shared Room" },
                        { value: ComfortPreference.SHARED_BATHROOM, icon: Building, label: "Shared Bathroom" },
                        { value: ComfortPreference.LUXURY, icon: Star, label: "Luxury" },
                      ].map((comfort) => (
                        <CheckboxCard
                          key={comfort.value}
                          variant="boolean"
                          checked={field.value.includes(comfort.value)}
                          onChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, comfort.value]
                              : field.value.filter((v) => v !== comfort.value);
                            field.onChange(newValue);
                          }}
                          icon={comfort.icon}
                          label={comfort.label}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comfort Level */}
              <FormField
                control={form.control}
                name="comfortLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Overall Comfort Level</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "budget", label: "Budget", icon: "💰" },
                        { value: "standard", label: "Standard", icon: "⭐" },
                        { value: "premium", label: "Premium", icon: "✨" },
                        { value: "luxury", label: "Luxury", icon: "💎" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-lg mr-2">{option.icon}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Preferences */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Location Preferences</h3>
              </div>
              
              <FormField
                control={form.control}
                name="locationPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Preferred Location Type</FormLabel>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { value: LocationPreference.CENTER, label: "City Center", description: "Close to main attractions and city life" },
                        { value: LocationPreference.BEACH, label: "Beach/Waterfront", description: "Near beaches or waterfront areas" },
                        { value: LocationPreference.ANYWHERE, label: "Anywhere", description: "No specific location preference" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                          className="text-left"
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-white/60 mt-1">{option.description}</div>
                          </div>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {locationPreference === LocationPreference.CENTER && (
                <FormField
                  control={form.control}
                  name="cityDistancePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">Distance from City Center</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "very-close", label: "Very Close" },
                          { value: "up-to-5km", label: "Up to 5km" },
                          { value: "up-to-10km", label: "Up to 10km" },
                          { value: "more-than-10km", label: "More than 10km" },
                        ].map((option) => (
                          <OptionButton
                            key={option.value}
                            selected={field.value === option.value}
                            onClick={() => field.onChange(option.value)}
                          >
                            <span className="text-sm font-medium">{option.label}</span>
                          </OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Flight Preferences */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Flight Preferences</h3>
              </div>
              
              <FormField
                control={form.control}
                name="flightType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Flight Type</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: FlightType.DIRECT, label: "Direct Flights" },
                        { value: FlightType.ANY, label: "Any Flights" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceVsConvenience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-sm">Price vs Convenience</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "price", label: "Price", icon: "💰" },
                        { value: "balanced", label: "Balanced", icon: "⚖️" },
                        { value: "convenience", label: "Convenience", icon: "⚡" },
                      ].map((option) => (
                        <OptionButton
                          key={option.value}
                          selected={field.value === option.value}
                          onClick={() => field.onChange(option.value)}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{option.icon}</div>
                            <div className="text-xs font-medium">{option.label}</div>
                          </div>
                        </OptionButton>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferCheaperWithStopover"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </FormControl>
                    <FormLabel className="text-white/80 cursor-pointer">
                      Prefer cheaper flights with stopovers
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Departure Location */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Departure Location</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="departureCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">Country</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Germany"
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departureCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">City</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Berlin"
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-black/40 backdrop-blur-xl border-t border-white/20 p-6 -mx-6 -mb-6">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              
              {/* Back to Dashboard Button */}
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  onClick={() => window.location.href = "/dashboard"}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
