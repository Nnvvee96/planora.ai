/**
 * Budget Range Step Component
 * 
 * First step of onboarding - budget range selection
 */

import React from "react";
import {
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Control } from 'react-hook-form';

interface BudgetRangeStepProps {
  control: Control<any>;
  formatBudgetRange: (min: number, max: number) => string;
}

const BudgetRangeStep = ({ control, formatBudgetRange }: BudgetRangeStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        What's your budget range?
      </h3>
      <p className="text-sm text-white/60">
        We'll use this to recommend suitable options.
      </p>

      <FormField
        control={control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem className="pt-4">
            <div className="space-y-8">
              {/* Category buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    field.onChange({ min: 500, max: 1000 })
                  }
                  className={`p-4 border rounded-lg text-center ${
                    field.value.min === 500 &&
                    field.value.max === 1000
                      ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="font-bold">Budget</div>
                  <div className="text-sm mt-1">€500 - €1000</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    field.onChange({ min: 1000, max: 2000 })
                  }
                  className={`p-4 border rounded-lg text-center ${
                    field.value.min === 1000 &&
                    field.value.max === 2000
                      ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="font-bold">Standard</div>
                  <div className="text-sm mt-1">€1000 - €2000</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    field.onChange({ min: 2000, max: 3500 })
                  }
                  className={`p-4 border rounded-lg text-center ${
                    field.value.min === 2000 &&
                    field.value.max === 3500
                      ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="font-bold">Premium</div>
                  <div className="text-sm mt-1">€2000 - €3500</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    field.onChange({ min: 3500, max: 10000 })
                  }
                  className={`p-4 border rounded-lg text-center ${
                    field.value.min === 3500 &&
                    field.value.max === 10000
                      ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="font-bold">Luxury</div>
                  <div className="text-sm mt-1">€3500+</div>
                </button>
              </div>

              {/* Current selection indicator */}
              <div className="text-center">
                <div className="text-2xl font-bold text-planora-accent-purple">
                  {formatBudgetRange(
                    field.value.min,
                    field.value.max,
                  )}
                </div>
              </div>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export { BudgetRangeStep }; 