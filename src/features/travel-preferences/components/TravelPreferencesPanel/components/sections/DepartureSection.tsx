/**
 * Departure Section Component (Modernized)
 * 
 * Features modern styling for departure location preferences
 */

import React, { useState, useEffect } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { Input } from '@/ui/atoms/Input';
import { MapPin, Plane, Globe } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';
import { countryOptions, getCityOptions, isCustomCityNeeded } from '@/features/location-data/locationDataApi';

interface DepartureSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

export const DepartureSection: React.FC<DepartureSectionProps> = ({ 
  control, 
  editing 
}) => {
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);

  // Watch values for both editing and read-only display
  const selectedCountry = useWatch({
    control,
    name: 'departureCountry'
  });

  const selectedCity = useWatch({
    control,
    name: 'departureCity'
  });

  const customDepartureCity = useWatch({
    control,
    name: 'customDepartureCity'
  });

  // Update city options when country changes
  useEffect(() => {
    if (selectedCountry) {
      const options = getCityOptions(selectedCountry);
      setCityOptions(options);
      setShowCustomCityInput(isCustomCityNeeded(selectedCity));
    }
  }, [selectedCountry, selectedCity]);

  // Helper functions for display
  const getCountryLabel = (countryValue: string) => {
    const country = countryOptions.find(option => option.value === countryValue);
    return country?.label || countryValue || 'Not specified';
  };

  const getCityLabel = (cityValue: string) => {
    if (customDepartureCity) return customDepartureCity;
    const city = cityOptions.find(option => option.value === cityValue);
    return city?.label || cityValue || 'Not specified';
  };

  const getLocationDisplay = () => {
    const country = getCountryLabel(selectedCountry);
    const city = selectedCountry ? getCityLabel(selectedCity) : null;
    
    if (country === 'Not specified') return 'Not specified';
    if (!city || city === 'Not specified') return country;
    return `${city}, ${country}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
          <Plane className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Departure Location</h3>
          <p className="text-white/60 text-sm">Set your home base for travel planning</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          {/* Departure Country */}
          <FormField
            control={control}
            name="departureCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  <Globe className="inline mr-2 h-4 w-4 text-pink-400" />
                  Departure Country
                </FormLabel>
                <FormControl>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                    <Select 
                      options={countryOptions}
                      value={field.value} 
                      onValueChange={field.onChange}
                      placeholder="Select your country"
                      className="bg-white/5 border-white/20 text-white focus:border-pink-400"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Departure City */}
          {selectedCountry && (
            <FormField
              control={control}
              name="departureCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-white mb-3 block">
                    <MapPin className="inline mr-2 h-4 w-4 text-pink-400" />
                    Departure City
                  </FormLabel>
                  <FormControl>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                      <Select 
                        options={cityOptions}
                        value={field.value} 
                        onValueChange={field.onChange}
                        placeholder="Select your city"
                        className="bg-white/5 border-white/20 text-white focus:border-pink-400"
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
                    <MapPin className="inline mr-2 h-4 w-4 text-pink-400" />
                    Custom Departure City
                  </FormLabel>
                  <FormControl>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                      <Input
                        type="text"
                        placeholder="Enter your city name"
                        {...field}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        Please enter the name of your departure city
                      </p>
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
          {/* Read-only Departure Location - Combined Display */}
          <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="h-5 w-5 text-pink-400" />
              <span className="text-base font-semibold text-white">Departure Location</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">🌍</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  {getLocationDisplay()}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {selectedCountry && selectedCity 
                    ? 'Your home base for travel planning'
                    : 'Set your departure location to get personalized recommendations'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
