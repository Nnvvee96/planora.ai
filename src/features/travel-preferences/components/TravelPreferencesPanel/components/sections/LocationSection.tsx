/**
 * Location Section Component (Modernized)
 * 
 * Features clean radio grid for location preferences with conditional distance selection
 */

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MapPin, Building, Navigation } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';

interface LocationSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

// Location preference options - updated to match onboarding
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

export const LocationSection: React.FC<LocationSectionProps> = ({ 
  control, 
  editing 
}) => {
  // Watch values for read-only display and debugging
  const locationPreference = useWatch({ control, name: 'locationPreference' });
  const cityDistancePreference = useWatch({ control, name: 'cityDistancePreference' });

  // Debug logging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🏙️ LocationSection Debug:');
      console.log('- locationPreference:', locationPreference);
      console.log('- cityDistancePreference:', cityDistancePreference);
      console.log('- editing:', editing);
    }
  }, [locationPreference, cityDistancePreference, editing]);

  // Helper functions for display
  const getSelectedOption = (preference: string) => {
    return locationOptions.find(option => option.value === preference) || locationOptions[0];
  };

  const getSelectedDistanceOption = (distance: string) => {
    return distanceOptions.find(option => option.value === distance) || distanceOptions[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Location Preferences</h3>
          <p className="text-white/60 text-sm">Where do you prefer to stay?</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Location Preference */}
          <FormField
            control={control}
            name="locationPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  Where do you prefer to stay?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {locationOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{option.icon}</span>
                            {isSelected && (
                              <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
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

          {/* Conditional Distance Selection for City Center */}
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
                                relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                                ${isSelected 
                                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-lg shadow-emerald-500/25' 
                                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-base font-bold text-white mb-1">{option.label}</h4>
                                  <p className="text-xs text-white/60">{option.description}</p>
                                </div>
                                {isSelected && (
                                  <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full"></div>
                                )}
                              </div>
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
        </div>
      ) : (
        <div className="space-y-4">
          {/* Read-only Location Preference */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="h-5 w-5 text-purple-400" />
              <span className="text-base font-semibold text-white">Location Preference</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedOption(locationPreference || 'anywhere').icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {getSelectedOption(locationPreference || 'anywhere').label}
                </p>
                <p className="text-white/60 text-sm">
                  {getSelectedOption(locationPreference || 'anywhere').description}
                </p>
              </div>
            </div>
          </div>

          {/* Read-only Distance Preference (if City Center selected) */}
          {locationPreference === 'center' && cityDistancePreference && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-300/20">
              <div className="flex items-center space-x-3 mb-2">
                <Navigation className="h-5 w-5 text-emerald-400" />
                <span className="text-base font-semibold text-white">Distance from City Center</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    {getSelectedDistanceOption(cityDistancePreference).label}
                  </p>
                  <p className="text-white/60 text-sm">
                    {getSelectedDistanceOption(cityDistancePreference).description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
