/**
 * Budget Section Component (Modernized)
 * 
 * Features horizontal selectable cards for budget ranges and modern slider for flexibility
 */

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { TravelPreferencesFormValues } from '../../types/travelPreferencesFormTypes';

interface BudgetSectionProps {
  control: Control<TravelPreferencesFormValues>;
  editing: boolean;
}

// Budget range options for horizontal cards
const budgetRangeOptions = [
  { 
    min: 500, 
    max: 1000, 
    label: 'Budget', 
    description: 'Essential travel experiences',
    icon: '💰',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    min: 1000, 
    max: 2000, 
    label: 'Standard', 
    description: 'Comfortable travel with good value',
    icon: '✈️',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    min: 2000, 
    max: 3500, 
    label: 'Premium', 
    description: 'Enhanced comfort and experiences',
    icon: '⭐',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    min: 3500, 
    max: 10000, 
    label: 'Luxury', 
    description: 'Ultimate travel experiences',
    icon: '💎',
    color: 'from-amber-500 to-orange-500'
  }
];

export const BudgetSection: React.FC<BudgetSectionProps> = ({ 
  control, 
  editing 
}) => {
  // Watch values for read-only display
  const budgetRange = useWatch({ control, name: 'budgetRange' });
  const budgetFlexibility = useWatch({ control, name: 'budgetFlexibility' });

  // Helper functions
  const formatBudgetRange = (range: { min: number; max: number }) => {
    return `€${range.min.toLocaleString()} - €${range.max.toLocaleString()}`;
  };

  const getSelectedBudgetOption = (range: { min: number; max: number } | undefined) => {
    if (!range) return budgetRangeOptions[1]; // Default to Standard
    return budgetRangeOptions.find(option => 
      option.min === range.min && option.max === range.max
    ) || budgetRangeOptions[1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Budget Preferences</h3>
          <p className="text-white/60 text-sm">Set your travel budget and flexibility</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Budget Range Selection */}
          <FormField
            control={control}
            name="budgetRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  What's your typical budget per person?
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3">
                    {budgetRangeOptions.map((option) => {
                      const isSelected = field.value?.min === option.min && field.value?.max === option.max;
                      return (
                        <button
                          key={`${option.min}-${option.max}`}
                          type="button"
                          onClick={() => field.onChange({ min: option.min, max: option.max })}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                            ${isSelected 
                              ? `border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-lg shadow-emerald-500/25` 
                              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{option.icon}</span>
                            {isSelected && (
                              <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">{option.label}</h4>
                          <p className="text-sm font-semibold text-emerald-300 mb-1">
                            {formatBudgetRange({ min: option.min, max: option.max })}
                          </p>
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

          {/* Budget Flexibility Slider */}
          <FormField
            control={control}
            name="budgetFlexibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-white mb-3 block">
                  Budget Flexibility: {field.value || 20}%
                </FormLabel>
                <FormControl>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-white/80 text-sm">How flexible is your budget?</span>
                    </div>
                    <Slider
                      value={[field.value || 20]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={50}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/60 mt-2">
                      <span>Strict (0%)</span>
                      <span>Very Flexible (50%)</span>
                    </div>
                    <p className="text-xs text-white/60 mt-3">
                      This helps us suggest options within your comfort zone
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Read-only Budget Range */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span className="text-base font-semibold text-white">Budget Range</span>
            </div>
            <div className="flex items-center space-x-3">
              {(() => {
                const defaultRange = { min: 1000, max: 2000 };
                const currentRange = budgetRange || defaultRange;
                const selectedOption = getSelectedBudgetOption(currentRange);
                return (
                  <>
                    <span className="text-xl">{selectedOption.icon}</span>
                    <div>
                      <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {selectedOption.label} {formatBudgetRange(currentRange)}
                      </p>
                      <p className="text-white/60 text-sm">
                        {selectedOption.description}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Read-only Budget Flexibility */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-300/20">
            <div className="flex items-center space-x-3 mb-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              <span className="text-base font-semibold text-white">Budget Flexibility</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {budgetFlexibility || 20}% flexibility
                </p>
                <p className="text-white/60 text-sm">
                  {(budgetFlexibility || 20) < 15 ? 'Strict budget control' : 
                   (budgetFlexibility || 20) < 30 ? 'Moderate flexibility' : 'Very flexible budget'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 