import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/atoms/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/atoms/Card';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Input } from '@/ui/atoms/Input';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Clock,
  Edit,
  Check,
  X
} from 'lucide-react';
import { useTravelPreferences } from '../hooks/useTravelPreferences';
import { 
  TravelDurationType,
  DateFlexibilityType,
  PlanningIntent,
  AccommodationType,
  ComfortPreference,
  LocationPreference,
  FlightType
} from '../types/travelPreferencesTypes';
import { countryOptions, getCityOptions } from '@/features/location-data/locationDataApi';

/**
 * Form schema that exactly matches the onboarding flow
 */
const travelPreferencesSchema = z.object({
  // 1. Budget Range (from Onboarding)
  budgetRange: z.object({
    min: z.number().min(1),
    max: z.number().min(1)
  }),
  
  // 2. Budget Flexibility (from Onboarding)
  budgetFlexibility: z.number().min(0).max(25),
  
  // 3. Travel Duration (from Onboarding)
  travelDuration: z.enum(['weekend', 'week', 'two-weeks', 'longer']),
  
  // 4. Date Flexibility (from Onboarding)
  dateFlexibility: z.enum(['flexible-few', 'flexible-week', 'fixed', 'very-flexible']),
  customDateFlexibility: z.string().optional(),
  
  // 5. Planning Intent (from Onboarding)
  planningIntent: z.enum(['exploring', 'planning']),
  
  // 6. Accommodation Types (from Onboarding)
  accommodationTypes: z.array(
    z.enum(['hotel', 'apartment', 'hostel', 'resort'])
  ).min(1, "Please select at least one accommodation type"),
  
  // 7. Accommodation Comfort (from Onboarding)
  accommodationComfort: z.array(
    z.enum(['private-room', 'shared-room', 'private-bathroom', 'shared-bathroom', 'luxury'])
  ).min(1, "Please select at least one comfort preference"),
  
  // 8. Location Preference (from Onboarding)
  locationPreference: z.enum(['center', 'near', 'outskirts', 'anywhere']),
  
  // 9. Flight Preferences (from Onboarding)
  flightType: z.enum(['direct', 'any']),
  preferCheaperWithStopover: z.boolean(),
  
  // 10. Departure Location (from Onboarding)
  departureCountry: z.string().min(1, "Please select a departure country"),
  departureCity: z.string().min(1, "Please select a departure city"),
  customDepartureCity: z.string().optional()
});

// Type derived from schema
type TravelPreferencesFormValues = z.infer<typeof travelPreferencesSchema>;

interface TravelPreferencesPanelProps {
  onClose?: () => void;
  isDialog?: boolean;
}

/**
 * CheckboxCard component for multi-select options
 */
/**
 * SimpleCheckboxCard component - completely rebuilt to avoid re-render issues
 * This is a simplified version that doesn't use the Checkbox component from shadcn/ui
 * which was causing infinite re-renders due to its internal state management
 */
const SimpleCheckboxCard: React.FC<{
  label: string;
  value: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ label, value: _value, selected, onToggle, disabled = false }) => {
  // Use a stable reference for the click handler to prevent re-renders
  const handleClick = React.useCallback(() => {
    if (!disabled) {
      onToggle();
    }
  }, [disabled, onToggle]);
  
  return (
    <div 
      className={`p-3 border rounded-md flex items-center space-x-2 ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${
        selected 
          ? 'border-planora-accent-purple bg-planora-accent-purple/10 text-white' 
          : 'border-white/10 bg-white/5 text-white/70'
      }`}
      onClick={handleClick}
    >
      {/* Custom checkbox implementation to avoid re-rendering issues */}
      <div className={`h-4 w-4 rounded border ${selected ? 'bg-planora-accent-purple border-planora-accent-purple' : 'border-gray-300'} flex items-center justify-center`}>
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
      <span>{label}</span>
    </div>
  );
};

/**
 * Travel Preferences Panel Component
 * 
 * This component displays and allows editing of a user's travel preferences.
 * It is fully aligned with the onboarding flow, showing the exact same options
 * and storing data in the same format.
 */
const TravelPreferencesPanel: React.FC<TravelPreferencesPanelProps> = ({ 
  onClose, 
  isDialog = false 
}) => {
  const navigate = useNavigate();
  const { preferences, loading: isLoading, savePreferences } = useTravelPreferences();
  const [editing, setEditing] = useState(false);

  // Initialize form with default values exactly matching onboarding
  const form = useForm<TravelPreferencesFormValues>({
    resolver: zodResolver(travelPreferencesSchema),
    defaultValues: {
      budgetRange: { min: 1000, max: 2000 },
      budgetFlexibility: 10,
      travelDuration: 'week',
      dateFlexibility: 'flexible-few',
      customDateFlexibility: '',
      planningIntent: 'exploring',
      accommodationTypes: ['hotel'],
      accommodationComfort: ['private-room', 'private-bathroom'],
      locationPreference: 'anywhere',
      departureCountry: '',
      departureCity: '',
      customDepartureCity: '',
      flightType: 'direct',
      preferCheaperWithStopover: true
    },
    mode: 'onChange'
  });

  // Formatting helpers
  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;
  const formatBudgetTolerance = (value: number) => `±${value}%`;

  // Clear customDateFlexibility when a standard travel duration is selected
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'travelDuration' && value.travelDuration !== 'longer') {
        form.setValue('customDateFlexibility', '', { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Load saved preferences
  useEffect(() => {
    if (preferences && !isLoading) {
      try {
        // Always create a complete object with all required fields populated with default values as needed
        // This prevents TypeScript errors with optional vs required properties
        const formattedPreferences: TravelPreferencesFormValues = {
          budgetRange: {
            min: Number(preferences.budgetRange && preferences.budgetRange.min ? preferences.budgetRange.min : 500),
            max: Number(preferences.budgetRange && preferences.budgetRange.max ? preferences.budgetRange.max : 2000)
          },
          budgetFlexibility: Number(preferences.budgetFlexibility || 10),
          travelDuration: preferences.travelDuration || 'week',
          dateFlexibility: preferences.dateFlexibility || 'flexible-few',
          customDateFlexibility: preferences.customDateFlexibility || '',
          planningIntent: preferences.planningIntent || 'exploring',
          accommodationTypes: Array.isArray(preferences.accommodationTypes) 
            ? preferences.accommodationTypes.filter(type => ['hotel', 'apartment', 'hostel', 'resort'].includes(type as string)) as AccommodationType[]
            : ['hotel'],
          accommodationComfort: Array.isArray(preferences.accommodationComfort) 
            ? preferences.accommodationComfort.filter(pref => ['private-room', 'shared-room', 'private-bathroom', 'shared-bathroom', 'luxury'].includes(pref as string)) as ComfortPreference[]
            : ['private-room'],
          locationPreference: preferences.locationPreference || 'anywhere',
          departureCountry: preferences.departureCountry || '',
          departureCity: preferences.departureCity || '',
          customDepartureCity: '',
          flightType: preferences.flightType || 'direct',
          preferCheaperWithStopover: preferences.preferCheaperWithStopover === undefined ? true : preferences.preferCheaperWithStopover
        };
        
        console.log('Loading form with values:', formattedPreferences);
        // Reset form with properly typed values
        form.reset(formattedPreferences);
      } catch (error) {
        console.error('Error loading preferences into form:', error);
      }
    }
  }, [preferences, isLoading, form]);

  // Submit handler
  const onSubmit = async (formData: TravelPreferencesFormValues) => {
    console.log('Submitting travel preferences:', formData);
    
    try {
      // Clear customDateFlexibility if not needed
      const shouldClearCustomDateFlexibility = formData.travelDuration !== 'longer';
      
      // Create a complete object with all required fields to match TravelPreferencesFormValues
      // This ensures no fields are missing, which would cause TypeScript errors
      const completeFormValues = {
        budgetRange: {
          min: Number(formData.budgetRange?.min ?? 500),
          max: Number(formData.budgetRange?.max ?? 2000)
        },
        budgetFlexibility: Number(formData.budgetFlexibility ?? 10),
        travelDuration: formData.travelDuration as TravelDurationType,
        dateFlexibility: formData.dateFlexibility as DateFlexibilityType,
        // Clear customDateFlexibility if not needed
        customDateFlexibility: shouldClearCustomDateFlexibility ? '' : (formData.customDateFlexibility ?? ''),
        planningIntent: formData.planningIntent as PlanningIntent,
        accommodationTypes: Array.isArray(formData.accommodationTypes) 
          ? formData.accommodationTypes.filter(type => 
              Object.values(AccommodationType).includes(type as AccommodationType)
            ) as AccommodationType[]
          : [AccommodationType.HOTEL],
        accommodationComfort: Array.isArray(formData.accommodationComfort) 
          ? formData.accommodationComfort.filter(pref => 
              Object.values(ComfortPreference).includes(pref as ComfortPreference)
            ) as ComfortPreference[]
          : [ComfortPreference.PRIVATE_ROOM],
        locationPreference: formData.locationPreference as LocationPreference,
        departureCountry: formData.departureCountry || '',
        departureCity: formData.departureCity === 'Other' ? (formData.customDepartureCity || '') : (formData.departureCity || ''),
        flightType: formData.flightType as FlightType,
        preferCheaperWithStopover: formData.preferCheaperWithStopover !== false
      };

      console.log('Saving travel preferences with values:', completeFormValues);
      
      // Save and get the updated preferences
      // Save the preferences - the hook will handle updating the UI
      await savePreferences(completeFormValues);
      
      // Show success message
      toast({
        title: "Success",
        description: "Your travel preferences have been updated successfully.",
        variant: "default"
      });
      
      // Exit edit mode
      setEditing(false);
      
      toast({
        title: "Success",
        description: "Your travel preferences have been updated successfully.",
        variant: "default"
      });
      
      // Exit edit mode
      setEditing(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error Saving Preferences",
        description: `Failed to Update Travel Preferences\n${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/dashboard');
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setEditing(!editing);
  };



  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="border-white/10 bg-background/95">
        <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Smart Travel Profile</CardTitle>
            <CardDescription>Customize your travel settings to get personalized recommendations</CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={toggleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 1. Budget Range */}
              <div>
                <h3 className="font-medium mb-2">Budget Range</h3>
                <FormField
                  control={form.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(field.value.min)}</span>
                          <span>{formatCurrency(field.value.max)}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!editing}
                            className={`${field.value.min === 500 && field.value.max === 1000 ? 'bg-planora-accent-purple/20 border-planora-accent-purple' : ''}`}
                            onClick={() => field.onChange({ min: 500, max: 1000 })}
                          >
                            Budget<br />€500-€1000
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!editing}
                            className={`${field.value.min === 1000 && field.value.max === 2000 ? 'bg-planora-accent-purple/20 border-planora-accent-purple' : ''}`}
                            onClick={() => field.onChange({ min: 1000, max: 2000 })}
                          >
                            Standard<br />€1000-€2000
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!editing}
                            className={`${field.value.min === 2000 && field.value.max === 3500 ? 'bg-planora-accent-purple/20 border-planora-accent-purple' : ''}`}
                            onClick={() => field.onChange({ min: 2000, max: 3500 })}
                          >
                            Premium<br />€2000-€3500
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!editing}
                            className={`${field.value.min === 3500 && field.value.max === 10000 ? 'bg-planora-accent-purple/20 border-planora-accent-purple' : ''}`}
                            onClick={() => field.onChange({ min: 3500, max: 10000 })}
                          >
                            Luxury<br />€3500+
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 2. Budget Flexibility */}
              <div>
                <h3 className="font-medium mb-2">Budget Flexibility</h3>
                <FormField
                  control={form.control}
                  name="budgetFlexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            disabled={!editing}
                            min={0}
                            max={25}
                            step={5}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                          <div className="text-center">
                            <div className="text-lg font-medium text-planora-accent-purple">
                              {formatBudgetTolerance(field.value)}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Fixed Budget</span>
                              <span>Very Flexible</span>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 3-4. Trip Duration and Date Flexibility */}
              <div>
                <h3 className="font-medium mb-2">Trip Duration and Flexibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="travelDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typical Trip Duration</FormLabel>
                        <FormControl>
                          <RadioGroup
                            disabled={!editing}
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-1 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="weekend" id="weekend" />
                              <label htmlFor="weekend" className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Weekend</span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="week" id="week" />
                              <label htmlFor="week" className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>1 Week</span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="two-weeks" id="twoweeks" />
                              <label htmlFor="twoweeks" className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>2 Weeks</span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="longer" id="longer" />
                              <label htmlFor="longer" className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Longer</span>
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
                    name="dateFlexibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Flexibility</FormLabel>
                        <FormControl>
                          <RadioGroup
                            disabled={!editing}
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-1 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fixed" id="fixed-dates" />
                              <label htmlFor="fixed-dates">Fixed Dates</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flexible-few" id="flex-few" />
                              <label htmlFor="flex-few">±3 Days</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="flexible-week" id="flex-week" />
                              <label htmlFor="flex-week">±1 Week</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="very-flexible" id="very-flex" />
                              <label htmlFor="very-flex">Very Flexible</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('travelDuration') === 'longer' && (
                    <FormField
                      control={form.control}
                      name="customDateFlexibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Date Range (in days)</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!editing}
                              placeholder="e.g. 30-60 days"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* 5. Planning Intent */}
              <div>
                <h3 className="font-medium mb-2">Planning Intent</h3>
                <FormField
                  control={form.control}
                  name="planningIntent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Are you dreaming or planning?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          disabled={!editing}
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-1 gap-3"
                        >
                          <div className="p-3 border rounded-md flex items-start space-x-3">
                            <RadioGroupItem value="exploring" id="exploring-intent" className="mt-1" />
                            <div>
                              <label htmlFor="exploring-intent" className="font-medium cursor-pointer">Just exploring ideas</label>
                              <p className="text-sm text-muted-foreground mt-1">Gathering inspiration for future travel possibilities</p>
                            </div>
                          </div>
                          <div className="p-3 border rounded-md flex items-start space-x-3">
                            <RadioGroupItem value="planning" id="planning-intent" className="mt-1" />
                            <div>
                              <label htmlFor="planning-intent" className="font-medium cursor-pointer">Ready to plan a trip</label>
                              <p className="text-sm text-muted-foreground mt-1">I have specific dates and destinations in mind</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 6. Accommodation Types & 7. Preferences */}
              <div>
                <h3 className="font-medium mb-2">Accommodation Preferences</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accommodationTypes"
                    render={({ field: _field }) => (
                      <div className="space-y-2">
                      <p className="font-semibold mb-3">Where do you prefer to stay?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Accommodation Types - Completely rewritten to prevent UI crashes */}
                        <FormField
                          control={form.control}
                          name="accommodationTypes"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { label: "Hotel", value: "hotel" },
                                  { label: "Apartment", value: "apartment" },
                                  { label: "Hostel", value: "hostel" },
                                  { label: "Resort", value: "resort" }
                                ].map((option) => {
                                  // Ensure we have a valid array to work with
                                  const values = Array.isArray(field.value) ? field.value : [];
                                  // Type assertion for the string comparison
                                  const isSelected = values.includes(option.value as AccommodationType);
                                  
                                  return (
                                    <SimpleCheckboxCard
                                      key={option.value}
                                      label={option.label}
                                      value={option.value}
                                      selected={isSelected}
                                      disabled={!editing}
                                      onToggle={() => {
                                        // Create a new array to avoid reference issues
                                        const updatedValues = [...values];
                                        
                                        if (isSelected) {
                                          // Remove the value if already selected
                                          field.onChange(updatedValues.filter(item => item !== option.value));
                                        } else {
                                          // Add the value if not already selected
                                          field.onChange([...updatedValues, option.value as AccommodationType]);
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accommodationComfort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What are your accommodation preferences?</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Private Room", value: "private-room" },
                            { label: "Shared Room", value: "shared-room" },
                            { label: "Private Bathroom", value: "private-bathroom" },
                            { label: "Shared Bathroom", value: "shared-bathroom" },
                            { label: "Luxury", value: "luxury" }
                          ].map((option) => {
                            // Ensure we have a valid array to work with
                            const values = Array.isArray(field.value) ? field.value : [];
                            // Type assertion for the string comparison
                            const isSelected = values.includes(option.value as ComfortPreference);
                            
                            return (
                              <SimpleCheckboxCard
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                selected={isSelected}
                                disabled={!editing}
                                onToggle={() => {
                                  // Create a new array to avoid reference issues
                                  const updatedValues = [...values];
                                  
                                  if (isSelected) {
                                    // Remove the value if already selected
                                    field.onChange(updatedValues.filter(item => item !== option.value));
                                  } else {
                                    // Add the value if not already selected
                                    field.onChange([...updatedValues, option.value as ComfortPreference]);
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 8. Location Preference */}
              <div>
                <h3 className="font-medium mb-2">Location Preference</h3>
                <FormField
                  control={form.control}
                  name="locationPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred distance from city center?</FormLabel>
                      <FormControl>
                        {/* Fixed RadioGroup implementation */}
                        <RadioGroup
                          disabled={!editing}
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className={`p-2 border rounded-md text-center ${field.value === 'center' ? 'border-planora-accent-purple bg-planora-accent-purple/10' : 'border-white/10 bg-white/5'}`}>
                            <RadioGroupItem value="center" id="center-loc" />
                            <label htmlFor="center-loc" className="block cursor-pointer w-full h-full">City Center</label>
                          </div>
                          <div className={`p-2 border rounded-md text-center ${field.value === 'near' ? 'border-planora-accent-purple bg-planora-accent-purple/10' : 'border-white/10 bg-white/5'}`}>
                            <RadioGroupItem value="near" id="near-loc" />
                            <label htmlFor="near-loc" className="block cursor-pointer w-full h-full">Near Center (1-3km)</label>
                          </div>
                          <div className={`p-2 border rounded-md text-center ${field.value === 'outskirts' ? 'border-planora-accent-purple bg-planora-accent-purple/10' : 'border-white/10 bg-white/5'}`}>
                            <RadioGroupItem value="outskirts" id="outskirts-loc" />
                            <label htmlFor="outskirts-loc" className="block cursor-pointer w-full h-full">Outskirts (3-10km)</label>
                          </div>
                          <div className={`p-2 border rounded-md text-center ${field.value === 'anywhere' ? 'border-planora-accent-purple bg-planora-accent-purple/10' : 'border-white/10 bg-white/5'}`}>
                            <RadioGroupItem value="anywhere" id="anywhere-loc" />
                            <label htmlFor="anywhere-loc" className="block cursor-pointer w-full h-full">Location Not Important</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 9. Flight Preferences */}
              <div>
                <h3 className="font-medium mb-2">Flight Preferences</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="flightType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Type</FormLabel>
                        <FormControl>
                          {/* Fixed Flight Type RadioGroup */}
                        <RadioGroup
                            disabled={!editing}
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className={`p-2 border rounded-md text-center ${field.value === 'direct' ? 'border-planora-accent-purple bg-planora-accent-purple/10' : 'border-white/10 bg-white/5'}`}>
                              <RadioGroupItem value="direct" id="direct-flight" />
                              <label htmlFor="direct-flight" className="block cursor-pointer w-full h-full">Direct Only</label>
                            </div>
                            <div className={`p-2 border rounded-md text-center ${field.value === 'any' ? 'border-planora-accent-purple bg-planora-accent-purple/10' : 'border-white/10 bg-white/5'}`}>
                              <RadioGroupItem value="any" id="any-flight" />
                              <label htmlFor="any-flight" className="block cursor-pointer w-full h-full">Stopovers OK</label>
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            disabled={!editing}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Show significantly cheaper stopovers
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            We'll show you flights with stopovers if they're more than 25% cheaper
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 10. Departure Location */}
              <div>
                <h3 className="font-medium mb-2">Departure Location</h3>
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departureCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Select
                              options={countryOptions}
                              value={field.value || ''}
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Clear city when country changes
                                form.setValue('departureCity', '');
                              }}
                              placeholder="Select country"
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
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Select
                              options={getCityOptions(form.watch('departureCountry') || '')}
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              placeholder="Select city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom City Input - shown when "Other" is selected */}
                    {form.watch('departureCity') === 'Other' && (
                      <FormField
                        control={form.control}
                        name="customDepartureCity"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Custom City</FormLabel>
                            <FormControl>
                              <Input
                                disabled={!editing}
                                placeholder="Enter your city name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-md border border-white/10 bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Your departure location</p>
                    <p className="font-medium">
                      {form.watch('departureCountry') && form.watch('departureCity') 
                        ? `${form.watch('departureCountry')}, ${
                            form.watch('departureCity') === 'Other' 
                              ? form.watch('customDepartureCity') || 'Custom City'
                              : form.watch('departureCity')
                          }`
                        : 'No departure location set'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        {!editing && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              {isDialog ? 'Close' : 'Back to Dashboard'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export { TravelPreferencesPanel };
