
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { Label } from "@/ui/atoms/Label";
import { cn } from "@/lib/utils";
import { Logo } from '@/ui/atoms/Logo';
import { useNavigate } from 'react-router-dom';
import { Apple, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Footer } from '@/ui/organisms/Footer';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth/authApi";
import type { GoogleLoginButton as GoogleLoginButtonType } from "@/features/auth/components/GoogleLoginButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Database access should be through feature APIs, not direct imports

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

// Define types for components

// Type for lazy-loaded components
type LazyComponent = React.LazyExoticComponent<React.ComponentType<any>>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Import authService directly from the API boundary
  // This follows Planora's architectural principles of importing features through their API boundary
  const { authService, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  const [GoogleLoginButton, setGoogleLoginButton] = useState<LazyComponent | null>(null);
  
  // Load Google login button dynamically
  useEffect(() => {
    // Dynamically import the Google login button component to avoid circular dependencies
    const loadGoogleButton = async () => {
      try {
        // Access the button through the auth feature API boundary
        // Proper dynamic import wrapped with a default export adapter for lazy loading
        const GoogleButton = lazy(() => 
          import('@/features/auth/authApi')
            .then(module => ({ 
              // Create a default export adapter for the named export
              default: (props: any) => {
                const GoogleBtn = module.GoogleLoginButton;
                return <GoogleBtn {...props} />;
              }
            }))
        );
        setGoogleLoginButton(() => GoogleButton);
      } catch (error) {
        console.error('Error loading Google button component:', error);
      }
    };
    
    loadGoogleButton();
  }, []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Update error state if there's an auth error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing again
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing again
    if (error) setError(null);
  };

  // Email/password login implementation
  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email || !password) {
        setError('Please enter your email and password');
        return;
      }
      
      // Ensure we have the auth service
      if (!authService) {
        throw new Error('Authentication service not initialized');
      }
      // Attempt to sign in with email and password
      // Use the auth service instead of direct Supabase access
      const { data, error: signInError } = await authService.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw new Error(signInError.message);
      }
      
      if (!data.user) {
        throw new Error('Login failed. No user data returned.');
      }
      
      // Check if email has been verified
      const isEmailVerified = await authService.checkEmailVerificationStatus(data.user.id);
      
      if (!isEmailVerified) {
        // Email not verified, show verification needed screen
        navigate('/login', { 
          state: { 
            email,
            verificationNeeded: true,
            message: "Your email address hasn't been verified. Please check your inbox for a verification link or request a new one." 
          }
        });
        return;
      }
      
      // Login successful, check onboarding status
      const registrationDetails = await authService.checkUserRegistrationStatus(data.user.id);
      
      // Check if there's a redirect path stored in localStorage
      const redirectPath = localStorage.getItem('redirect_after_login');
      
      // Redirect based on stored path or onboarding status
      if (redirectPath) {
        // Clear the redirect path from localStorage
        localStorage.removeItem('redirect_after_login');
        navigate(redirectPath);
      } else if (registrationDetails.registrationStatus === 'new_user' || 
                 registrationDetails.registrationStatus === 'incomplete_onboarding') {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to Planora!"
      });
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6 w-full", className)} {...props}>
      <form onSubmit={onSubmit} className="w-full">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-sm text-red-500 w-full break-words">
            {error}
          </div>
        )}
        <div className="grid gap-5 w-full">
          {/* Email Field */}
          <div className="grid gap-2 w-full">
            <Label htmlFor="email" className="text-white/80 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-planora-accent-purple/80" />
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full max-w-full bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
            />
          </div>
          
          {/* Password Field */}
          <div className="grid gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="password" className="text-white/80 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-planora-accent-purple/80">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-planora-accent-purple hover:text-planora-accent-pink transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full max-w-full bg-white/5 border-white/10 text-white focus:border-planora-accent-purple/50 focus:ring-planora-accent-purple/20 transition-all duration-300"
            />
          </div>
          
          {/* Submit Button */}
          <Button 
            disabled={isLoading} 
            className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 w-full mt-2 py-5 font-medium"
            type="submit"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>
      </form>
      
      {/* Divider */}
      <div className="w-full flex items-center gap-3 py-1">
        <div className="h-px bg-white/10 flex-grow"></div>
        <span className="text-xs text-white/40">or continue with</span>
        <div className="h-px bg-white/10 flex-grow"></div>
      </div>
      
      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Google authentication button */}
        <Button 
          variant="outline" 
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center transition-colors"
          onClick={() => authService?.signInWithGoogle?.()}
          disabled={!authService?.signInWithGoogle || isLoading}
          type="button"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
          </svg>
          <span>Google</span>
        </Button>
        
        {/* Apple authentication button (coming soon) */}
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading || import.meta.env.VITE_ENABLE_APPLE_AUTH !== 'true'} 
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center transition-colors" 
          onClick={() => {
            toast({
              title: "Coming Soon",
              description: "Apple sign-in will be available soon.",
            });
          }}>
          <Apple className="h-4 w-4" />
          <span>Apple</span>
        </Button>
      </div>
      
      {/* Sign up link */}
      <div className="text-center text-sm text-white/60 mt-2">
        <Link
          to="/register"
          className="text-planora-accent-purple hover:underline transition-colors"
        >
          Don&apos;t have an account? Sign Up
        </Link>
      </div>
    </div>
  );
}

export function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { toast } = useToast();
  const { authService } = useAuth();
  
  // Function to handle resending verification email
  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast({
        title: "Error",
        description: "No email to resend verification",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setResendingEmail(true);
      
      // Use our already initialized auth service from the hook
      if (!authService) {
        throw new Error('Authentication service not initialized');
      }
      
      // Attempt to resend verification email
      const success = await authService.resendVerificationEmail(verificationEmail);
      
      if (success) {
        toast({
          title: "Verification Email Sent",
          description: `We've sent a new verification link to ${verificationEmail}. Please check your inbox.`,
        });
      } else {
        throw new Error("Failed to send verification email. Please try again later.");
      }
    } catch (err) {
      console.error('Error resending verification email:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send verification email",
        variant: "destructive"
      });
    } finally {
      setResendingEmail(false);
    }
  };
  
  useEffect(() => {
    // Check if location state contains verification info or session expiration info
    if (location.state) {
      const { verificationNeeded: needsVerification, email, message, sessionExpired: hasSessionExpired } = location.state as any;
      
      // Handle verification needed state
      if (needsVerification) {
        setVerificationNeeded(true);
        if (email) setVerificationEmail(email);
        if (message) setVerificationMessage(message);
      }
      
      // Handle session expired state
      if (hasSessionExpired) {
        setSessionExpired(true);
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "default"
        });
      }
    }
  }, [location, toast]);
  
  return (
    <div className="flex min-h-screen flex-col bg-planora-purple-dark">
      {/* Enhanced gradient background with better visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>
      
      {/* Improved background with subtle gradient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-planora-accent-pink/5 blur-3xl"></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center px-4 w-full">
        <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 max-w-[420px] overflow-hidden">
          <div className="flex flex-col space-y-2 text-center">
            <div className="text-center mb-6">
              <div className="flex flex-col items-center">
                <Link to="/" className="block mb-5">
                  <Logo className="h-16 w-auto" variant="full" href="/" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Welcome Back
                </h1>
                <p className="text-white/60 text-sm mt-2">
                  Sign in to your account to continue your planning journey
                </p>
              </div>
            
              {/* Show session expired message with improved styling */}
              {sessionExpired && (
                <Alert className="mt-4 border-yellow-500/30 bg-yellow-500/10 text-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-300" />
                  <AlertTitle className="text-yellow-200 font-medium">Session Expired</AlertTitle>
                  <AlertDescription className="text-yellow-200/90 text-sm">
                    Your session has expired. Please log in again to continue.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          {/* Verification Alert with improved styling */}
          {verificationMessage && (
            <Alert className="bg-planora-accent-purple/10 border-planora-accent-purple/30 text-white rounded-lg">
              <AlertCircle className="h-4 w-4 text-planora-accent-purple" />
              <AlertTitle className="font-medium">Email Verification</AlertTitle>
              <AlertDescription className="text-white/80 text-sm">
                {verificationMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {verificationNeeded ? (
            <div className="bg-black/30 backdrop-blur-lg p-7 rounded-xl border border-white/10 shadow-lg">
              <div className="text-center space-y-6">
                <div className="mx-auto bg-gradient-to-r from-planora-accent-purple/20 to-planora-accent-pink/20 w-20 h-20 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-planora-accent-purple" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-white">Check your inbox</h3>
                  {verificationEmail && (
                    <p className="text-white/70 text-sm">
                      We've sent a verification link to <span className="text-white font-medium">{verificationEmail}</span>
                    </p>
                  )}
                  <p className="text-white/60 text-sm mt-2">
                    Click the link in the email to verify your account. If you don't see it, check your spam folder.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 text-white font-medium py-5"
                    onClick={() => {
                      setVerificationNeeded(false);
                    }}
                  >
                    I've verified my email
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-lg p-7 rounded-xl border border-white/10 shadow-lg w-full">
              <UserAuthForm className="w-full" />
            </div>
          )}
          
          {/* Resend verification email option with improved styling */}
          {verificationNeeded && (
            <p className="text-center text-sm">
              <span className="text-white/60">
                Didn't receive the email? Check your spam folder or{" "}
                <Button 
                  variant="link" 
                  className="text-planora-accent-purple hover:text-planora-accent-pink p-0 h-auto font-normal"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                >
                  {resendingEmail ? 'Sending...' : 'resend verification email'}
                </Button>
              </span>
            </p>
          )}
        </div>
      </div>
      
      {/* Footer with improved position */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default Login;
