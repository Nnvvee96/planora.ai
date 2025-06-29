/**
 * Flight Preferences Step Component (Modernized)
 * 
 * Seventh and eighth steps of onboarding - flight preferences and departure location with modern design
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { Input } from '@/ui/atoms/Input';
import { Plane, MapPin, Globe, Compass } from 'lucide-react';
import { Control } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';

interface FlightPreferencesStepProps {
  control: Control<OnboardingFormData>;
  step: number;
  totalSteps: number;
  Label: React.ComponentType<{
    value: string;
    field: { value: string };
    children: React.ReactNode;
  }>;
  countryOptions: Array<{ value: string; label: string }>;
  _cityOptions: Array<{ value: string; label: string }>;
  getCityOptions: (country: string) => Array<{ value: string; label: string }>;
  selectedCountry: string;
  showCustomCityInput: boolean;
}

// Flight type options matching schema
const flightTypeOptions = [
  {
    id: 'direct',
    label: 'Direct Flights Only',
    description: 'No stopovers, fastest route to destination',
    icon: '✈️',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'any',
    label: 'Stopovers OK',
    description: 'Any flight option works, including connections',
    icon: '🔄',
    gradient: 'from-green-500 to-emerald-500'
  }
];

// Price vs convenience options
const priceConvenienceOptions = [
  {
    id: 'price',
    label: 'Price First',
    description: 'Show me the cheapest options',
    icon: '💰',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Good balance of price and convenience',
    icon: '⚖️',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'convenience',
    label: 'Convenience First',
    description: 'Prioritize comfort and convenience',
    icon: '⭐',
    gradient: 'from-amber-500 to-orange-500'
  }
];

const FlightPreferencesStep: React.FC<FlightPreferencesStepProps> = ({
  control,
  step,
  totalSteps: _totalSteps,
  countryOptions,
  _cityOptions,
  getCityOptions,
  selectedCountry,
  showCustomCityInput
}) => {
  
  // Step 7: Flight Preferences
  if (step === 6) {
    return (
      <div className="space-y-6">
        {/* Modern header with icon */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Flight Preferences</h3>
            <p className="text-white/60 text-sm">How do you prefer to fly and what matters most to you?</p>
          </div>
        </div>

        {/* Flight Type Selection - EXACT COPY OF WORKING PATTERN */}
        <FormField
          control={control}
          name="flightType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-white mb-4 block">
                What type of flights do you prefer?
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-4">
                  {flightTypeOptions.map((option) => {
                    const isSelected = field.value === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => field.onChange(option.id)}
                        className={`
                          relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                          ${isSelected 
                            ? 'border-sky-400 bg-gradient-to-br from-sky-500/20 to-blue-500/20 shadow-lg shadow-sky-500/25' 
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{option.icon}</span>
                          {isSelected && (
                            <div className="w-3 h-3 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full"></div>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">{option.label}</h4>
                        <p className="text-xs text-white/60 mb-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cheaper Stopover Option - Show based on flight type selection */}
        <FormField
          control={control}
          name="flightType"
          render={({ field: flightTypeField }) => (
            <>
              {/* Show cheaper stopovers option for both flight types, but with different messaging */}
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
          name="priceConvenience"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-white mb-4 block">
                Price vs Convenience - What matters more?
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {priceConvenienceOptions.map((option) => {
                    const isSelected = field.value === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => field.onChange(option.id)}
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

        {/* Progress indicator */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-300/20">
          <div className="flex items-center space-x-2">
            <Compass className="h-4 w-4 text-green-400" />
            <p className="text-sm text-white/80">
              <strong>Almost done!</strong> Just one more step - let us know your departure location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 8: Departure Location
  if (step === 7) {
    return (
      <div className="space-y-6">
        {/* Modern header with icon */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Departure Location</h3>
            <p className="text-white/60 text-sm">Where will you typically depart from for your travels?</p>
          </div>
        </div>

        {/* Country Selection */}
        <FormField
          control={control}
          name="departureCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-white mb-3 block">
                Country
              </FormLabel>
              <FormControl>
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="text-white/80 text-sm">Select your departure country</span>
                  </div>
                  <Select 
                    value={field.value || ''} 
                    onValueChange={field.onChange}
                    options={countryOptions}
                    placeholder="Select a country..."
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City Selection */}
        {selectedCountry && (
          <FormField
            control={control}
            name="departureCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  City
                </FormLabel>
                <FormControl>
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Globe className="h-4 w-4 text-emerald-400" />
                      <span className="text-white/80 text-sm">Select your departure city</span>
                    </div>
                    <Select 
                      value={field.value || ''} 
                      onValueChange={field.onChange}
                      options={getCityOptions(selectedCountry)}
                      placeholder="Select a city..."
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Custom City Input */}
        {showCustomCityInput && (
          <FormField
            control={control}
            name="customDepartureCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  Custom City Name
                </FormLabel>
                <FormControl>
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <Input
                      type="text"
                      placeholder="Enter your city name"
                      {...field}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400"
                    />
                    <p className="text-xs text-white/60 mt-2">
                      Enter the name of your departure city
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Completion indicator */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-300/20">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎉</span>
            <p className="text-sm text-white/80">
              <strong>You're all set!</strong> Click Complete to finish setting up your SmartTravel-Profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export { FlightPreferencesStep }; 