/**
 * Accommodation Section Component (Modernized)
 * 
 * Features modern checkbox grids for accommodation types and comfort preferences
 */

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Hotel, Building, Home, Star } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';

interface AccommodationSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

// Accommodation type options
const accommodationTypeOptions = [
  { value: 'hotel', label: 'Hotel', description: 'Traditional hotel service', icon: '🏨' },
  { value: 'resort', label: 'Resort', description: 'All-inclusive experiences', icon: '🏖️' },
  { value: 'apartment', label: 'Apartment', description: 'Home-like accommodations', icon: '🏠' },
  { value: 'hostel', label: 'Hostel', description: 'Budget-friendly, social', icon: '🛏️' }
];

// Core comfort preference options
const coreComfortOptions = [
  { value: 'private-room', label: 'Private Room', description: 'Your own private space', icon: '🏠' },
  { value: 'private-bathroom', label: 'Private Bathroom', description: 'Ensuite facilities', icon: '🚿' },
  { value: 'shared-room', label: 'Shared Room', description: 'Dormitory or shared accommodation', icon: '🛏️' },
  { value: 'shared-bathroom', label: 'Shared Bathroom', description: 'Shared facilities with other guests', icon: '🚻' }
];

// Comfort level options
const comfortLevelOptions = [
  { value: 'budget', label: 'Budget', description: 'Basic comfort, great value', icon: '💰' },
  { value: 'standard', label: 'Standard', description: 'Good comfort and amenities', icon: '⭐' },
  { value: 'premium', label: 'Premium', description: 'Enhanced comfort and service', icon: '✨' },
  { value: 'luxury', label: 'Luxury', description: 'Ultimate comfort and luxury', icon: '💎' }
];

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({ 
  control, 
  editing 
}) => {
  // Watch values for read-only display
  const accommodationTypes = useWatch({ control, name: 'accommodationTypes' });
  const accommodationComfort = useWatch({ control, name: 'accommodationComfort' });
  const comfortLevel = useWatch({ control, name: 'comfortLevel' });

  // Helper functions for display
  const getSelectedComfortLevel = (level: string | undefined) => {
    return comfortLevelOptions.find(option => option.value === level) || comfortLevelOptions[1];
  };

  const formatAccommodationTypes = (types: string[]) => {
    const labels = types.map(type => 
      accommodationTypeOptions.find(option => option.value === type)?.label || type
    );
    return labels.join(', ');
  };

  const formatAccommodationComfort = (comfort: string[]) => {
    const labels = comfort.map(c => 
      coreComfortOptions.find(option => option.value === c)?.label || c
    );
    return labels.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Accommodation Preferences</h3>
          <p className="text-white/60 text-sm">Choose your preferred accommodation types and comfort level</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Accommodation Types */}
          <FormField
            control={control}
            name="accommodationTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  What types of accommodations do you prefer? (Select multiple)
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {accommodationTypeOptions.map((option) => {
                      const isSelected = field.value?.includes(option.value) || false;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const currentValues = field.value || [];
                            if (isSelected) {
                              field.onChange(currentValues.filter((v: string) => v !== option.value));
                            } else {
                              field.onChange([...currentValues, option.value]);
                            }
                          }}
                          className={`
                            flex flex-col p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-orange-400 bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-lg shadow-orange-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{option.icon}</span>
                            {isSelected && (
                              <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-red-400 rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{option.label}</h4>
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

          {/* Core Comfort Preferences */}
          <FormField
            control={control}
            name="accommodationComfort"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  What comfort preferences do you have? (Select multiple)
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3">
                    {coreComfortOptions.map((option) => {
                      const isSelected = field.value?.includes(option.value) || false;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const currentValues = field.value || [];
                            if (isSelected) {
                              field.onChange(currentValues.filter((v: string) => v !== option.value));
                            } else {
                              field.onChange([...currentValues, option.value]);
                            }
                          }}
                          className={`
                            flex flex-col p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-rose-400 bg-gradient-to-br from-rose-500/20 to-pink-500/20 shadow-lg shadow-rose-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{option.icon}</span>
                            {isSelected && (
                              <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{option.label}</h4>
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

          {/* Comfort Level */}
          <FormField
            control={control}
            name="comfortLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  What comfort level do you prefer?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {comfortLevelOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-center
                            ${isSelected 
                              ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-lg shadow-purple-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <span className="text-2xl mb-2">{option.icon}</span>
                          <h4 className="text-sm font-bold text-white mb-1">{option.label}</h4>
                          <p className="text-xs text-white/60">{option.description}</p>
                          {isSelected && (
                            <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full mt-2"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Read-only Accommodation Types */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="h-5 w-5 text-orange-400" />
              <span className="text-base font-semibold text-white">Accommodation Types</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏨</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {accommodationTypes && accommodationTypes.length > 0 
                    ? formatAccommodationTypes(accommodationTypes) 
                    : 'Hotel'
                  }
                </p>
                <p className="text-white/60 text-sm">
                  {accommodationTypes && accommodationTypes.length > 1 
                    ? `${accommodationTypes.length} accommodation types selected`
                    : 'Traditional hotel service'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Read-only Core Comfort Preferences */}
          <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-4 border border-rose-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Star className="h-5 w-5 text-rose-400" />
              <span className="text-base font-semibold text-white">Core Comfort Preferences</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  {accommodationComfort && accommodationComfort.length > 0 
                    ? formatAccommodationComfort(accommodationComfort) 
                    : 'Private Room, Private Bathroom'
                  }
                </p>
                <p className="text-white/60 text-sm">
                  {accommodationComfort && accommodationComfort.length > 1 
                    ? `${accommodationComfort.length} comfort preferences selected`
                    : 'Your accommodation comfort requirements'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Read-only Comfort Level */}
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Home className="h-5 w-5 text-purple-400" />
              <span className="text-base font-semibold text-white">Comfort Level</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedComfortLevel(comfortLevel).icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {getSelectedComfortLevel(comfortLevel).label}
                </p>
                <p className="text-white/60 text-sm">
                  {getSelectedComfortLevel(comfortLevel).description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
