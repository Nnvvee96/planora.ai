import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "MM / DD / YYYY",
  className,
}: DatePickerInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, "MM/dd/yyyy") : "",
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update input value when the date prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "MM/dd/yyyy"));
    } else {
      setInputValue("");
    }
  }, [value]);

  // Handle manual input with improved formatting and validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^\d]/g, ""); // Remove non-digits

    // Auto format with slashes
    if (newValue.length > 0) {
      // Format month (limit to 12)
      if (newValue.length >= 1) {
        const monthPart = newValue.substring(0, Math.min(2, newValue.length));
        let monthNum = parseInt(monthPart, 10);

        if (monthNum > 12) {
          monthNum = 12;
          newValue =
            monthNum.toString().padStart(2, "0") +
            newValue.substring(Math.min(2, newValue.length));
        }
      }

      // Format with proper MM/DD/YYYY pattern
      let formatted = "";

      // Add month
      if (newValue.length >= 1) {
        formatted += newValue.substring(0, Math.min(2, newValue.length));
        if (newValue.length >= 3 && formatted.length === 1) {
          formatted = "0" + formatted; // Pad single digit month
        }
      }

      // Add day
      if (newValue.length > 2) {
        const monthNum = parseInt(formatted.substring(0, 2), 10);
        let maxDay = 31;

        // Adjust max days based on month
        if ([4, 6, 9, 11].includes(monthNum)) {
          maxDay = 30;
        } else if (monthNum === 2) {
          // Simple leap year check for February
          const yearPart =
            newValue.length >= 5
              ? parseInt(newValue.substring(4, 8), 10)
              : new Date().getFullYear();
          maxDay =
            (yearPart % 4 === 0 && yearPart % 100 !== 0) || yearPart % 400 === 0
              ? 29
              : 28;
        }

        let dayPart = newValue.substring(2, 4);
        const dayNum = parseInt(dayPart, 10);

        if (dayNum > maxDay) {
          dayPart = maxDay.toString().padStart(2, "0");
        }

        formatted += "/" + dayPart;
      }

      // Add year - only allow years from 1900 to current
      if (newValue.length > 4) {
        let yearPart = newValue.substring(4, Math.min(8, newValue.length));
        const currentYear = new Date().getFullYear();

        // If they've typed in a full year, validate it
        if (yearPart.length === 4) {
          const yearNum = parseInt(yearPart, 10);
          if (yearNum > currentYear) {
            yearPart = currentYear.toString();
          } else if (yearNum < 1900) {
            yearPart = "1900";
          }
        }

        formatted += "/" + yearPart;
      }

      setInputValue(formatted);

      // Parse and set the date if we have a complete valid date
      if (formatted.length === 10) {
        // MM/DD/YYYY format is 10 chars
        const parsed = parse(formatted, "MM/dd/yyyy", new Date());
        if (isValid(parsed)) {
          onChange(parsed);
        }
      }
    } else {
      setInputValue("");
      onChange(undefined);
    }
  };

  // Improved keyboard handling to allow normal editing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only clear if Escape is pressed or Ctrl+Backspace/Delete
    if (e.key === "Escape") {
      setInputValue("");
      onChange(undefined);
      e.preventDefault();
    }

    // Allow normal backspace and delete functionality
    // Do not prevent default behavior
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10 bg-white/5 border-white/10 text-white"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="absolute right-0 top-0 h-full px-3 bg-transparent border-0 hover:bg-transparent"
            >
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
              className="pointer-events-auto"
              fromYear={1900}
              toYear={new Date().getFullYear()}
              captionLayout="dropdown-buttons"
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
