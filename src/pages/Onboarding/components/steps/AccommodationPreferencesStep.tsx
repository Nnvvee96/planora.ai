/**
 * Accommodation Preferences Step Component (Modernized)
 * 
 * Sixth step of onboarding - accommodation comfort preferences with modern design
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';
import { Star, Shield, Wifi as _Wifi, Car as _Car } from 'lucide-react';
import { Check } from 'lucide-react';

interface AccommodationPreferencesStepProps {
  control: Control<OnboardingFormData>;
  CheckboxCard: React.ComponentType<{
    label: string;
    value: string;
    field: string[];
    onChange: (value: string) => void;
  }>;
  Label: React.ComponentType<{
    value: string;
    field: { value: string };
    children: React.ReactNode;
  }>;
  toggleSelection: (field: string[], value: string) => string[];
}

// Core comfort preference options - PRIMARY PARAMETERS ONLY
const coreComfortOptions = [
  { value: 'private-room', label: 'Private Room', description: 'Your own private space', icon: '🏠' },
  { value: 'private-bathroom', label: 'Private Bathroom', description: 'Ensuite facilities', icon: '🚿' },
  { value: 'shared-room', label: 'Shared Room', description: 'Dormitory or shared accommodation', icon: '🛏️' },
  { value: 'shared-bathroom', label: 'Shared Bathroom', description: 'Shared facilities with other guests', icon: '🚻' }
];

// Comfort level options
const comfortLevelOptions = [
  { id: 'budget', label: 'Budget', description: 'Basic comfort, great value', icon: '💰' },
  { id: 'standard', label: 'Standard', description: 'Good comfort and amenities', icon: '⭐' },
  { id: 'premium', label: 'Premium', description: 'Enhanced comfort and service', icon: '✨' },
  { id: 'luxury', label: 'Luxury', description: 'Ultimate comfort and luxury', icon: '💎' }
];

const AccommodationPreferencesStep: React.FC<AccommodationPreferencesStepProps> = ({ 
  control, 
  toggleSelection 
}) => {
  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
          <Star className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Comfort & Amenities</h3>
          <p className="text-white/60 text-sm">What level of comfort do you prefer when traveling?</p>
        </div>
      </div>

      {/* Comfort Level Selection */}
      <FormField
        control={control}
        name="comfortLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              What comfort level do you prefer?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3">
                {comfortLevelOptions.map((option) => {
                  const isSelected = field.value === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => field.onChange(option.id)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${isSelected 
                          ? 'border-rose-400 bg-gradient-to-br from-rose-500/20 to-pink-500/20 shadow-lg shadow-rose-500/25' 
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{option.icon}</span>
                        {isSelected && (
                          <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full"></div>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">{option.label}</h4>
                      <p className="text-xs text-white/60">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Core Comfort Preferences (Multi-select) */}
      <FormField
        control={control}
        name="accommodationComfort"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              Core comfort preferences (Select all that apply)
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3">
                {coreComfortOptions.map((option) => {
                  const isSelected = Array.isArray(field.value) && field.value.includes(option.value);
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const currentValue = Array.isArray(field.value) ? field.value : [];
                        const newValue = toggleSelection(currentValue, option.value);
                        field.onChange(newValue);
                      }}
                      className={`
                        relative p-3 rounded-xl border-2 transition-all duration-300 text-left
                        ${isSelected 
                          ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/25' 
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{option.icon}</span>
                        {isSelected && (
                          <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-white mb-1">{option.label}</h5>
                      <p className="text-xs text-white/60">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Helpful tip */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-300/20">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <p className="text-sm text-white/80">
            <strong>Tip:</strong> These core preferences help us filter accommodations to match your comfort requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export { AccommodationPreferencesStep }; 