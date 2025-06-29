/**
 * SimpleCheckboxCard Component
 * 
 * A simplified checkbox card component that avoids re-render issues
 * This doesn't use the Checkbox component from shadcn/ui which was causing
 * infinite re-renders due to its internal state management
 */

import React from 'react';
import { Check } from 'lucide-react';

interface SimpleCheckboxCardProps {
  label: string;
  value: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const SimpleCheckboxCard: React.FC<SimpleCheckboxCardProps> = ({ 
  label, 
  value: _value, 
  selected, 
  onToggle, 
  disabled = false 
}) => {
  // Use a stable reference for the click handler to prevent re-renders
  const handleClick = React.useCallback(() => {
    if (!disabled) {
      onToggle();
    }
  }, [disabled, onToggle]);
  
  return (
    <div 
      className={`p-3 border rounded-md flex items-center space-x-2 ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${
        selected 
          ? 'border-planora-accent-purple bg-planora-accent-purple/10 text-white' 
          : 'border-white/10 bg-white/5 text-white/70'
      }`}
      onClick={handleClick}
    >
      {/* Custom checkbox implementation to avoid re-rendering issues */}
      <div className={`h-4 w-4 rounded border ${selected ? 'bg-planora-accent-purple border-planora-accent-purple' : 'border-gray-300'} flex items-center justify-center`}>
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
      <span>{label}</span>
    </div>
  );
}; 