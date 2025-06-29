/**
 * Planning Intent Step Component (Modernized)
 * 
 * Fourth step of onboarding - planning intent selection with modern design
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';
import { Compass, MapPin } from 'lucide-react';

interface PlanningIntentStepProps {
  control: Control<OnboardingFormData>;
}

// Planning intent options with modern design
const planningIntentOptions = [
  {
    id: 'exploring',
    label: 'Just Exploring Ideas',
    description: 'I\'m gathering inspiration for future travel possibilities and dreaming about destinations',
    icon: '🌟',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'planning',
    label: 'Ready to Plan a Trip',
    description: 'I have specific dates and destinations in mind and want to start booking',
    icon: '🎯',
    gradient: 'from-purple-500 to-pink-500'
  }
];

const PlanningIntentStep: React.FC<PlanningIntentStepProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Are you dreaming or planning?</h3>
          <p className="text-white/60 text-sm">This helps us tailor our recommendations to your needs</p>
        </div>
      </div>

      {/* Planning Intent - EXACT COPY OF WORKING PATTERN */}
      <FormField
        control={control}
        name="planningIntent"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              What best describes your current travel mindset?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
                {planningIntentOptions.map((option) => {
                  const isSelected = field.value === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => field.onChange(option.id)}
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
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-300/20">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-amber-400" />
          <p className="text-sm text-white/80">
            <strong>Tip:</strong> Don't worry - you can always change this later as your travel plans evolve!
          </p>
        </div>
      </div>
    </div>
  );
};

export { PlanningIntentStep }; 