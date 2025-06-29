/**
 * SmartTravel-Profile Panel Component (Modernized)
 * 
 * This component displays and allows editing of a user's SmartTravel-Profile.
 * Features a modern gradient design with sophisticated visual hierarchy.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Check, X, Sparkles } from 'lucide-react';

import { Button } from '@/ui/atoms/Button';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

import { useTravelPreferences } from '../hooks/useTravelPreferences';
import { travelPreferencesSchema, TravelPreferencesFormValues } from './TravelPreferencesPanel/types/travelPreferencesFormTypes';
import { 
  createDefaultFormValues, 
  transformPreferencesToFormValues, 
  prepareFormDataForSaving 
} from './TravelPreferencesPanel/services/travelPreferencesFormService';

// Import all section components
import { BudgetSection } from './TravelPreferencesPanel/components/sections/BudgetSection';
import { TravelDurationSection } from './TravelPreferencesPanel/components/sections/TravelDurationSection';
import { PlanningIntentSection } from './TravelPreferencesPanel/components/sections/PlanningIntentSection';
import { AccommodationSection } from './TravelPreferencesPanel/components/sections/AccommodationSection';
import { LocationSection } from './TravelPreferencesPanel/components/sections/LocationSection';
import { FlightSection } from './TravelPreferencesPanel/components/sections/FlightSection';
import { DepartureSection } from './TravelPreferencesPanel/components/sections/DepartureSection';

interface TravelPreferencesPanelProps {
  onClose?: () => void;
  isDialog?: boolean;
}

export const TravelPreferencesPanel: React.FC<TravelPreferencesPanelProps> = ({ 
  onClose,
  isDialog = false 
}) => {
  const navigate = useNavigate();
  const { preferences, loading: isLoading, savePreferences } = useTravelPreferences();
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<TravelPreferencesFormValues>({
    resolver: zodResolver(travelPreferencesSchema),
    defaultValues: createDefaultFormValues(),
    mode: 'onChange'
  });

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
        const formattedPreferences = transformPreferencesToFormValues(preferences);
        console.log('Loading form with values:', formattedPreferences);
        form.reset(formattedPreferences);
      } catch (error) {
        console.error('Error loading preferences into form:', error);
      }
    }
  }, [preferences, isLoading, form]);

  // Submit handler
  const handleSubmit = async (formData: TravelPreferencesFormValues) => {
    setIsSubmitting(true);
    
    try {
      const preparedData = prepareFormDataForSaving(formData);
      console.log('Submitting SmartTravel-Profile:', formData);
      
      // Save to database
      await savePreferences(preparedData);
      console.log('Saving SmartTravel-Profile with values:', preparedData);
      
      // Show success message
      toast({
        title: "Success",
        description: "Your SmartTravel-Profile has been updated successfully.",
        variant: "default",
      });
      
      setEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error updating SmartTravel-Profile:', error);
      
      toast({
        title: "Error",
        description: `Failed to Update SmartTravel-Profile\n${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        {/* Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                  SmartTravel-Profile
                </h1>
                <p className="text-white/70 text-lg mt-1">
                  Customize your travel settings to get personalized recommendations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Content Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Budget Section */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-white/10">
                  <BudgetSection control={form.control} editing={editing} />
                </div>
                
                {/* Travel Duration Section */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
                  <TravelDurationSection control={form.control} editing={editing} />
                </div>
                
                {/* Planning Intent Section */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-white/10">
                  <PlanningIntentSection control={form.control} editing={editing} />
                </div>
                
                {/* Accommodation Section */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-white/10">
                  <AccommodationSection control={form.control} editing={editing} />
                </div>
                
                {/* Location Section */}
                <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10">
                  <LocationSection control={form.control} editing={editing} />
                </div>
                
                {/* Flight Section */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                  <FlightSection control={form.control} editing={editing} />
                </div>
                
                {/* Departure Section */}
                <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl p-6 border border-white/10">
                  <DepartureSection control={form.control} editing={editing} />
                </div>
              </form>
            </Form>

            {/* Modern Action Buttons - Below Content */}
            {editing ? (
              <div className="mt-8 flex justify-between items-center p-6 bg-black/20 rounded-2xl border border-white/10">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={toggleEdit}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel Changes
                </Button>
                <Button 
                  size="lg"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 disabled:opacity-50"
                >
                  <Check className="h-5 w-5 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              !isDialog && (
                <div className="mt-8 flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleCancel} 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    size="lg"
                    onClick={toggleEdit}
                    data-edit-profile-button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    Edit Smart Travel Profile
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};