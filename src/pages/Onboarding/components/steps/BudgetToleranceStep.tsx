/**
 * Budget Tolerance Step Component
 * 
 * Second step of onboarding - budget flexibility selection
 */

import React from 'react';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Control } from 'react-hook-form';

interface BudgetToleranceStepProps {
  control: Control<any>;
  formatBudgetTolerance: (value: number) => string;
}

const BudgetToleranceStep = ({ control, formatBudgetTolerance }: BudgetToleranceStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        How flexible is your budget?
      </h3>
      <p className="text-sm text-white/60">
        Select your tolerance for price variations.
      </p>

      <FormField
        control={control}
        name="budgetTolerance"
        render={({ field }) => (
          <FormItem className="pt-8">
            <FormControl>
              <div className="space-y-6">
                <Slider
                  min={0}
                  max={25}
                  step={5}
                  value={[field.value]}
                  onValueChange={(values) =>
                    field.onChange(values[0])
                  }
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-planora-accent-purple">
                    {formatBudgetTolerance(field.value)}
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-2">
                    <span>Fixed Budget</span>
                    <span>Very Flexible</span>
                  </div>
                </div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export { BudgetToleranceStep }; 