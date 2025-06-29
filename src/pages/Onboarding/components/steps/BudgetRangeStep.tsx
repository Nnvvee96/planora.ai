/**
 * Budget Range Step Component (Modernized)
 * 
 * First step of onboarding - budget range selection with modern design
 */

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Control } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';
import { DollarSign } from 'lucide-react';

interface BudgetRangeStepProps {
  control: Control<OnboardingFormData>;
  formatBudgetRange: (min: number, max: number) => string;
}

// Budget range options matching SmartTravel-Profile design
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

const BudgetRangeStep: React.FC<BudgetRangeStepProps> = ({ 
  control, 
  formatBudgetRange 
}) => {
  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">What's your travel budget?</h3>
          <p className="text-white/60 text-sm">Choose your typical budget range per person</p>
        </div>
      </div>

      <FormField
        control={control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              Select your budget range per person
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
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
                        {formatBudgetRange(option.min, option.max)}
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

      {/* Helpful tip */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-300/20">
        <p className="text-sm text-white/80">
          💡 <strong>Tip:</strong> This helps us suggest accommodations, activities, and destinations within your comfort zone.
        </p>
      </div>
    </div>
  );
};

export { BudgetRangeStep }; 