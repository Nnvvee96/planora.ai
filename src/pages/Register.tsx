
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/atoms/Card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { Logo } from '@/ui/atoms/Logo';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GradientButton } from '@/ui/atoms/GradientButton';
import { Apple, Shield, CheckCircle, User, Mail, Lock, MapPin, Calendar, Loader2 } from 'lucide-react';
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { Footer } from '@/ui/organisms/Footer';
import { useToast } from "@/components/ui/use-toast";
// Import types directly from types directory
import { RegisterData } from "@/features/auth/types/authTypes";
// Import factory function for auth service
import { getAuthService, AuthService } from "@/features/auth/authApi";
// Import verification dialog
import { VerificationDialog } from '@/features/auth/components/VerificationDialog';
// Import auth hook
import { useAuth } from '@/features/auth/hooks/useAuth';

// List of countries for the dropdown
const countries = [
  "United States", "United Kingdom", "Canada", "Germany", "France", 
  "Spain", "Italy", "Australia", "Japan", "India", "Brazil"
];

const countryOptions = countries.map(country => ({ value: country, label: country }));

// Calculate minimum birthdate (16 years ago from today)
const today = new Date();
const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  country: z.string().min(1, { message: 'Please select your country' }),
  city: z.string().min(2, { message: 'Please enter your city' }),
  birthdate: z.date({
    required_error: "Please select your birthdate.",
  }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine((data) => {
  // Check if user is at least 16 years old
  return data.birthdate <= sixteenYearsAgo;
}, {
  message: "You must be at least 16 years old to use Planora",
  path: ["birthdate"],
});

type FormValues = z.infer<typeof formSchema>;

function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAuthService } = useAuth();
  const [authService, setAuthService] = useState<AuthService | null>(null);
  
  // Load auth service on component mount
  useEffect(() => {
    setAuthService(getAuthService());
  }, [getAuthService]);
  const [formStep, setFormStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      city: '',
    },
  });

  // State for verification dialog and user registration
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState('');
  
  const onSubmit = async (data: FormValues) => {
    if (formStep < 1) {
      setFormStep(1);
      return;
    }
    
    // Process registration for final step
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate age again on submit
      if (data.birthdate > sixteenYearsAgo) {
        throw new Error('You must be at least 16 years old to use Planora');
      }
      
      // Use the provided first and last name directly
      // Prepare registration data following our auth feature type
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        username: data.email.split('@')[0], // Default username from email
        firstName: data.firstName,
        lastName: data.lastName
      };
      
      // Add metadata for city, country, and birthdate
      registerData.metadata = {
        city: data.city,
        country: data.country,
        birthdate: data.birthdate.toISOString()
      };
      
      // Register user through enhanced auth service
      const registrationResult = await authService.register(registerData);
      
      if (!registrationResult.user) {
        throw new Error('Registration failed - no user was created');
      }
      
      // Store user information for verification
      setRegisteredEmail(data.email);
      setRegisteredUserId(registrationResult.user.id);
      
      // Send verification code
      const codeResult = await authService.sendVerificationCode(
        registrationResult.user.id,
        data.email
      );
      
      if (!codeResult.success) {
        throw new Error(codeResult.error || 'Failed to send verification code');
      }
      
      // Show verification dialog
      setShowVerification(true);
      toast({
        title: "Registration successful",
        description: "Please check your email for a verification code to complete your registration.",
      });
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col">
      {/* Enhanced background with interactive elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-planora-accent-purple/30 via-background to-background"></div>
        
        {/* Animated circles for visual interest */}
        <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-planora-accent-purple/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-planora-accent-blue/10 blur-3xl animate-pulse-slow-reverse"></div>
        
        {/* Digital grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>
      
      {/* Verification Dialog */}
      <VerificationDialog
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        email={registeredEmail}
        userId={registeredUserId}
        onVerify={(success) => {
          if (success) {
            toast({
              title: "Email verified successfully",
              description: "Your account has been created. Redirecting to dashboard...",
            });
            navigate('/dashboard');
          }
        }}
        onResend={async () => {
          if (authService && registeredUserId && registeredEmail) {
            await authService.sendVerificationCode(registeredUserId, registeredEmail);
          }
        }}
      />
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Logo with animation */}
        <div className="mb-8 z-10 transform transition-all duration-700 hover:scale-105">
          <Logo href="/" className="h-14 w-auto" />
        </div>
        
        <Card className="w-full max-w-md z-10 bg-card/40 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-300 hover:border-white/20 hover:shadow-planora-accent-purple/10">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-white/70 text-base">
              Join Planora and start planning your intelligent journeys
            </CardDescription>
            {/* Modern step indicators */}
            <div className="flex justify-center space-x-3 pt-2">
              <div className={`h-1.5 w-20 rounded-full transition-all duration-300 ${formStep === 0 ? 'bg-gradient-to-r from-planora-accent-purple to-planora-accent-blue' : 'bg-white/20'}`}></div>
              <div className={`h-1.5 w-20 rounded-full transition-all duration-300 ${formStep === 1 ? 'bg-gradient-to-r from-planora-accent-purple to-planora-accent-blue' : 'bg-white/20'}`}></div>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500">
                {error}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {formStep === 0 ? (
                  <>
                    {/* Split into Last Name and First Name fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-planora-accent-purple/80" />
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                {...field} 
                                className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
                              />
                            </FormControl>
                            <FormMessage className="text-planora-accent-pink" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-planora-accent-purple/80" />
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                {...field} 
                                className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
                              />
                            </FormControl>
                            <FormMessage className="text-planora-accent-pink" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-planora-accent-purple/80" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage className="text-planora-accent-pink" />
                        </FormItem>
                      )}
                    />
                    
                    {/* Security Information Section */}
                    <div className="space-y-4 pt-2">
                      <div className="text-sm text-white/70 font-medium flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5 text-planora-accent-purple/80" />
                        Security Information
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                  className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <FormMessage className="text-planora-accent-pink" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80">Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                  className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <FormMessage className="text-planora-accent-pink" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Location Information Section */}
                    <div className="space-y-4 pt-2">
                      <div className="text-sm text-white/70 font-medium flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-planora-accent-purple/80" />
                        Location Information
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {/* Country and City fields in full width layout for consistency */}
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-white/80">Country</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                options={countryOptions}
                                className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 w-full"
                              />
                              <FormMessage className="text-planora-accent-pink" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="text-white/80">City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="New York" 
                                  {...field} 
                                  className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300 w-full"
                                />
                              </FormControl>
                              <FormMessage className="text-planora-accent-pink" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Date of Birth field with DatePickerInput */}
                    <div className="space-y-4 pt-2">
                      <div className="text-sm text-white/70 font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-planora-accent-purple/80" />
                        Date of Birth
                      </div>
                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80">Date of Birth</FormLabel>
                            <FormControl>
                              <DatePickerInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="MM / DD / YYYY"
                                className="w-full bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
                              />
                            </FormControl>
                            <FormMessage className="text-planora-accent-pink" />
                            <div className="text-xs text-white/50 mt-1">You must be at least 16 years old to use Planora</div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Review Information Section */}
                    <div className="bg-planora-accent-purple/10 border border-planora-accent-purple/20 rounded-xl p-4 text-white/80 mt-4">
                      <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-planora-accent-purple" />
                        Review Your Information
                      </h3>
                      <p className="text-sm mb-3">Please confirm your account details before creating your account.</p>
                      
                      {/* Account Summary */}
                      <div className="mb-4 p-3 bg-white/5 rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                          <div>
                            <div className="text-white/50 mb-1">Name</div>
                            <div>{form.getValues().firstName} {form.getValues().lastName}</div>
                          </div>
                          <div>
                            <div className="text-white/50 mb-1">Email</div>
                            <div>{form.getValues().email}</div>
                          </div>
                          <div>
                            <div className="text-white/50 mb-1">Location</div>
                            <div>{form.getValues().city}, {form.getValues().country}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-white/70">
                        <p>By signing up, you agree to our <Link to="#" className="text-planora-accent-purple hover:underline transition-colors">Terms of Service</Link> and <Link to="#" className="text-planora-accent-purple hover:underline transition-colors">Privacy Policy</Link>.</p>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-4">
                  {formStep === 0 ? (
                    <Button 
                      className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 text-white font-medium py-5" 
                      type="submit"
                    >
                      Continue
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setFormStep(0)}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 text-white font-medium" 
                        type="submit" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Processing...
                          </>
                        ) : "Create Account"}
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
            <div className="w-full flex items-center gap-3">
              <div className="h-px bg-white/10 flex-grow"></div>
              <span className="text-xs text-white/40">or continue with</span>
              <div className="h-px bg-white/10 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Google authentication button */}
              <Button 
                variant="outline" 
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center transition-colors"
                disabled={isSubmitting}
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    await authService.signInWithGoogle();
                    // The page will be redirected by Supabase, no need to navigate
                  } catch (err) {
                    console.error('Google sign-in error:', err);
                    const errorMessage = err instanceof Error ? err.message : "Please try again.";
                    toast({
                      title: "Google sign-in failed",
                      description: errorMessage,
                      variant: "destructive"
                    });
                    setIsSubmitting(false);
                  }
                }}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
                </svg>
                <span>Google</span>
              </Button>
              
              {/* Apple authentication button (coming soon) */}
              <Button 
                variant="outline" 
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center transition-colors"
                disabled={isSubmitting || import.meta.env.VITE_ENABLE_APPLE_AUTH !== 'true'}
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Apple sign-in will be available soon.",
                  });
                }}
              >
                <Apple className="h-4 w-4" />
                <span>Apple</span>
              </Button>
            </div>
            
            <div className="text-center text-sm text-white/60 mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-planora-accent-purple hover:underline transition-colors">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Footer */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export { Register };
