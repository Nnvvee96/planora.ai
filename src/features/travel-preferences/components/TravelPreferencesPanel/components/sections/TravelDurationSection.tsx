/**
 * Travel Duration Section Component (Modernized)
 * 
 * Features clean 2x2 grid for trip duration and modern cards for date flexibility
 */

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/ui/atoms/Input';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';

interface TravelDurationSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

// Duration options for the 2x2 grid
const durationOptions = [
  { id: 'weekend', label: 'Weekend', duration: '2-3 days', icon: '🏃‍♂️', description: 'Quick getaway' },
  { id: 'week', label: 'One Week', duration: '7-10 days', icon: '✈️', description: 'Perfect balance' },
  { id: 'two-weeks', label: 'Two Weeks', duration: '14-21 days', icon: '🌍', description: 'Deep exploration' },
  { id: 'longer', label: 'Extended', duration: '1+ months', icon: '🎒', description: 'Immersive travel' }
];

// Flexibility options
const flexibilityOptions = [
  { id: 'flexible-few', label: 'Flexible', description: 'I can adjust my dates by ±3 days', icon: '📅' },
  { id: 'flexible-week', label: 'Very Flexible', description: 'I can shift my trip by ±1 week', icon: '🗓️' },
  { id: 'very-flexible', label: 'Extremely Flexible', description: 'I can travel anytime within a season', icon: '🌟' },
  { id: 'fixed', label: 'Fixed Dates', description: 'My dates are set and can\'t change', icon: '📌' }
];

export const TravelDurationSection: React.FC<TravelDurationSectionProps> = ({ 
  control, 
  editing 
}) => {
  // Watch values for read-only display
  const travelDuration = useWatch({ control, name: 'travelDuration' });
  const dateFlexibility = useWatch({ control, name: 'dateFlexibility' });
  const customDateFlexibility = useWatch({ control, name: 'customDateFlexibility' });

  // Helper functions for display
  const formatTravelDuration = (duration: string) => {
    const option = durationOptions.find(opt => opt.id === duration);
    return option ? `${option.label} (${option.duration})` : 'Not set';
  };

  const formatDateFlexibility = (flexibility: string) => {
    const option = flexibilityOptions.find(opt => opt.id === flexibility);
    return option ? option.label : 'Not set';
  };

  const getSelectedDurationOption = (duration: string) => {
    return durationOptions.find(opt => opt.id === duration) || durationOptions[1];
  };

  const getSelectedFlexibilityOption = (flexibility: string) => {
    return flexibilityOptions.find(opt => opt.id === flexibility) || flexibilityOptions[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Travel Duration & Flexibility</h3>
          <p className="text-white/60 text-sm">Set your preferred trip length and date flexibility</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Travel Duration - 2x2 Grid */}
          <FormField
            control={control}
            name="travelDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  How long are your trips usually?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3">
                    {durationOptions.map((option) => {
                      const isSelected = field.value === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => field.onChange(option.id)}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{option.icon}</span>
                            {isSelected && (
                              <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">{option.label}</h4>
                          <p className="text-xs text-white/60 mb-1">{option.description}</p>
                          <p className="text-xs font-semibold text-blue-300">{option.duration}</p>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Flexibility */}
          <FormField
            control={control}
            name="dateFlexibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  How flexible are your travel dates?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {flexibilityOptions.map((option) => {
                      const isSelected = field.value === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => field.onChange(option.id)}
                          className={`
                            flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <span className="text-lg">{option.icon}</span>
                          <div className="flex-1">
                            <div className="text-base font-bold text-white mb-1">{option.label}</div>
                            <div className="text-xs text-white/60">{option.description}</div>
                          </div>
                          {isSelected && (
                            <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mt-1"></div>
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

          {/* Custom Date Flexibility */}
          {travelDuration === 'longer' && (
            <FormField
              control={control}
              name="customDateFlexibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-white mb-3 block">
                    Custom Date Range (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center space-x-3 mb-3">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-white/80 text-sm">Specify your preferred time period</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="e.g. 30-60 days, Summer 2024, 3-6 months"
                        {...field}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        Enter your preferred travel duration or time period for extended trips
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
          {/* Read-only Travel Duration */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-base font-semibold text-white">Trip Duration</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedDurationOption(travelDuration || 'week').icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {travelDuration ? formatTravelDuration(travelDuration) : 'One Week (7-10 days)'}
                </p>
                <p className="text-white/60 text-sm">
                  {getSelectedDurationOption(travelDuration || 'week').description}
                </p>
              </div>
            </div>
          </div>

          {/* Read-only Date Flexibility */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="h-5 w-5 text-green-400" />
              <span className="text-base font-semibold text-white">Date Flexibility</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedFlexibilityOption(dateFlexibility || 'flexible-few').icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {dateFlexibility ? formatDateFlexibility(dateFlexibility) : 'Flexible'}
                </p>
                <p className="text-white/60 text-sm">
                  {getSelectedFlexibilityOption(dateFlexibility || 'flexible-few').description}
                </p>
                {customDateFlexibility && (
                  <p className="text-sm text-green-300 mt-1 font-medium">
                    Custom: {customDateFlexibility}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 