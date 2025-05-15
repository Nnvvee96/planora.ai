
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select } from '@/components/ui/select';
import Logo from '@/components/Logo';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import GradientButton from '@/components/GradientButton';
import { Apple } from 'lucide-react';
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import Footer from '@/components/Footer';

// List of countries for the dropdown
const countries = [
  "United States", "United Kingdom", "Canada", "Germany", "France", 
  "Spain", "Italy", "Australia", "Japan", "India", "Brazil"
];

const countryOptions = countries.map(country => ({ value: country, label: country }));

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  country: z.string().min(1, { message: 'Please select your country' }),
  city: z.string().min(2, { message: 'Please enter your city' }),
  birthdate: z.date({
    required_error: "Please select your birthdate.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      city: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Registration data:', data);
    if (formStep < 1) {
      setFormStep(1);
    } else {
      // Navigate to onboarding
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-planora-purple-dark flex flex-col">
      {/* Clean background with subtle gradient and no text */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-planora-accent-purple/20 via-background to-background"></div>
      
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="mb-6 z-10">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        
        <Card className="w-full max-w-md z-10 bg-card/50 backdrop-blur-lg border-white/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center text-white/60">
              Enter your information to get started
            </CardDescription>
            {/* Step indicators */}
            <div className="flex justify-center space-x-2 pt-2">
              <div className={`h-2 w-16 rounded-full ${formStep === 0 ? 'bg-planora-accent-purple' : 'bg-planora-accent-purple/30'}`}></div>
              <div className={`h-2 w-16 rounded-full ${formStep === 1 ? 'bg-planora-accent-purple' : 'bg-planora-accent-purple/30'}`}></div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {formStep === 0 ? (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              {...field} 
                              className="bg-white/5 border-white/10 text-white"
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              className="bg-white/5 border-white/10 text-white"
                            />
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
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            options={countryOptions}
                            className="bg-white/5 border-white/10 text-white"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="New York" 
                              {...field} 
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Date of Birth field with DatePickerInput */}
                    <FormField
                      control={form.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <DatePickerInput
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="MM / DD / YYYY"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <div className="text-sm text-white/60 pt-2">
                      <p>By signing up, you agree to our <Link to="#" className="text-planora-accent-purple hover:underline">Terms of Service</Link> and <Link to="#" className="text-planora-accent-purple hover:underline">Privacy Policy</Link>.</p>
                    </div>
                  </>
                )}
                
                <div className="pt-2">
                  {formStep === 0 ? (
                    <GradientButton className="w-full">
                      Continue
                    </GradientButton>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 border-white/10 bg-white/5 text-white"
                        onClick={() => setFormStep(0)}
                      >
                        Back
                      </Button>
                      <GradientButton className="flex-1" type="submit">
                        Create Account
                      </GradientButton>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card/50 text-white/60">or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Updated Google button to match Login page style */}
              <Button 
                variant="outline" 
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
                </svg>
                <span>Google</span>
              </Button>
              
              {/* Updated Apple button to match Login page style */}
              <Button 
                variant="outline" 
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 justify-center"
              >
                <Apple className="h-4 w-4" />
                <span>Apple</span>
              </Button>
            </div>
            
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-planora-accent-purple hover:text-planora-accent-pink">
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

export default Register;
