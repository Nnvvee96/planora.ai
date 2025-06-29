/**
 * Accommodation Types Step Component (Modernized)
 * 
 * Fifth step of onboarding - accommodation type selection with modern design
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Hotel, Building, Home, Bed } from 'lucide-react';
import { Control } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';
import { Check } from 'lucide-react';

interface AccommodationTypesStepProps {
  control: Control<OnboardingFormData>;
  OptionItem: React.ComponentType<{
    icon: React.ElementType;
    label: string;
    value: string;
    field: string[];
    onChange: (value: string) => void;
  }>;
  toggleSelection: (field: string[], value: string) => string[];
}

// Accommodation type options (removed boutique and guesthouse as requested)
const accommodationTypeOptions = [
  { 
    value: 'hotel', 
    label: 'Hotel', 
    description: 'Traditional hotel service & amenities',
    icon: Hotel,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    value: 'resort', 
    label: 'Resort', 
    description: 'All-inclusive experiences & activities',
    icon: Building,
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    value: 'apartment', 
    label: 'Apartment', 
    description: 'Home-like accommodations with kitchen',
    icon: Home,
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    value: 'hostel', 
    label: 'Hostel', 
    description: 'Budget-friendly & social atmosphere',
    icon: Bed,
    gradient: 'from-amber-500 to-orange-500'
  }
];

const AccommodationTypesStep: React.FC<AccommodationTypesStepProps> = ({ 
  control, 
  toggleSelection 
}) => {
  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Accommodation Preferences</h3>
          <p className="text-white/60 text-sm">What types of places do you like to stay? (Select all that apply)</p>
        </div>
      </div>

      <FormField
        control={control}
        name="accommodationTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              Choose your preferred accommodation types
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
                {accommodationTypeOptions.map((option) => {
                  const isSelected = field.value?.includes(option.value) || false;
                  const IconComponent = option.icon;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const newValue = toggleSelection(field.value || [], option.value);
                        field.onChange(newValue);
                      }}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${isSelected 
                          ? `border-teal-400 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 shadow-lg shadow-teal-500/25` 
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
                          <IconComponent className={`h-5 w-5 ${isSelected ? 'text-teal-300' : 'text-white/70'}`} />
                        </div>
                        {isSelected && (
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full">
                            <Check className="h-3 w-3 text-white" />
                          </div>
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

      {/* Helpful tip */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-300/20">
        <p className="text-sm text-white/80">
          💡 <strong>Tip:</strong> You can select multiple options. We'll show you the best deals across all your preferred types.
        </p>
      </div>
    </div>
  );
};

export { AccommodationTypesStep }; 