import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/ui/atoms/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/atoms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/authApi";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { GradientButton } from "@/ui/atoms/GradientButton";
import { getCityOptions, isCustomCityNeeded, type CityOption } from "@/features/location-data/locationDataApi";

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(1, "Please select your city"),
  customCity: z.string().optional(),
  birthdate: z.date({
    required_error: "Please select your birth date",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const sixteenYearsAgo = new Date();
sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "au", label: "Australia" },
  { value: "other", label: "Other" },
];

export const Register = () => {
  const navigate = useNavigate();
  
  const { authService, signInWithGoogle } = useAuth();
  const [formStep, setFormStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      city: "",
      customCity: "",
    },
  });

  const selectedCountry = form.watch("country");
  const selectedCity = form.watch("city");

  useEffect(() => {
    if (selectedCountry) {
      const options = getCityOptions(selectedCountry);
      setCityOptions(options);
      form.setValue("city", "");
      setShowCustomCityInput(false);
    }
  }, [selectedCountry, form]);

  useEffect(() => {
    if (selectedCity) {
      setShowCustomCityInput(isCustomCityNeeded(selectedCity));
      if (!isCustomCityNeeded(selectedCity)) {
        form.setValue("customCity", "");
      }
    }
  }, [selectedCity, form]);

  const onSubmit = async (data: FormValues) => {
    if (formStep === 0) {
      setFormStep(1);
      return;
    }

    try {
      setIsSubmitting(true);

      // Validate age
      if (data.birthdate > sixteenYearsAgo) {
        throw new Error("You must be at least 16 years old to use Planora");
      }

      // Prepare user metadata
      const metadata = {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        city: isCustomCityNeeded(data.city) && data.customCity ? data.customCity : data.city,
        birthdate: data.birthdate.toISOString(),
      };

      // Register user with simplified auth service
      const { user, emailConfirmationRequired } = await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        metadata,
      });

      if (!user) {
        throw new Error("Registration failed. Please try again.");
      }

      if (emailConfirmationRequired) {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account before signing in.",
          variant: "default",
        });

        // Redirect to login page with success message
        navigate("/login", { 
          state: { 
            message: "Registration successful! Please check your email to verify your account before signing in." 
          } 
        });
      } else {
        // User is already verified (shouldn't happen with email confirmation enabled)
        toast({
          title: "Registration Successful!",
          description: "Welcome to Planora! Redirecting to onboarding...",
          variant: "default",
        });
        navigate("/onboarding");
      }

    } catch {
      toast({
        title: "Registration failed",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast({
        title: "Google Sign Up Failed",
        description: "Please try again or use email registration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-planora-background via-planora-background to-planora-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              {formStep === 0 ? "Create Your Account" : "Review & Complete"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {formStep === 0 
                ? "Join Planora and start planning amazing trips"
                : "Review your information and create your account"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {formStep === 0 ? (
                  // Step 1: Personal Information
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                                placeholder="John"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                                placeholder="Doe"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                              placeholder="john@example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple pr-10"
                                placeholder="••••••••"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple pr-10"
                                placeholder="••••••••"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Country</FormLabel>
                            <FormControl>
                              <Select
                                options={countryOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                                placeholder="Select country"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">City</FormLabel>
                            <FormControl>
                              <Select
                                options={cityOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                                placeholder={selectedCountry ? "Select city" : "Select country first"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {showCustomCityInput && (
                      <FormField
                        control={form.control}
                        name="customCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">Custom City</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                                placeholder="Enter your city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Birth Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple"
                              max={sixteenYearsAgo.toISOString().split('T')[0]}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <GradientButton className="w-full" type="submit">
                      Continue to Review
                    </GradientButton>
                  </>
                ) : (
                  // Step 2: Review and Submit
                  <>
                    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-lg font-semibold text-white">Review Your Information</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="text-white">{form.getValues("firstName")} {form.getValues("lastName")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-white">{form.getValues("email")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="text-white">
                            {isCustomCityNeeded(form.getValues("city")) && form.getValues("customCity") 
                              ? form.getValues("customCity") 
                              : form.getValues("city")}, {form.getValues("country")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Birth Date:</span>
                          <span className="text-white">{form.getValues("birthdate")?.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setFormStep(0)}
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Edit
                      </Button>
                      <GradientButton
                        className="flex-1"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </GradientButton>
                    </div>
                  </>
                )}
              </form>
            </Form>

            {formStep === 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/30 px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  onClick={handleGoogleSignUp}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-planora-accent-purple hover:text-planora-accent-pink transition-colors"
                      onClick={() => navigate("/login")}
                    >
                      Sign in
                    </button>
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
