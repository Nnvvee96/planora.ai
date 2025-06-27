import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RadioGroup } from '@/components/ui/radio-group';
import { Input } from '@/ui/atoms/Input';
import { Clock, Map } from 'lucide-react';
import { Control, UseFormSetValue } from 'react-hook-form';

interface TravelDurationStepProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  travelDuration: string;
  dateFlexibility: string | null;
  Label: React.ComponentType<{
    value: string;
    field: { value: string };
    children: React.ReactNode;
  }>;
}

const TravelDurationStep = ({ 
  control, 
  setValue, 
  travelDuration, 
  dateFlexibility,
  Label 
}: TravelDurationStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        How long and flexible are your trips?
      </h3>
      <p className="text-sm text-white/60">
        This helps us optimize your travel recommendations.
      </p>

      <div className="space-y-6 pt-4">
        <FormField
          control={control}
          name="travelDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center mb-2">
                <Clock className="mr-2 h-4 w-4 text-planora-accent-purple" />
                Typical Trip Duration
              </FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Clear custom date flexibility when changing duration
                    setValue("customDateFlexibility", "");
                  }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                >
                  <ToggleGroupItem
                    value="weekend"
                    className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple"
                  >
                    <div className="flex flex-col items-center">
                      <span>Weekend</span>
                      <span className="text-xs text-white/60">
                        2-3 days
                      </span>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="week"
                    className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple"
                  >
                    <div className="flex flex-col items-center">
                      <span>1 Week</span>
                      <span className="text-xs text-white/60">
                        7-9 days
                      </span>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="two-weeks"
                    className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple"
                  >
                    <div className="flex flex-col items-center">
                      <span>2 Weeks</span>
                      <span className="text-xs text-white/60">
                        12-16 days
                      </span>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="longer"
                    className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple"
                  >
                    <div className="flex flex-col items-center">
                      <span>Longer</span>
                      <span className="text-xs text-white/60">
                        Custom duration
                      </span>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {travelDuration === "longer" ? (
          <FormField
            control={control}
            name="customDateFlexibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center mb-2">
                  <Map className="mr-2 h-4 w-4 text-planora-accent-purple" />
                  Custom Date Range
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="e.g. 30-60 days"
                      {...field}
                      className="bg-white/5 border-white/10 text-white"
                      onChange={(e) => {
                        field.onChange(e);
                        // Set dateFlexibility to custom when typing in the custom field
                        setValue("dateFlexibility", "custom");
                      }}
                    />
                    <p className="text-xs text-white/60">
                      Enter your preferred travel duration range
                      (e.g., 14-21 days)
                    </p>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={control}
            name="dateFlexibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center mb-2">
                  <Map className="mr-2 h-4 w-4 text-planora-accent-purple" />
                  Date Flexibility
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Clear custom date flexibility when selecting a standard option
                      if (value !== "custom") {
                        setValue("customDateFlexibility", "");
                      }
                    }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <Label value="fixed" field={field}>
                      <div className="flex flex-col">
                        <span>Fixed Dates</span>
                        <span className="text-xs text-white/60">
                          No flexibility
                        </span>
                      </div>
                    </Label>
                    <Label value="flexible-few" field={field}>
                      <div className="flex flex-col">
                        <span>±3 Days</span>
                        <span className="text-xs text-white/60">
                          Slightly flexible
                        </span>
                      </div>
                    </Label>
                    <Label value="flexible-week" field={field}>
                      <div className="flex flex-col">
                        <span>±1 Week</span>
                        <span className="text-xs text-white/60">
                          Flexible
                        </span>
                      </div>
                    </Label>
                    <Label value="very-flexible" field={field}>
                      <div className="flex flex-col">
                        <span>Very Flexible</span>
                        <span className="text-xs text-white/60">
                          Open dates
                        </span>
                      </div>
                    </Label>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};

export { TravelDurationStep }; 