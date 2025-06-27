/**
 * Option Item Component
 * 
 * Reusable option selection component for onboarding steps
 */

import React from "react";
import { Check } from "lucide-react";
import { OptionItemProps } from "../../types/onboardingTypes";

export const OptionItem = ({
  icon: Icon,
  label,
  value,
  field,
  onChange,
}: OptionItemProps) => {
  const isSelected = field.includes(value);

  return (
    <div
      className={`p-4 border rounded-lg flex flex-col items-center text-center ${
        isSelected
          ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } cursor-pointer transition-all`}
      onClick={() => onChange(value)}
    >
      <Icon
        className={`h-8 w-8 mb-2 ${
          isSelected ? "text-planora-accent-purple" : "text-white/70"
        }`}
      />
      <span
        className={`text-sm ${isSelected ? "text-white" : "text-white/70"}`}
      >
        {label}
      </span>
      {isSelected && (
        <Check className="h-4 w-4 text-planora-accent-purple mt-2" />
      )}
    </div>
  );
}; 