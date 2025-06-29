/**
 * CheckboxCard Component
 *
 * Unified checkbox card component that supports both simple boolean selection
 * and multi-select array scenarios. Follows Planora's atomic design principles.
 */

import React from "react";
import { Check } from "lucide-react";

// Base props for all checkbox card variants
interface BaseCheckboxCardProps {
  label: string;
  description?: string;
  className?: string;
}

// Simple boolean checkbox variant
interface BooleanCheckboxCardProps extends BaseCheckboxCardProps {
  variant: "boolean";
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
}

// Multi-select array variant
interface MultiSelectCheckboxCardProps extends BaseCheckboxCardProps {
  variant: "multi-select";
  value: string;
  field: string[];
  onChange: (value: string) => void;
}

// Union type for all variants
export type CheckboxCardProps = BooleanCheckboxCardProps | MultiSelectCheckboxCardProps;

export const CheckboxCard: React.FC<CheckboxCardProps> = (props) => {
  const { label, description, className = "" } = props;

  if (props.variant === "boolean") {
    const { checked, onChange, icon: Icon } = props;
    
    return (
      <div
        className={`
          flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300 group
          ${
            checked
              ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/40 shadow-lg shadow-purple-500/10"
              : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
          }
          ${className}
        `}
        onClick={() => onChange(!checked)}
      >
        {Icon && (
          <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
            checked 
              ? "bg-gradient-to-br from-purple-500 to-pink-500" 
              : "bg-white/10 group-hover:bg-white/20"
          }`}>
            <Icon className={`h-4 w-4 ${checked ? "text-white" : "text-white/60"}`} />
          </div>
        )}
        <div className="flex-1">
          <span className={`font-medium transition-colors block ${checked ? "text-white" : "text-white/80"}`}>
            {label}
          </span>
          {description && (
            <span className="text-xs text-white/50 mt-1 block">{description}</span>
          )}
        </div>
        {!Icon && checked && (
          <Check className="h-4 w-4 text-purple-400" />
        )}
      </div>
    );
  }

  // Multi-select variant
  const { value, field, onChange } = props;
  const isSelected = field.includes(value);

  return (
    <div
      className={`
        p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all duration-300
        ${
          isSelected
            ? "border-planora-accent-purple bg-planora-accent-purple/20 text-white"
            : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
        }
        ${className}
      `}
      onClick={() => onChange(value)}
    >
      <div className="flex-1">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <span className="text-xs text-white/50 mt-1 block">{description}</span>
        )}
      </div>
      {isSelected && <Check className="h-4 w-4 text-planora-accent-purple" />}
    </div>
  );
};
