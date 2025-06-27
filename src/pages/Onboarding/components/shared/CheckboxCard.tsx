/**
 * Checkbox Card Component
 * 
 * Reusable checkbox-style card component for multi-select options
 */

import React from "react";
import { Check } from "lucide-react";
import { CheckboxCardProps } from "../../types/onboardingTypes";

export const CheckboxCard = ({
  label,
  value,
  field,
  onChange,
}: CheckboxCardProps) => {
  const isSelected = field.includes(value);

  return (
    <div
      className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer ${
        isSelected
          ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
          : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
      }`}
      onClick={() => onChange(value)}
    >
      <span className="text-sm">{label}</span>
      {isSelected && <Check className="h-4 w-4 text-planora-accent-purple" />}
    </div>
  );
}; 