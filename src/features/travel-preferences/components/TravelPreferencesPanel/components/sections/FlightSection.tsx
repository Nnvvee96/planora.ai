/**
 * Flight Section Component (Modernized)
 * 
 * Features modern styling for flight preferences
 */

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Plane, DollarSign } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';

interface FlightSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

// Flight type options - matching onboarding flow exactly
const flightTypeOptions = [
  { value: 'direct', label: 'Direct Flights Only', description: 'No stopovers, fastest route to destination', icon: '✈️' },
  { value: 'any', label: 'Stopovers OK', description: 'Any flight option works, including connections', icon: '🔄' }
];

// Price vs convenience options
const priceConvenienceOptions = [
  { value: 'price', label: 'Price First', description: 'Show me the cheapest options', icon: '💰' },
  { value: 'balanced', label: 'Balanced', description: 'Good balance of price and convenience', icon: '⚖️' },
  { value: 'convenience', label: 'Convenience First', description: 'Prioritize comfort and convenience', icon: '⭐' }
];

export const FlightSection: React.FC<FlightSectionProps> = ({ 
  control, 
  editing 
}) => {
  // Watch values for read-only display and conditional logic
  const flightType = useWatch({ control, name: 'flightType' });
  const priceVsConvenience = useWatch({ control, name: 'priceVsConvenience' });
  const preferCheaperWithStopover = useWatch({ control, name: 'preferCheaperWithStopover' });

  // Helper functions for display
  const getSelectedFlightOption = (type: string) => {
    return flightTypeOptions.find(option => option.value === type) || flightTypeOptions[0];
  };

  const getSelectedPriceOption = (preference: string) => {
    return priceConvenienceOptions.find(option => option.value === preference) || priceConvenienceOptions[1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
          <Plane className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Flight Preferences</h3>
          <p className="text-white/60 text-sm">Choose your preferred flight options</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Flight Type Preferences */}
          <FormField
            control={control}
            name="flightType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  What type of flights do you prefer?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3">
                    {flightTypeOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-indigo-400 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{option.icon}</span>
                            {isSelected && (
                              <div className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full"></div>
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

          {/* Conditional Stopover Logic - EXACT COPY FROM ONBOARDING */}
          <FormField
            control={control}
            name="flightType"
            render={({ field: flightTypeField }) => (
              <>
                <FormField
                  control={control}
                  name="preferCheaperWithStopover"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`rounded-xl p-4 border backdrop-blur-sm ${
                          flightTypeField.value === 'direct' 
                            ? 'bg-gradient-to-r from-amber-800/30 to-orange-800/30 border-amber-300/20'
                            : 'bg-gradient-to-r from-green-800/30 to-emerald-800/30 border-green-300/20'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="cheaperStopover"
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className={`mt-1 rounded focus:ring-2 ${
                                flightTypeField.value === 'direct'
                                  ? 'border-amber-300/40 bg-amber-100/10 text-amber-500 focus:ring-amber-500'
                                  : 'border-green-300/40 bg-green-100/10 text-green-500 focus:ring-green-500'
                              }`}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor="cheaperStopover"
                                className="text-base font-semibold text-white cursor-pointer block mb-1"
                              >
                                {flightTypeField.value === 'direct' 
                                  ? '💡 Consider significantly cheaper stopovers'
                                  : '💰 Prioritize significantly cheaper options'
                                }
                              </label>
                              <p className={`text-sm ${
                                flightTypeField.value === 'direct' 
                                  ? 'text-amber-100/80' 
                                  : 'text-green-100/80'
                              }`}>
                                {flightTypeField.value === 'direct' 
                                  ? 'Even though you prefer direct flights, we\'ll show you stopover options if they\'re 25% or more cheaper than direct flights'
                                  : 'We\'ll prioritize the cheapest flight options, including stopovers that are significantly cheaper'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          />

          {/* Price vs Convenience */}
          <FormField
            control={control}
            name="priceVsConvenience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  Price vs Convenience - What matters more?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {priceConvenienceOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 text-center
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
        </div>
      ) : (
        <div className="space-y-4">
          {/* Read-only Flight Type */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Plane className="h-5 w-5 text-indigo-400" />
              <span className="text-base font-semibold text-white">Flight Type</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedFlightOption(flightType || 'direct').icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {getSelectedFlightOption(flightType || 'direct').label}
                </p>
                <p className="text-white/60 text-sm">
                  {getSelectedFlightOption(flightType || 'direct').description}
                </p>
                {/* Show stopover preference in read-only mode */}
                {preferCheaperWithStopover && (
                  <p className={`text-sm mt-1 font-medium ${
                    flightType === 'direct' ? 'text-amber-300' : 'text-green-300'
                  }`}>
                    {flightType === 'direct' 
                      ? '💡 Will consider cheaper stopovers'
                      : '💰 Prioritizes cheaper options'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Read-only Price vs Convenience */}
          <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl p-4 border border-green-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-base font-semibold text-white">Price vs Convenience</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedPriceOption(priceVsConvenience || 'balanced').icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  {getSelectedPriceOption(priceVsConvenience || 'balanced').label}
                </p>
                <p className="text-white/60 text-sm">
                  {getSelectedPriceOption(priceVsConvenience || 'balanced').description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
