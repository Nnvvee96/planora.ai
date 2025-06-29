/**
 * Travel Duration Step Component (BRAND NEW IMPLEMENTATION)
 * 
 * Using native HTML radio inputs for guaranteed functionality
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/ui/atoms/Input';
import { Clock, Calendar } from 'lucide-react';
import { Control, UseFormSetValue } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';

interface TravelDurationStepProps {
  control: Control<OnboardingFormData>;
  _setValue: UseFormSetValue<OnboardingFormData>;
  travelDuration: string;
  _dateFlexibility: string | null;
  Label: React.ComponentType<{
    value: string;
    field: { value: string };
    children: React.ReactNode;
  }>;
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

export const TravelDurationStep: React.FC<TravelDurationStepProps> = ({
  control,
  _setValue,
  travelDuration,
  _dateFlexibility
}) => {
  
  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Travel Duration & Flexibility</h3>
          <p className="text-white/60 text-sm">How long do you typically travel and how flexible are your dates?</p>
        </div>
      </div>

      {/* Travel Duration - 2x2 Grid */}
      <FormField
        control={control}
        name="travelDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              How long are your trips usually?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-xs text-white/60 mb-1">{option.description}</p>
                      <p className="text-xs font-semibold text-purple-300">{option.duration}</p>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Custom Date Range for extended trips */}
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
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
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

      {/* Date Flexibility - EXACT COPY OF WORKING TRAVEL DURATION IMPLEMENTATION */}
      <FormField
        control={control}
        name="dateFlexibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              How flexible are your travel dates?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
                {flexibilityOptions.map((option) => {
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
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-300/20">
        <p className="text-sm text-white/80">
          💡 <strong>Tip:</strong> {travelDuration === 'longer' 
            ? 'Extended trips offer the best opportunities for deep cultural immersion and meaningful experiences.' 
            : 'Flexible dates often mean better deals and more options for accommodations and flights.'}
        </p>
      </div>
    </div>
  );
}; 