
import React, { useState, useEffect, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
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
import { getGoogleLoginButtonComponent, getAuthContextHook, getAuthService, AuthService } from "@/features/auth/authApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/database/databaseExports';
import { UserRegistrationStatus } from '@/features/auth/types/authTypes';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

// Define types for auth context and components
interface AuthContext {
  isAuthenticated?: boolean;
  loading?: boolean;
  error?: string | null;
  signInWithGoogle?: () => Promise<void>;
  // Add other properties as needed
}

// Define more specific types for lazy-loaded components
interface GoogleButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  text?: string;
  onClick?: () => void;
}

type LazyComponent = React.LazyExoticComponent<React.ComponentType<GoogleButtonProps>>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authService, setAuthService] = useState<AuthService | null>(null);
  // Add this back with proper type
  const [authContext, setAuthContext] = useState<AuthContext>({});
  const [GoogleLoginButton, setGoogleLoginButton] = useState<LazyComponent | null>(null);
  
  // Dynamically load the auth context hook and GoogleLoginButton component
  useEffect(() => {
    // Create separate function to load context to avoid hooks rules violation
    const loadAuthContext = async () => {
      try {
        const useAuthContextHook = await getAuthContextHook();
        // Create a fake component to use the hook properly
        const TempComponent = () => {
          const context = useAuthContextHook();
          return null;
        };
        // Use the hook in a proper React component context
        const rendered = document.createElement('div');
        ReactDOM.render(<TempComponent />, rendered);
        
        // Get the auth context directly from the API instead
        const authService = getAuthService();
        setAuthContext({
          isAuthenticated: false,
          loading: false,
          error: null,
          signInWithGoogle: authService.signInWithGoogle
        });
      } catch (error) {
        console.error('Error loading auth context:', error);
      }
      
      // Load the GoogleLoginButton component
      const GoogleLoginButtonComponent = getGoogleLoginButtonComponent();
      setGoogleLoginButton(GoogleLoginButtonComponent);
    };
    
    loadAuthContext();
  }, []);
  
  // Use optional chaining to safely access auth context properties
  const isAuthenticated = authContext?.isAuthenticated;
  const loading = authContext?.loading;
  const authError = authContext?.error;
  const signInWithGoogle = authContext?.signInWithGoogle;
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
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form input
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }
      
      // Get auth service from factory function if not already available
      const service = authService || getAuthService();
      
      // Attempt to sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
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
      const isEmailVerified = await service.checkEmailVerificationStatus(data.user.id);
      
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
      const registrationDetails = await service.checkUserRegistrationStatus(data.user.id);
      
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
        <div className="grid gap-4 w-full">
          <div className="grid gap-2 w-full">
            <Label htmlFor="email">Email</Label>
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
              className="w-full max-w-full"
            />
          </div>
          <div className="grid gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground hover:text-white"
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
              className="w-full max-w-full"
            />
          </div>
          <Button 
            disabled={isLoading} 
            className="bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink hover:opacity-90 w-full"
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
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Use a simple button that calls the sign in function directly */}
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 flex-shrink-0" 
          onClick={() => authContext?.signInWithGoogle?.()}
          disabled={!authContext?.signInWithGoogle}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5 flex-shrink-0">
            <path fill="currentColor" d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.421,1.143-1.123,2.206-2.019,3.071c-0.739,0.739-1.578,1.348-2.485,1.818C12.264,19.583,10.931,20,9.545,20c-2.618,0-4.946-1.274-6.421-3.273c-0.891-1.213-1.364-2.697-1.364-4.242c0-1.363,0.379-2.662,1.095-3.769c0.717-1.107,1.717-1.989,2.945-2.545C6.909,5.637,8.235,5.331,9.545,5.331c1.918,0,3.752,0.736,5.114,2.025l-1.997,1.997c-0.979-0.979-2.025-1.436-3.118-1.436c-0.97,0-1.891,0.379-2.592,1.068c-0.701,0.688-1.18,1.654-1.18,2.728c0,1.075,0.479,2.04,1.18,2.728c0.701,0.689,1.622,1.068,2.592,1.068c0.517,0,1.021-0.146,1.44-0.392c0.391-0.229,0.76-0.522,1.095-0.857l2.458-2.458C12.545,11.301,12.545,12.151,12.545,12.151L12.545,12.151z M20.454,10.425h-2v-2h-2v2h-2v2h2v2h2v-2h2V10.425z"/>
          </svg>
          <span className="whitespace-nowrap">Sign in with Google</span>
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading || import.meta.env.VITE_ENABLE_APPLE_AUTH !== 'true'} 
          className="w-full flex-shrink-0" 
          onClick={() => {
            toast({
              title: "Coming Soon",
              description: "Apple sign-in will be available soon.",
            });
          }}>
          <Apple className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Apple</span>
        </Button>
      </div>
      
      {/* Sign up link moved here, directly below the social login buttons */}
      <div className="text-center text-sm text-muted-foreground w-full">
        <Link
          to="/register"
          className="hover:text-white underline underline-offset-4 block w-full"
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
  
  // Function to handle resending verification email
  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the email address you registered with.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setResendingEmail(true);
      
      // Get auth service
      const authService = getAuthService();
      
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
      {/* Simple gradient background without text or distracting elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-planora-purple-dark via-planora-purple-dark to-black opacity-90 z-0"></div>
      
      {/* Clean background with subtle gradient and no text */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-planora-accent-purple/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-planora-accent-blue/5 blur-3xl"></div>
      </div>
      
      <div className="flex-grow flex items-center justify-center px-4 w-full">
        <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 max-w-[400px] overflow-hidden">
          <div className="flex flex-col space-y-2 text-center">
            {verificationNeeded ? (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Verify Your Email</h1>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox to complete registration
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  {/* Integrated logo layout with flex-row to place logo at the top */}
                  <div className="flex flex-col items-center">
                    <Logo className="h-16 w-auto mb-6" href="/" variant="full" />
                    <h1 className="text-2xl font-bold tracking-tight">
                      Welcome to Planora
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Sign in to your account to continue
                    </p>
                  </div>
                  
                  {/* Show session expired message */}
                  {sessionExpired && (
                    <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle className="text-yellow-500">Session Expired</AlertTitle>
                      <AlertDescription className="text-yellow-500/90">
                        Your session has expired. Please log in again to continue.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Verification Alert */}
          {verificationMessage && (
            <Alert className="bg-white/5 border-planora-accent-purple/40 text-white">
              <AlertCircle className="h-4 w-4 text-planora-accent-purple" />
              <AlertTitle>Email Verification</AlertTitle>
              <AlertDescription className="text-white/80">
                {verificationMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {verificationNeeded ? (
            <div className="bg-card/20 backdrop-blur-lg p-6 rounded-lg border border-white/10 shadow-lg">
              <div className="text-center space-y-6">
                <div className="mx-auto bg-white/5 w-16 h-16 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-planora-accent-purple" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Check your inbox</h3>
                  {verificationEmail && (
                    <p className="text-white/60 text-sm">
                      We've sent a verification link to <span className="text-white font-medium">{verificationEmail}</span>
                    </p>
                  )}
                  <p className="text-white/60 text-sm mt-2">
                    Click the link in the email to verify your account. If you don't see it, check your spam folder.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
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
            <div className="bg-card/20 backdrop-blur-lg p-6 rounded-lg border border-white/10 shadow-lg w-full max-w-full overflow-hidden">
              <UserAuthForm className="w-full max-w-full" />
            </div>
          )}
          
          {/* Only showing email verification option here now, "Sign Up" link moved into the form */}
          {verificationNeeded && (
            <p className="px-8 text-center text-sm text-muted-foreground">
              <span className="text-white/60">
                Didn't receive the email? Check your spam folder or <Button 
                  variant="link" 
                  className="text-planora-accent-purple hover:text-planora-accent-pink p-0 h-auto"
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
      
      {/* Footer */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
}
