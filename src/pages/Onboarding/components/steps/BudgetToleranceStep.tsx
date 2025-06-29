/**
 * Budget Tolerance Step Component (Modernized)
 * 
 * Second step of onboarding - budget flexibility selection with modern design
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Control } from 'react-hook-form';
import { OnboardingFormData } from '../../types/onboardingTypes';
import { TrendingUp, Wallet } from 'lucide-react';

interface BudgetToleranceStepProps {
  control: Control<OnboardingFormData>;
  formatBudgetTolerance: (value: number) => string;
}

const BudgetToleranceStep: React.FC<BudgetToleranceStepProps> = ({ 
  control, 
  formatBudgetTolerance 
}) => {
  return (
    <div className="space-y-6">
      {/* Modern header with icon */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Budget Flexibility</h3>
          <p className="text-white/60 text-sm">How flexible is your budget for better experiences?</p>
        </div>
      </div>

      <FormField
        control={control}
        name="budgetTolerance"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-white mb-4 block">
              Budget Flexibility: {field.value || 10}%
            </FormLabel>
            <FormControl>
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  <span className="text-white/90 text-base font-medium">
                    How much can your budget stretch for amazing opportunities?
                  </span>
                </div>
                
                <div className="space-y-6">
                  <Slider
                    value={[field.value || 10]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={50}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-sm text-white/60">
                    <span>Strict (0%)</span>
                    <span className="text-blue-300 font-semibold">
                      {formatBudgetTolerance(field.value || 10)}
                    </span>
                    <span>Very Flexible (50%)</span>
                  </div>
                  
                  {/* Dynamic description based on value */}
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <p className="text-white/80 text-sm">
                      {(() => {
                        const value = field.value || 10;
                        if (value === 0) return "🔒 I stick strictly to my budget - no exceptions";
                        if (value <= 15) return "💰 I might spend a little extra for something special";
                        if (value <= 30) return "✨ I'm open to spending more for great experiences";
                        return "🌟 I'm very flexible - show me the best options regardless of cost";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Helpful tip */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-300/20">
        <p className="text-sm text-white/80">
          💡 <strong>Tip:</strong> This helps us suggest upgrades and premium options when they're worth the extra cost.
        </p>
      </div>
    </div>
  );
};

export { BudgetToleranceStep }; 