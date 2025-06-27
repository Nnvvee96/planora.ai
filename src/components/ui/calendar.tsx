import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./variants/buttonVariants";
import { Select } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center gap-1",
        caption_label: "text-sm font-medium hidden", // Hide default label as we'll use dropdowns
        caption_dropdowns: "flex gap-1 text-sm", // New dropdown container
        dropdown_month: "flex-1", // Month dropdown
        dropdown_year: "flex-1", // Year dropdown
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ value, onChange, children, ...dropdownProps }) => {
          const { fromYear, toYear } = useDayPicker();

          if (dropdownProps.name === "months") {
            const monthOptions = [
              { value: "0", label: "January" },
              { value: "1", label: "February" },
              { value: "2", label: "March" },
              { value: "3", label: "April" },
              { value: "4", label: "May" },
              { value: "5", label: "June" },
              { value: "6", label: "July" },
              { value: "7", label: "August" },
              { value: "8", label: "September" },
              { value: "9", label: "October" },
              { value: "10", label: "November" },
              { value: "11", label: "December" },
            ];

            return (
              <Select
                value={value?.toString()}
                options={monthOptions}
                className="w-[110px]"
                onValueChange={(newValue) => {
                  if (onChange) {
                    // Create a synthetic event that mimics the expected behavior
                    const syntheticEvent = {
                      target: {
                        value: newValue,
                      },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onChange(syntheticEvent);
                  }
                }}
              />
            );
          }

          if (dropdownProps.name === "years") {
            const fromYearActual = fromYear || 1900;
            const toYearActual = toYear || new Date().getFullYear();

            const years = Array.from(
              { length: toYearActual - fromYearActual + 1 },
              (_, i) => toYearActual - i,
            );

            const yearOptions = years.map((year) => ({
              value: year.toString(),
              label: year.toString(),
            }));

            return (
              <Select
                value={value?.toString()}
                options={yearOptions}
                className="w-[80px]"
                onValueChange={(newValue) => {
                  if (onChange) {
                    // Create a synthetic event that mimics the expected behavior
                    const syntheticEvent = {
                      target: {
                        value: newValue,
                      },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onChange(syntheticEvent);
                  }
                }}
              />
            );
          }

          return <>{children}</>;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
