/**
 * Planning Intent Section Component (Modernized)
 * 
 * Features larger descriptive radio cards for planning intent
 */

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Compass, Lightbulb } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';

interface PlanningIntentSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

// Planning intent options
const planningIntentOptions = [
  {
    value: 'exploring',
    label: 'Just Exploring',
    description: 'Looking for inspiration and travel ideas',
    icon: '💡',
    details: 'Perfect for browsing destinations and getting inspired'
  },
  {
    value: 'planning',
    label: 'Ready to Plan',
    description: 'Have specific dates and ready to book',
    icon: '📅',
    details: 'Great for concrete planning with dates and budgets'
  }
];

export const PlanningIntentSection: React.FC<PlanningIntentSectionProps> = ({ 
  control, 
  editing 
}) => {
  // Watch values for read-only display
  const planningIntent = useWatch({ control, name: 'planningIntent' });

  // Helper function for display
  const getSelectedOption = (intent: string) => {
    return planningIntentOptions.find(option => option.value === intent) || planningIntentOptions[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Planning Intent</h3>
          <p className="text-white/60 text-sm">Tell us what brings you here today</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <FormField
            control={control}
            name="planningIntent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  What brings you here today?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planningIntentOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 text-left min-h-[160px]
                            ${isSelected 
                              ? 'border-green-400 bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-lg shadow-green-500/25' 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl">{option.icon}</span>
                            {isSelected && (
                              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">{option.label}</h4>
                          <p className="text-base text-white/80 mb-3">{option.description}</p>
                          <p className="text-sm text-white/60 mt-auto">{option.details}</p>
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
          {/* Read-only Planning Intent */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Lightbulb className="h-5 w-5 text-green-400" />
              <span className="text-base font-semibold text-white">Planning Intent</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getSelectedOption(planningIntent || 'exploring').icon}</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {getSelectedOption(planningIntent || 'exploring').label}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {getSelectedOption(planningIntent || 'exploring').description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
