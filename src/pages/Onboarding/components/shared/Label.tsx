/**
 * Label Component
 * 
 * Custom label component for radio group items in onboarding
 */

import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { LabelProps } from "../../types/onboardingTypes";

export const Label = ({ value, field, children }: LabelProps) => (
  <div
    className={`p-3 border rounded-lg flex items-center space-x-3 cursor-pointer ${
      field.value === value
        ? "border-planora-accent-purple bg-planora-accent-purple/20"
        : "border-white/10 bg-white/5 hover:bg-white/10"
    }`}
  >
    <RadioGroupItem value={value} id={value} />
    <label htmlFor={value} className="flex-1 cursor-pointer">
      {children}
    </label>
  </div>
); 