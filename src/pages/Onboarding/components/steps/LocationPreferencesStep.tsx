/**
 * Location Preferences Step Component (Modernized)
 * 
 * Seventh step of onboarding - location preferences with modern design
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control, useWatch } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPreferencesStepProps {
  control: Control<OnboardingFormData>;
}

// Location preference options - updated structure
const locationOptions = [
  { value: 'center', label: 'City Center', description: 'Close to main attractions and nightlife', icon: '🏙️' },
  { value: 'beach', label: 'Beach', description: 'Near the coast and beach areas', icon: '🏖️' },
  { value: 'anywhere', label: 'Anywhere', description: 'I\'m flexible with location', icon: '🗺️' }
];

// Distance options for City Center follow-up
const distanceOptions = [
  { value: 'very-close', label: 'Very Close', description: 'Direct city center' },
  { value: 'up-to-5km', label: 'Up to 5 km', description: 'Very close to city center' },
  { value: 'up-to-10km', label: 'Up to 10 km', description: 'Reasonable distance from center' },
  { value: 'more-than-10km', label: 'More than 10 km', description: 'Further out but still accessible' }
];

const LocationPreferencesStep: React.FC<LocationPreferencesStepProps> = ({ control }) => {
  // Watch the location preference to show conditional follow-up
  const locationPreference = useWatch({ control, name: 'locationPreference' });

  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Location Preferences</h3>
          <p className="text-white/60 text-sm">Where do you prefer to stay when traveling?</p>
        </div>
      </div>

      {/* Location Preference Selection - 3 options in a grid */}
      <FormField
        control={control}
        name="locationPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              What type of location do you prefer?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {locationOptions.map((option) => {
                  const isSelected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300 text-center
                        ${isSelected 
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/25' 
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl mx-auto">{option.icon}</span>
                        {isSelected && (
                          <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full absolute top-3 right-3"></div>
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

      {/* Conditional Follow-up for City Center */}
      {locationPreference === 'center' && (
        <FormField
          control={control}
          name="cityDistancePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-white mb-4 block">
                How far from the city center are you willing to stay?
              </FormLabel>
              <FormControl>
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <Navigation className="h-4 w-4 text-emerald-400" />
                    <span className="text-white/80 text-sm">Select your preferred distance</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {distanceOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left
                            ${isSelected 
                              ? 'border-emerald-400 bg-emerald-500/20 text-white' 
                              : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div>
                            <span className="font-semibold">{option.label}</span>
                            <p className="text-xs text-white/60 mt-1">{option.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Helpful tip */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-300/20">
        <div className="flex items-center space-x-2">
          <Navigation className="h-4 w-4 text-blue-400" />
          <p className="text-sm text-white/80">
            <strong>Tip:</strong> This helps us find accommodations in your preferred areas and estimate travel times to attractions.
          </p>
        </div>
      </div>
    </div>
  );
};

export { LocationPreferencesStep }; 