
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/api';

const Billing: React.FC = () => {
  const navigate = useNavigate();
  
  // Redirect logic for new Google sign-ins
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        // If user exists, check if they've completed onboarding
        if (user) {
          const hasCompletedOnboarding = user.hasCompletedOnboarding === true;
          
          // If user hasn't completed onboarding, redirect to onboarding page
          if (!hasCompletedOnboarding) {
            console.log('User has not completed onboarding, redirecting from Billing to Onboarding');
            navigate('/onboarding', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user in Billing component:', error);
      }
    };
    
    checkUserAndRedirect();
  }, [navigate]);
  
  // Sample subscription data
  const currentPlan = "Professional";
  
  // Sample payment history
  const paymentHistory = [
    { id: 1, date: "May 1, 2025", amount: "$19.99", status: "Successful" },
    { id: 2, date: "April 1, 2025", amount: "$19.99", status: "Successful" },
    { id: 3, date: "March 1, 2025", amount: "$19.99", status: "Successful" },
  ];
  
  // Sample plans
  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      period: "month",
      description: "Perfect for casual travelers",
      features: [
        "5 trips per month",
        "Basic itinerary planning",
        "Email support"
      ],
      current: false
    },
    {
      name: "Professional",
      price: "$19.99",
      period: "month",
      description: "For frequent travelers",
      features: [
        "Unlimited trips",
        "Advanced itinerary planning",
        "24/7 priority support",
        "Custom travel recommendations",
        "Flight and hotel price alerts"
      ],
      current: true
    },
    {
      name: "Enterprise",
      price: "$49.99",
      period: "month",
      description: "For travel agencies and businesses",
      features: [
        "Everything in Professional",
        "Multiple user accounts",
        "API access",
        "Dedicated account manager",
        "Custom branding options"
      ],
      current: false
    }
  ];

  // Helper function to determine button label based on plan comparison
  const getButtonLabel = (planName: string): string => {
    if (currentPlan === planName) return "Current Plan";
    
    const planOrder = { "Basic": 1, "Professional": 2, "Enterprise": 3 };
    const currentPlanRank = planOrder[currentPlan as keyof typeof planOrder];
    const targetPlanRank = planOrder[planName as keyof typeof planOrder];
    
    if (currentPlanRank < targetPlanRank) return "Upgrade";
    if (currentPlanRank > targetPlanRank) return "Downgrade";
    return "Select Plan";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      
      {/* Current Plan Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Professional Plan</CardTitle>
                <CardDescription>Billed monthly · Renews on June 1, 2025</CardDescription>
              </div>
              <Badge variant="secondary" className="text-white bg-planora-accent-purple">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold">$19.99</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <p className="text-muted-foreground mb-4">Your next payment will be on June 1, 2025</p>
            <div className="flex gap-3">
              <Button variant="outline">Update Payment Method</Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Payment History */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map(payment => (
                    <tr key={payment.id} className="border-b">
                      <td className="px-6 py-4 text-sm">{payment.date}</td>
                      <td className="px-6 py-4 text-sm">{payment.amount}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button variant="link" size="sm" className="h-auto p-0">Download</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Available Plans */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? "border-planora-accent-purple" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.current ? (
                  <Button className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    {getButtonLabel(plan.name)}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export { Billing };
