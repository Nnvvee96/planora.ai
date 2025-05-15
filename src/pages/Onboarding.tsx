import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import { useForm } from 'react-hook-form';
import GradientButton from '@/components/GradientButton';
import { 
  Plane, 
  Hotel, 
  Building, 
  Tent, 
  Palmtree, 
  Clock, 
  Map, 
  Compass, 
  Bed, 
  Coffee,
  Edit,
  Star,
  Check
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface OnboardingFormData {
  departureLocation: string;
  budgetRange: {min: number, max: number};
  budgetTolerance: number;
  travelDuration: string;
  dateFlexibility: string | null;
  customDateFlexibility?: string;
  planningIntent: string;
  accommodationTypes: string[];
  accommodationComfort: string[];
  locationPreference: string;
  flightType: string;
  preferCheaperWithStopover: boolean;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  const form = useForm<OnboardingFormData>({
    defaultValues: {
      departureLocation: 'Berlin, Germany', // Pre-filled from registration
      budgetRange: { min: 1000, max: 2000 },
      budgetTolerance: 10,
      travelDuration: 'week',
      dateFlexibility: 'flexible-few',
      customDateFlexibility: '',
      planningIntent: 'exploring',
      accommodationTypes: [],
      accommodationComfort: [],
      locationPreference: 'anywhere',
      flightType: 'direct',
      preferCheaperWithStopover: true,
    },
  });

  const totalSteps = 7;

  // Watch the travel duration to conditionally show custom date flexibility field
  const travelDuration = form.watch('travelDuration');

  const goToNextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Complete onboarding and go to dashboard
      console.log('Onboarding data:', form.getValues());
      toast({
        title: "Profile completed!",
        description: "Your travel preferences have been saved.",
      });
      navigate('/dashboard');
    }
  };

  const goToPreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Helper component for multi-select options
  const OptionItem = ({ 
    icon: Icon, 
    label, 
    value, 
    field, 
    onChange 
  }: { 
    icon: React.ElementType, 
    label: string, 
    value: string,
    field: string[],
    onChange: (value: string) => void
  }) => {
    const isSelected = field.includes(value);
    
    return (
      <div 
        className={`flex flex-col items-center p-4 rounded-lg border ${
          isSelected 
            ? 'border-planora-accent-purple bg-planora-accent-purple/20' 
            : 'border-white/10 bg-white/5 hover:bg-white/10'
        } cursor-pointer transition-all`}
        onClick={() => onChange(value)}
      >
        <Icon className={`h-8 w-8 mb-2 ${isSelected ? 'text-planora-accent-purple' : 'text-white/70'}`} />
        <span className={`text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>{label}</span>
        {isSelected && <Check className="h-4 w-4 text-planora-accent-purple mt-2" />}
      </div>
    );
  };

  // Helper function to toggle selections in arrays
  const toggleSelection = (field: string[], value: string): string[] => {
    if (field.includes(value)) {
      return field.filter(item => item !== value);
    } else {
      return [...field, value];
    }
  };

  const formatBudgetRange = (min: number, max: number) => `€${min} - €${max}`;
  const formatBudgetTolerance = (value: number) => `±${value}%`;

  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-planora-accent-blue/10 via-background to-background"></div>
      
      {/* Logo */}
      <div className="mb-6 z-10">
        <Logo />
      </div>
      
      <Card className="w-full max-w-2xl z-10 bg-card/50 backdrop-blur-lg border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Complete Your Travel Profile</CardTitle>
          <CardDescription className="text-center text-white/60">
            Help us personalize your experience
          </CardDescription>
          
          {/* Progress bar */}
          <div className="mt-4 flex justify-between items-center">
            <Progress 
              value={((step + 1) / totalSteps) * 100}
              className="h-2 w-full bg-white/10"
            />
            <span className="ml-4 text-sm text-white/60">{step + 1}/{totalSteps}</span>
          </div>
        </CardHeader>
        
        <CardContent className="py-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              
              {/* Step 1: Budget Range Selection */}
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">What's your budget range?</h3>
                  <p className="text-sm text-white/60">We'll use this to recommend suitable options.</p>
                  
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem className="pt-4">
                        <div className="space-y-8">
                          {/* Category buttons */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange({ min: 500, max: 1000 })}
                              className={`p-4 border rounded-lg text-center ${
                                field.value.min === 500 && field.value.max === 1000
                                  ? 'border-planora-accent-purple bg-planora-accent-purple/20 text-white'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold">Budget</div>
                              <div className="text-sm mt-1">€500 - €1000</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange({ min: 1000, max: 2000 })}
                              className={`p-4 border rounded-lg text-center ${
                                field.value.min === 1000 && field.value.max === 2000
                                  ? 'border-planora-accent-purple bg-planora-accent-purple/20 text-white'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold">Standard</div>
                              <div className="text-sm mt-1">€1000 - €2000</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange({ min: 2000, max: 3500 })}
                              className={`p-4 border rounded-lg text-center ${
                                field.value.min === 2000 && field.value.max === 3500
                                  ? 'border-planora-accent-purple bg-planora-accent-purple/20 text-white'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold">Premium</div>
                              <div className="text-sm mt-1">€2000 - €3500</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange({ min: 3500, max: 10000 })}
                              className={`p-4 border rounded-lg text-center ${
                                field.value.min === 3500 && field.value.max === 10000
                                  ? 'border-planora-accent-purple bg-planora-accent-purple/20 text-white'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold">Luxury</div>
                              <div className="text-sm mt-1">€3500+</div>
                            </button>
                          </div>
                          
                          {/* Current selection indicator */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-planora-accent-purple">
                              {formatBudgetRange(field.value.min, field.value.max)}
                            </div>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Step 2: Budget Tolerance */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">How flexible is your budget?</h3>
                  <p className="text-sm text-white/60">Select your tolerance for price variations.</p>
                  
                  <FormField
                    control={form.control}
                    name="budgetTolerance"
                    render={({ field }) => (
                      <FormItem className="pt-8">
                        <FormControl>
                          <div className="space-y-6">
                            <Slider
                              min={0}
                              max={25}
                              step={5}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              className="w-full"
                            />
                            <div className="text-center">
                              <div className="text-2xl font-bold text-planora-accent-purple">
                                {formatBudgetTolerance(field.value)}
                              </div>
                              <div className="flex justify-between text-xs text-white/60 mt-2">
                                <span>Fixed Budget</span>
                                <span>Very Flexible</span>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Step 3: Travel Duration & Date Flexibility */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">How long and flexible are your trips?</h3>
                  <p className="text-sm text-white/60">This helps us optimize your travel recommendations.</p>
                  
                  <div className="space-y-6 pt-4">
                    <FormField
                      control={form.control}
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
                                // Reset dateFlexibility if longer is selected
                                if (value === 'longer') {
                                  form.setValue('dateFlexibility', null);
                                } else if (!form.getValues('dateFlexibility')) {
                                  form.setValue('dateFlexibility', 'flexible-few');
                                }
                              }}
                              className="grid grid-cols-2 md:grid-cols-4 gap-2"
                            >
                              <ToggleGroupItem value="weekend" className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple">
                                Weekend
                              </ToggleGroupItem>
                              <ToggleGroupItem value="week" className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple">
                                1 Week
                              </ToggleGroupItem>
                              <ToggleGroupItem value="two-weeks" className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple">
                                2 Weeks
                              </ToggleGroupItem>
                              <ToggleGroupItem value="longer" className="bg-white/5 border border-white/10 data-[state=on]:bg-planora-accent-purple/20 data-[state=on]:border-planora-accent-purple">
                                Longer
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {travelDuration === 'longer' ? (
                      <FormField
                        control={form.control}
                        name="customDateFlexibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center mb-2">
                              <Map className="mr-2 h-4 w-4 text-planora-accent-purple" />
                              Custom Date Range (in days)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="text"
                                placeholder="e.g. 30-60 days" 
                                {...field}
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="dateFlexibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center mb-2">
                              <Map className="mr-2 h-4 w-4 text-planora-accent-purple" />
                              Date Flexibility
                            </FormLabel>
                            <FormControl>
                              <RadioGroup 
                                value={field.value || ''}
                                onValueChange={field.onChange} 
                                className="grid grid-cols-2 gap-2"
                              >
                                <Label value="fixed" field={field}>Fixed Dates</Label>
                                <Label value="flexible-few" field={field}>±3 Days</Label>
                                <Label value="flexible-week" field={field}>±1 Week</Label>
                                <Label value="very-flexible" field={field}>Very Flexible</Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Planning Intent */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Are you dreaming or planning?</h3>
                  <p className="text-sm text-white/60">This helps us tailor our recommendations to your needs.</p>
                  
                  <FormField
                    control={form.control}
                    name="planningIntent"
                    render={({ field }) => (
                      <FormItem className="pt-4">
                        <FormControl>
                          <RadioGroup 
                            value={field.value}
                            onValueChange={field.onChange} 
                            className="grid grid-cols-1 gap-4"
                          >
                            <div 
                              className={`p-4 border rounded-lg flex items-start space-x-4 ${
                                field.value === "exploring" 
                                  ? 'border-planora-accent-purple bg-planora-accent-purple/20' 
                                  : 'border-white/10 bg-white/5'
                              }`}
                            >
                              <RadioGroupItem value="exploring" id="exploring" className="mt-1" />
                              <div>
                                <label htmlFor="exploring" className="font-medium cursor-pointer">Just exploring ideas</label>
                                <p className="text-sm text-white/70 mt-1">I'm gathering inspiration for future travel possibilities</p>
                              </div>
                            </div>
                            <div 
                              className={`p-4 border rounded-lg flex items-start space-x-4 ${
                                field.value === "planning" 
                                  ? 'border-planora-accent-purple bg-planora-accent-purple/20' 
                                  : 'border-white/10 bg-white/5'
                              }`}
                            >
                              <RadioGroupItem value="planning" id="planning" className="mt-1" />
                              <div>
                                <label htmlFor="planning" className="font-medium cursor-pointer">Ready to plan a trip</label>
                                <p className="text-sm text-white/70 mt-1">I have specific dates and destinations in mind</p>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Step 5: Accommodation Types (Multi-select) */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Where do you prefer to stay?</h3>
                  <p className="text-sm text-white/60">Select all that apply. We'll prioritize these in our recommendations.</p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <FormField
                      control={form.control}
                      name="accommodationTypes"
                      render={({ field }) => (
                        <>
                          <OptionItem 
                            icon={Hotel} 
                            label="Hotel" 
                            value="hotel"
                            field={field.value} 
                            onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                          />
                          <OptionItem 
                            icon={Building} 
                            label="Apartment" 
                            value="apartment"
                            field={field.value} 
                            onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                          />
                          <OptionItem 
                            icon={Tent} 
                            label="Hostel" 
                            value="hostel"
                            field={field.value} 
                            onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                          />
                          <OptionItem 
                            icon={Palmtree} 
                            label="Resort" 
                            value="resort"
                            field={field.value} 
                            onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Accommodation Comfort & Preferences */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-medium">What are your accommodation preferences?</h3>
                    <p className="text-sm text-white/60 mb-4">Select all that apply.</p>
                    
                    <FormField
                      control={form.control}
                      name="accommodationComfort"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-2">
                              <CheckboxCard 
                                label="Private Room" 
                                value="private-room" 
                                field={field.value}
                                onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                              />
                              <CheckboxCard 
                                label="Shared Room OK" 
                                value="shared-room" 
                                field={field.value}
                                onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                              />
                              <CheckboxCard 
                                label="Private Bathroom" 
                                value="private-bathroom" 
                                field={field.value}
                                onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                              />
                              <CheckboxCard 
                                label="Shared Bathroom OK" 
                                value="shared-bathroom" 
                                field={field.value}
                                onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                              />
                              <CheckboxCard 
                                label="Luxury preferred" 
                                value="luxury" 
                                field={field.value}
                                onChange={(value) => field.onChange(toggleSelection(field.value, value))}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-lg font-medium">Preferred distance from city center?</h3>
                    <p className="text-sm text-white/60 mb-4">Choose your location preference.</p>
                    
                    <FormField
                      control={form.control}
                      name="locationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              value={field.value}
                              onValueChange={field.onChange} 
                              className="grid grid-cols-2 gap-2"
                            >
                              <Label value="center" field={field}>City Center</Label>
                              <Label value="near" field={field}>Near Center (1-3km)</Label>
                              <Label value="outskirts" field={field}>Outskirts (3-10km)</Label>
                              <Label value="anywhere" field={field}>Location Not Important</Label>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {/* Step 7: Flight Preferences */}
              {step === 6 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-medium">What are your flight preferences?</h3>
                    <p className="text-sm text-white/60 mb-4">Help us find the best flight options for you.</p>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="flightType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center mb-2">
                              <Plane className="mr-2 h-4 w-4 text-planora-accent-purple" />
                              Flight Type
                            </FormLabel>
                            <FormControl>
                              <RadioGroup 
                                value={field.value}
                                onValueChange={field.onChange} 
                                className="grid grid-cols-2 gap-2"
                              >
                                <Label value="direct" field={field}>Direct Only</Label>
                                <Label value="any" field={field}>Stopovers OK</Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="preferCheaperWithStopover"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-start space-x-3 p-3 border rounded-md bg-white/5 border-white/10">
                              <input 
                                type="checkbox"
                                id="cheaperStopover"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="mt-1"
                              />
                              <div>
                                <label htmlFor="cheaperStopover" className="font-medium cursor-pointer">Show significantly cheaper stopovers</label>
                                <p className="text-sm text-white/70 mt-1">We'll show you flights with stopovers if they're more than 25% cheaper</p>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Compass className="mr-2 h-4 w-4 text-planora-accent-purple" />
                      Almost done!
                    </h4>
                    <p className="text-sm text-white/70">
                      Just one more step - let us know your departure location.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Final Step (was Step 1): Departure Location (Moved to end) */}
              {step === totalSteps - 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Your Departure Location</h3>
                  <p className="text-sm text-white/60">This helps us find suitable routes for your trips.</p>
                  
                  <FormField
                    control={form.control}
                    name="departureLocation"
                    render={({ field }) => (
                      <FormItem className="pt-4">
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Plane className="mr-2 h-4 w-4 text-planora-accent-purple" />
                              <FormLabel>Departure City</FormLabel>
                            </div>
                            <div className="flex items-center">
                              <Input 
                                placeholder="e.g., London" 
                                {...field} 
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <p className="text-xs text-white/60 mt-1">
                              Pre-filled from your profile. You can change it here for your travel preferences.
                            </p>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <div className="flex justify-between pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={goToPreviousStep}
                  disabled={step === 0}
                  className="border-white/10 bg-white/5 text-white disabled:opacity-50"
                >
                  Back
                </Button>
                <GradientButton onClick={goToNextStep} type="button">
                  {step === totalSteps - 1 ? 'Complete' : 'Next'}
                </GradientButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
const Label = ({ value, field, children }: { value: string, field: { value: string }, children: React.ReactNode }) => (
  <div 
    className={`p-3 border rounded-md text-center ${
      field.value === value 
        ? 'border-planora-accent-purple bg-planora-accent-purple/20 text-white' 
        : 'border-white/10 bg-white/5 text-white/70'
    }`}
  >
    <RadioGroupItem value={value} id={value} className="hidden" />
    <label htmlFor={value} className="cursor-pointer block w-full h-full">
      {children}
    </label>
  </div>
);

const CheckboxCard = ({ 
  label, 
  value, 
  field, 
  onChange 
}: { 
  label: string, 
  value: string, 
  field: string[], 
  onChange: (value: string) => void 
}) => {
  const isSelected = field.includes(value);
  
  return (
    <div 
      className={`p-3 border rounded-md text-center cursor-pointer ${
        isSelected 
          ? 'border-planora-accent-purple bg-planora-accent-purple/20 text-white' 
          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
      }`}
      onClick={() => onChange(value)}
    >
      {label}
      {isSelected && <Check className="h-3 w-3 inline-block ml-1 text-planora-accent-purple" />}
    </div>
  );
};

export default Onboarding;
