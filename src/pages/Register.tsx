import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/atoms/Button';
import { GradientButton } from '@/ui/atoms/GradientButton';
import { Input } from '@/ui/atoms/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/atoms/Card';
import { Label } from '@/ui/atoms/Label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import { Logo } from '@/ui/atoms/Logo';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  User,
  Lock,
  MapPin,
  Calendar,
  ShieldCheck,
  Apple,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { Footer } from '@/ui/organisms/Footer';
import { useToast } from "@/components/ui/use-toast";
import {
  useAuth,
  type InitiateSignupResponse,
  type CompleteSignupPayload,
} from "@/features/auth/authApi";
import { 
  countryOptions, 
  getCityOptions, 
  isCustomCityNeeded,
  type CityOption 
} from "@/features/location-data/locationDataApi";

const today = new Date();
const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  country: z.string().min(1, { message: 'Please select your country' }),
  city: z.string().min(1, { message: 'Please select your city' }),
  customCity: z.string().optional(),
  birthdate: z.date({
    required_error: "Please select your birthdate.",
  }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine((data) => {
  return data.birthdate <= sixteenYearsAgo;
}, {
  message: "You must be at least 16 years old to use Planora",
  path: ["birthdate"],
});

type FormValues = z.infer<typeof formSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authService, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupPhase, setSignupPhase] = useState<'details' | 'verify'>('details');
  const [pendingRegistrationData, setPendingRegistrationData] = useState<FormValues | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationErrorText, setVerificationErrorText] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);
  
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
      customCity: '',
    },
  });

  const selectedCountry = form.watch('country');
  const selectedCity = form.watch('city');
  
  useEffect(() => {
    if (selectedCountry) {
      const options = getCityOptions(selectedCountry);
      setCityOptions(options);
      form.setValue('city', '');
      setShowCustomCityInput(false);
    }
  }, [selectedCountry, form]);
  
  useEffect(() => {
    if (selectedCity) {
      setShowCustomCityInput(isCustomCityNeeded(selectedCity));
      if (!isCustomCityNeeded(selectedCity)) {
        form.setValue('customCity', '');
      }
    }
  }, [selectedCity, form]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const initiateResponse = await authService.initiateSignup(data.email, data.password);

      if (initiateResponse.success) {
        setPendingRegistrationData(data);
        setSignupPhase('verify');
        setError(null);
        toast({
          title: "Verification Code Sent",
          description: initiateResponse.message || "A code has been sent to your email. Please check your inbox.",
        });
      } else {
        const errorMessage = initiateResponse.error || initiateResponse.details || 'Failed to initiate signup. Please try again.';
        console.error('Initiate signup failed:', errorMessage, 'Full response:', initiateResponse);
        setError(errorMessage);
        toast({
          title: "Signup Initiation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err: any) {
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

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRegistrationData) {
      setVerificationErrorText("Error: No pending registration data found. Please start over.");
      toast({
        title: "Verification Error",
        description: "Missing registration data. Please try registering again.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationErrorText(null);

    const payload: CompleteSignupPayload = {
      email: pendingRegistrationData.email,
      code: verificationCode,
      password_raw: pendingRegistrationData.password, 
      firstName: pendingRegistrationData.firstName,
      lastName: pendingRegistrationData.lastName,
      metadata: {
        country: pendingRegistrationData.country,
        city: isCustomCityNeeded(pendingRegistrationData.city) && pendingRegistrationData.customCity 
          ? pendingRegistrationData.customCity
          : pendingRegistrationData.city,
        birthdate: pendingRegistrationData.birthdate.toISOString(),
      }
    };

    try {
      const completeResponse = await authService.completeSignup(payload);

      if (completeResponse.success) {
        toast({
          title: "Signup Almost Complete!",
          description: "Finalizing your account and logging you in...",
        });

        const signInResponse = await authService.signInWithPassword({
          email: pendingRegistrationData.email,
          password: pendingRegistrationData.password,
        });

        if (signInResponse.error) {
          console.error('Auto sign-in failed after signup:', signInResponse.error);
          setVerificationErrorText(`Account created, but auto-login failed: ${signInResponse.error.message}. Please try logging in manually.`);
          toast({
            title: "Login Required",
            description: `Account created, but auto-login failed. Please log in.`, 
            variant: "destructive",
          });
          navigate('/login');
        } else {
          toast({
            title: "Signup Successful!",
            description: "Welcome to Planora! Taking you to onboarding...",
          });
          navigate('/onboarding');
        }
      } else {
        const errorMsg = completeResponse.error || completeResponse.details || "Invalid or expired verification code.";
        setVerificationErrorText(errorMsg);
        toast({
          title: "Verification Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Verification submission error:', err);
      const errorMsg = err.message || "An unexpected error occurred during verification.";
      setVerificationErrorText(errorMsg);
      toast({
        title: "Verification Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingRegistrationData) {
      toast({
        title: "Error",
        description: "Cannot resend code, previous registration data not found.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsResendingCode(true);
      setError(null);
      const initiateResponse = await authService.initiateSignup(pendingRegistrationData.email, pendingRegistrationData.password);
      if (initiateResponse.success) {
        toast({
          title: "Verification Code Resent",
          description: initiateResponse.message || "A new code has been sent to your email.",
        });
      } else {
        const errorMsg = initiateResponse.error || initiateResponse.details || "Failed to resend code.";
        setError(errorMsg);
        toast({
          title: "Resend Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred while resending code.";
      setError(errorMsg);
      toast({
        title: "Resend Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-planora-accent-purple/30 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-planora-accent-blue/30 to-transparent rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDYwIDMwIEwgMzAgNjAgTSAzMCAwIEwgMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>
      
      <header className="py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-start">
          <Logo href="/" className="h-14 w-auto" />
        </div>
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-lg z-10 bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-planora-accent-purple/20">
          <CardHeader className="space-y-3 pb-6">
            {signupPhase === 'details' ? (
              <>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  Create Your Planora Account
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Start by telling us about yourself.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Enter the 6-digit code sent to {pendingRegistrationData?.email || 'your email'}.
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="grid gap-6">
            {signupPhase === 'details' ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel className="text-white/80 flex items-center gap-1"><User className="h-3.5 w-3.5 text-planora-accent-purple/80" />Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"/></FormControl><FormMessage className="text-planora-accent-pink" /></FormItem>
                          )}/>
                          <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel className="text-white/80 flex items-center gap-1"><User className="h-3.5 w-3.5 text-planora-accent-purple/80" />First Name</FormLabel><FormControl><Input placeholder="John" {...field} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"/></FormControl><FormMessage className="text-planora-accent-pink" /></FormItem>
                          )}/>
                        </div>
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel className="text-white/80 flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-planora-accent-purple/80" />Email</FormLabel><FormControl><Input placeholder="your@email.com" {...field} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300" autoComplete="email"/></FormControl><FormMessage className="text-planora-accent-pink" /></FormItem>
                        )}/>
                        <div className="space-y-4 pt-2">
                          <div className="text-sm text-white/70 font-medium flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-planora-accent-purple/80" />Security Information</div>
                          <div className="space-y-4">
                            <FormField control={form.control} name="password" render={({ field }) => (
                              <FormItem className="relative"><FormLabel className="text-white/80">Password</FormLabel><FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300 pr-10" autoComplete="new-password"/></FormControl><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-white/50 hover:text-white/70"><span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button><FormMessage className="text-planora-accent-pink" /></FormItem>
                            )}/>
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                              <FormItem className="relative"><FormLabel className="text-white/80">Confirm Password</FormLabel><FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300 pr-10" autoComplete="new-password"/></FormControl><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-white/50 hover:text-white/70"><span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>{showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button><FormMessage className="text-planora-accent-pink" /></FormItem>
                            )}/>
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <div className="text-sm text-white/70 font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-planora-accent-purple/80" />Location Information</div>
                          <div className="grid grid-cols-1 gap-4">
                            <FormField control={form.control} name="country" render={({ field }) => (
                              <FormItem className="w-full"><FormLabel className="text-white/80">Country</FormLabel><Select value={field.value} onValueChange={field.onChange} options={countryOptions} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 w-full" placeholder="Select your country"/><FormMessage className="text-planora-accent-pink" /></FormItem>
                            )}/>
                            <FormField control={form.control} name="city" render={({ field }) => (
                              <FormItem className="w-full"><FormLabel className="text-white/80">City</FormLabel>{selectedCountry ? (<><Select value={field.value} onValueChange={field.onChange} options={cityOptions} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 w-full" placeholder="Select your city"/><FormMessage className="text-planora-accent-pink" /></>) : (<><div className="h-10 flex items-center px-3 bg-white/5 border border-white/10 text-white/50 rounded-md cursor-not-allowed">Select your city</div><p className="text-xs text-white/50 mt-1">Please select a country first</p></>)}</FormItem>
                            )}/>
                            {showCustomCityInput && (
                              <FormField control={form.control} name="customCity" render={({ field }) => (
                                <FormItem className="w-full"><FormLabel className="text-white/80">Specify City</FormLabel><FormControl><Input placeholder="Enter your city name" {...field} className="bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300 w-full"/></FormControl><FormMessage className="text-planora-accent-pink" /></FormItem>
                              )}/>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <div className="text-sm text-white/70 font-medium flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-planora-accent-purple/80" />Date of Birth</div>
                          <FormField control={form.control} name="birthdate" render={({ field }) => (
                            <FormItem><FormLabel className="text-white/80">Date of Birth</FormLabel><FormControl><DatePickerInput value={field.value} onChange={field.onChange} placeholder="MM / DD / YYYY" className="w-full bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"/></FormControl><FormMessage className="text-planora-accent-pink" /><div className="text-xs text-white/50 mt-1">You must be at least 16 years old to use Planora</div></FormItem>
                          )}/>
                        </div>
                    <div className="pt-4">
                        <GradientButton className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (<><Loader2 className="animate-spin mr-2 h-4 w-4" />Processing...</>) : "Create Account & Verify Email"}
                        </GradientButton>
                    </div>
                  </form>
                </Form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode" className="text-muted-foreground">Verification Code</Label>
                  <Input id="verificationCode" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="Enter 6-digit code" maxLength={6} required className="bg-input/30 border-white/20 focus:border-planora-accent-purple focus:ring-planora-accent-purple text-center tracking-[0.3em] text-lg"/>
                </div>
                {verificationErrorText && (
                  <p className="text-sm text-red-500 flex items-center"><Shield size={16} className="mr-2 flex-shrink-0" />{verificationErrorText}</p>
                )}
                <GradientButton type="submit" className="w-full" disabled={isVerifying || verificationCode.length !== 6}>
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle size={18} className="mr-2" />}
                  Verify & Complete Signup
                </GradientButton>
                <Button variant="link" type="button" onClick={handleResendCode} className="w-full text-planora-blue-light hover:text-planora-blue-light/80" disabled={isResendingCode || isVerifying}>
                  {isResendingCode && !verificationErrorText ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Resend Code
                </Button>
                <Button variant="outline" type="button" onClick={() => { setSignupPhase('details'); setError(null); setVerificationErrorText(null); setVerificationCode(''); }} className="w-full border-white/20 hover:bg-white/10" disabled={isVerifying}>
                  Back to Details
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
            <div className="flex items-center w-full">
              <div className="h-px bg-white/10 flex-grow"></div>
              <span className="text-xs text-white/40 px-4">or continue with</span>
              <div className="h-px bg-white/10 flex-grow"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center transition-colors" disabled={isSubmitting || isVerifying} onClick={async () => { try { setIsSubmitting(true); await signInWithGoogle(); } catch (err) { console.error('Google sign-in error:', err); const errorMessage = err instanceof Error ? err.message : "Please try again."; toast({ title: "Google sign-in failed", description: errorMessage, variant: "destructive" }); } finally { setIsSubmitting(false); } }}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" /></svg>
                <span>Google</span>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center transition-colors" disabled={isSubmitting || isVerifying || import.meta.env.VITE_ENABLE_APPLE_AUTH !== 'true'} onClick={() => { if (import.meta.env.VITE_ENABLE_APPLE_AUTH === 'true') { toast({ title: "Apple Sign-In", description: "Apple Sign-In is configured but not yet fully implemented in this component." }); } else { toast({ title: "Coming Soon", description: "Apple sign-in will be available soon.", }); } }}>
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
    </div>
  );
};
