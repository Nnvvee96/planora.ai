import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  className,
  placeholder = "Select option...",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const selectRef = useRef<HTMLDivElement>(null);

  // Update selected label when value changes
  useEffect(() => {
    const option = options.find((opt) => opt.value === value);
    setSelectedLabel(option ? option.label : placeholder);
  }, [value, options, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    onValueChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-white shadow-sm focus:outline-none"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className="cursor-pointer select-none px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
