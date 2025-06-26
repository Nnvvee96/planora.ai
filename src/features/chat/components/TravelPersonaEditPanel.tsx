/**
 * Travel Persona Edit Panel Component
 *
 * This component provides a slide-out panel for editing travel preferences
 * directly within the chat interface. It's a simplified version of the
 * full TravelPreferencesPanel, optimized for the chat context.
 */

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import {
  Plane,
  Hotel,
  Building,
  Tent,
  Palmtree,
  Map,
  Euro,
  Clock,
  Calendar,
  Settings,
  X,
} from "lucide-react";
import {
  useTravelPreferencesIntegration,
  TravelPreferences,
} from "@/hooks/integration/useTravelPreferencesIntegration";
import {
  TravelDurationType,
  DateFlexibilityType,
  AccommodationType,
  FlightType,
} from "@/hooks/integration/useTravelPreferencesIntegration";

// Reuse the same schema from the travel preferences feature
const travelPersonaSchema = z.object({
  // 1. Budget Range
  budgetRange: z.object({
    min: z.number().min(1),
    max: z.number().min(1),
  }),

  // 2. Budget Flexibility
  budgetFlexibility: z.number().min(0).max(25),

  // 3. Travel Duration
  travelDuration: z.nativeEnum(TravelDurationType),

  // 4. Date Flexibility
  dateFlexibility: z.nativeEnum(DateFlexibilityType),

  // 5. Accommodation Types
  accommodationTypes: z
    .array(z.nativeEnum(AccommodationType))
    .min(1, "Please select at least one accommodation type"),

  // 6. Flight Preferences
  flightType: z.nativeEnum(FlightType),
  preferCheaperWithStopover: z.boolean(),

  // 7. Departure Location
  departureCity: z.string().min(1, "Please enter a departure city"),
});

type TravelPersonaFormValues = z.infer<typeof travelPersonaSchema>;

interface TravelPersonaEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A simple checkbox card component for multi-select options
 */
const SimpleCheckboxCard = ({
  checked,
  onChange,
  icon: Icon,
  label,
}: {
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ElementType;
  label: string;
}) => {
  return (
    <div
      className={`
        flex items-center p-3 rounded-md border cursor-pointer transition-colors
        ${
          checked
            ? "bg-planora-accent-purple/10 border-planora-accent-purple/50"
            : "bg-white/5 border-white/10 hover:bg-white/10"
        }
      `}
      onClick={() => onChange(!checked)}
    >
      <Icon
        className={`h-5 w-5 mr-3 ${checked ? "text-planora-accent-purple" : "text-white/60"}`}
      />
      <span className={checked ? "text-white" : "text-white/80"}>{label}</span>
    </div>
  );
};

/**
 * Travel Persona Edit Panel Component
 */
export const TravelPersonaEditPanel: React.FC<TravelPersonaEditPanelProps> = ({
  isOpen,
  onClose,
}) => {
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
      accommodationTypes: [AccommodationType.HOTEL],
      flightType: FlightType.DIRECT,
      preferCheaperWithStopover: false,
      departureCity: "Berlin",
    },
  });

  // Load preferences when available
  useEffect(() => {
    if (preferences && preferences.budgetRange) {
      form.reset({
        budgetRange: {
          min: preferences.budgetRange.min,
          max: preferences.budgetRange.max,
        },
        budgetFlexibility: preferences.budgetFlexibility,
        travelDuration: preferences.travelDuration,
        dateFlexibility: preferences.dateFlexibility,
        accommodationTypes: preferences.accommodationTypes,
        flightType: preferences.flightType,
        preferCheaperWithStopover: preferences.preferCheaperWithStopover,
        departureCity: preferences.departureCity,
      });
    }
  }, [preferences, form]);

  // Handle form submission
  const onSubmit = async (data: TravelPersonaFormValues) => {
    try {
      if (preferences?.userId) {
        // Convert form values to TravelPreferences format
        const updatedPreferences: TravelPreferences = {
          ...preferences,
          budgetRange: {
            min: data.budgetRange.min || 500, // Ensure min is never undefined
            max: data.budgetRange.max || 1000, // Ensure max is never undefined
          },
          budgetFlexibility: data.budgetFlexibility,
          travelDuration: data.travelDuration,
          dateFlexibility: data.dateFlexibility,
          accommodationTypes: data.accommodationTypes,
          flightType: data.flightType,
          preferCheaperWithStopover: data.preferCheaperWithStopover,
          departureCity: data.departureCity,
        };

        await savePreferences(updatedPreferences);
        toast({
          title: "Travel preferences updated",
          description: "Your travel persona has been updated successfully.",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error saving travel preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update travel preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-planora-purple-dark border-l border-white/10 shadow-xl overflow-y-auto">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-planora-accent-purple" />
          <h2 className="text-lg font-medium">SmartTravel-Profile</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <p className="text-white/60 text-sm mb-4">
          Customize your travel preferences to get personalized recommendations
          in your conversation.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget Section */}
            <Card className="bg-card/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Euro className="h-4 w-4 text-planora-accent-purple" />
                  Budget Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget Range */}
                <FormField
                  control={form.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">
                        Budget Range (€)
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value.min}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                min: parseInt(e.target.value),
                              })
                            }
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <span className="text-white/60">to</span>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value.max}
                            onChange={(e) =>
                              field.onChange({
                                ...field.value,
                                max: parseInt(e.target.value),
                              })
                            }
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget Flexibility */}
                <FormField
                  control={form.control}
                  name="budgetFlexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">
                        Budget Flexibility: {field.value}%
                      </FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          min={0}
                          max={25}
                          step={5}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Trip Duration Section */}
            <Card className="bg-card/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Clock className="h-4 w-4 text-planora-accent-purple" />
                  Trip Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="travelDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "weekend" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="weekend"
                              id="weekend"
                              className="sr-only"
                            />
                            <label
                              htmlFor="weekend"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "weekend" ? "text-white" : "text-white/80"}`}
                              >
                                Weekend
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "week" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="week"
                              id="week"
                              className="sr-only"
                            />
                            <label
                              htmlFor="week"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "week" ? "text-white" : "text-white/80"}`}
                              >
                                Week
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "two-weeks" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="two-weeks"
                              id="two-weeks"
                              className="sr-only"
                            />
                            <label
                              htmlFor="two-weeks"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "two-weeks" ? "text-white" : "text-white/80"}`}
                              >
                                Two Weeks
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "longer" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="longer"
                              id="longer"
                              className="sr-only"
                            />
                            <label
                              htmlFor="longer"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "longer" ? "text-white" : "text-white/80"}`}
                              >
                                Longer
                              </span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Date Flexibility */}
            <Card className="bg-card/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-planora-accent-purple" />
                  Date Flexibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="dateFlexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-2"
                        >
                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "fixed" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="fixed"
                              id="fixed"
                              className="sr-only"
                            />
                            <label
                              htmlFor="fixed"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "fixed" ? "text-white" : "text-white/80"}`}
                              >
                                Fixed Dates
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "flexible-few" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="flexible-few"
                              id="flexible-few"
                              className="sr-only"
                            />
                            <label
                              htmlFor="flexible-few"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "flexible-few" ? "text-white" : "text-white/80"}`}
                              >
                                ± 3 Days
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "flexible-week" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="flexible-week"
                              id="flexible-week"
                              className="sr-only"
                            />
                            <label
                              htmlFor="flexible-week"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "flexible-week" ? "text-white" : "text-white/80"}`}
                              >
                                ± 1 Week
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md p-3 cursor-pointer ${field.value === "very-flexible" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="very-flexible"
                              id="very-flexible"
                              className="sr-only"
                            />
                            <label
                              htmlFor="very-flexible"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "very-flexible" ? "text-white" : "text-white/80"}`}
                              >
                                Very Flexible
                              </span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Accommodation Types */}
            <Card className="bg-card/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-planora-accent-purple" />
                  Accommodation Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="accommodationTypes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-2">
                        <SimpleCheckboxCard
                          value={AccommodationType.HOTEL}
                          checked={field.value.includes(
                            AccommodationType.HOTEL,
                          )}
                          onChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, AccommodationType.HOTEL]
                              : field.value.filter(
                                  (v) => v !== AccommodationType.HOTEL,
                                );
                            field.onChange(newValue);
                          }}
                          icon={Hotel}
                          label="Hotel"
                        />

                        <SimpleCheckboxCard
                          value={AccommodationType.APARTMENT}
                          checked={field.value.includes(
                            AccommodationType.APARTMENT,
                          )}
                          onChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, AccommodationType.APARTMENT]
                              : field.value.filter(
                                  (v) => v !== AccommodationType.APARTMENT,
                                );
                            field.onChange(newValue);
                          }}
                          icon={Building}
                          label="Apartment"
                        />

                        <SimpleCheckboxCard
                          value={AccommodationType.HOSTEL}
                          checked={field.value.includes(
                            AccommodationType.HOSTEL,
                          )}
                          onChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, AccommodationType.HOSTEL]
                              : field.value.filter(
                                  (v) => v !== AccommodationType.HOSTEL,
                                );
                            field.onChange(newValue);
                          }}
                          icon={Tent}
                          label="Hostel"
                        />

                        <SimpleCheckboxCard
                          value={AccommodationType.RESORT}
                          checked={field.value.includes(
                            AccommodationType.RESORT,
                          )}
                          onChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, AccommodationType.RESORT]
                              : field.value.filter(
                                  (v) => v !== AccommodationType.RESORT,
                                );
                            field.onChange(newValue);
                          }}
                          icon={Palmtree}
                          label="Resort"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Flight Preferences */}
            <Card className="bg-card/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Plane className="h-4 w-4 text-planora-accent-purple" />
                  Flight Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="flightType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">
                        Flight Type
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div
                            className={`border rounded-md px-4 py-2 cursor-pointer ${field.value === "direct" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="direct"
                              id="direct"
                              className="sr-only"
                            />
                            <label
                              htmlFor="direct"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "direct" ? "text-white" : "text-white/80"}`}
                              >
                                Direct
                              </span>
                            </label>
                          </div>

                          <div
                            className={`border rounded-md px-4 py-2 cursor-pointer ${field.value === "any" ? "bg-planora-accent-purple/10 border-planora-accent-purple/50" : "bg-white/5 border-white/10"}`}
                          >
                            <RadioGroupItem
                              value="any"
                              id="any"
                              className="sr-only"
                            />
                            <label
                              htmlFor="any"
                              className="flex items-center cursor-pointer"
                            >
                              <span
                                className={`${field.value === "any" ? "text-white" : "text-white/80"}`}
                              >
                                Any
                              </span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferCheaperWithStopover"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-planora-accent-purple"
                        />
                      </FormControl>
                      <FormLabel className="text-white/80 cursor-pointer">
                        Prefer cheaper flights with stopovers
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Departure Location */}
            <Card className="bg-card/20 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Map className="h-4 w-4 text-planora-accent-purple" />
                  Departure Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="departureCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">
                        Departure City
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Berlin"
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/10 bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
