import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ArrowLeft, Star, Crown, Zap } from "lucide-react";
import { useAuth } from "@/features/auth/authApi";
import { useNavigate } from "react-router-dom";
import {
  getActiveSubscription,
  getActiveProductsWithPrices,
  ProductWithPrices,
  Subscription,
} from "@/features/subscriptions/subscriptionsApi";
// We will use these later when we fetch live data
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/features/auth/authApi';

// Mock plans data for better user experience while subscription service is being set up
const mockPlans = [
  {
    id: "free",
    name: "Explorer",
    description: "Perfect for occasional travelers",
    price: 0,
    interval: "month",
    features: [
      "3 AI trip suggestions per month",
      "Basic destination insights",
      "Standard support",
      "Email notifications",
    ],
    popular: false,
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: "pro",
    name: "Wanderer Pro",
    description: "Ideal for frequent travelers",
    price: 9.99,
    interval: "month",
    features: [
      "Unlimited AI trip suggestions",
      "Advanced destination insights",
      "Real-time flight & hotel pricing",
      "Priority support",
      "Mobile app access",
      "Trip collaboration features",
    ],
    popular: true,
    icon: <Crown className="h-6 w-6" />,
  },
  {
    id: "premium",
    name: "Global Elite",
    description: "For the ultimate travel experience",
    price: 19.99,
    interval: "month",
    features: [
      "Everything in Wanderer Pro",
      "Personal travel concierge",
      "Exclusive deals & discounts",
      "VIP customer support",
      "Advanced trip analytics",
      "White-label travel planning",
      "Custom integrations",
    ],
    popular: false,
    icon: <Zap className="h-6 w-6" />,
  },
];

const Billing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [sub, prods] = await Promise.all([
            getActiveSubscription(),
            getActiveProductsWithPrices(),
          ]);
          setSubscription(sub);
          setProducts(prods);
        } catch {
          console.log(
            "Using mock data while subscription service is being set up",
          );
          // Use mock data as fallback
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    // Simulate API call
    setTimeout(() => {
      setCheckoutLoading(null);
      // Here you would integrate with Stripe checkout
      console.log("Upgrading to plan:", planId);
    }, 2000);
  };

  const getButtonLabel = (planId: string): string => {
    if (planId === "free") return "Current Plan";
    if (subscription?.price_id === planId) return "Current Plan";
    return "Upgrade";
  };

  const getCurrentPlan = () => {
    if (subscription) {
      const plan = products.find((p) =>
        p.prices.some((pr) => pr.id === subscription.price_id),
      );
      return plan?.product.name || "Pro Plan";
    }
    return "Explorer (Free)";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-planora-accent-purple" />
      </div>
    );
  }

  // Use mock plans if no products loaded
  const plansToShow = products.length > 0 ? products : mockPlans;

  return (
    <div className="min-h-screen bg-gradient-to-br from-planora-purple-dark via-planora-purple-medium to-planora-purple-light">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">
            Billing & Subscription
          </h1>
        </div>

        {/* Current Plan Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Current Plan
          </h2>
          <Card className="bg-black/20 backdrop-blur-lg border border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">
                    {getCurrentPlan()}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {subscription
                      ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : "Free plan with basic features"}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="text-white bg-planora-accent-purple/80 capitalize"
                >
                  {subscription?.status || "active"}
                </Badge>
              </div>
            </CardHeader>
            {subscription && (
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        {/* Available Plans */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansToShow.map((plan) => {
              // Handle both API products and mock plans
              const isApiProduct = "product" in plan;
              const planData = isApiProduct
                ? {
                    id: plan.product.id,
                    name: plan.product.name,
                    description: plan.product.description || "",
                    price: plan.prices[0]
                      ? plan.prices[0].unit_amount / 100
                      : 0,
                    interval: plan.prices[0]?.interval || "month",
                    features:
                      (plan.product.metadata?.features as string[]) || [],
                    popular: false,
                    icon: <Star className="h-6 w-6" />,
                  }
                : plan;

              const isCurrentPlan =
                subscription?.price_id ===
                  (isApiProduct ? plan.prices[0]?.id : plan.id) ||
                (!subscription && planData.id === "free");
              const isPro = planData.id === "pro" || planData.popular;

              return (
                <Card
                  key={planData.id}
                  className={`relative bg-black/20 backdrop-blur-lg border transition-all duration-300 hover:scale-105 ${
                    isPro
                      ? "border-planora-accent-purple shadow-lg shadow-planora-accent-purple/20"
                      : "border-white/20 hover:border-white/40"
                  } ${isCurrentPlan ? "ring-2 ring-planora-accent-blue" : ""}`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-planora-accent-purple text-white px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2 text-planora-accent-purple">
                      {planData.icon}
                    </div>
                    <CardTitle className="text-white text-xl">
                      {planData.name}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {planData.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <div className="flex items-end justify-center mb-6">
                      <span className="text-4xl font-bold text-white">
                        ${planData.price.toFixed(2)}
                      </span>
                      <span className="text-white/70 ml-2">
                        /{planData.interval}
                      </span>
                    </div>

                    <ul className="space-y-3 text-left">
                      {planData.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-planora-accent-blue mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-white/90 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full transition-all duration-300 ${
                        isPro
                          ? "bg-planora-accent-purple hover:bg-planora-accent-purple/80 text-white"
                          : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      }`}
                      disabled={
                        isCurrentPlan || checkoutLoading === planData.id
                      }
                      onClick={() =>
                        !isCurrentPlan && handleUpgrade(planData.id)
                      }
                    >
                      {checkoutLoading === planData.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        getButtonLabel(planData.id)
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Payment History */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Payment History
          </h2>
          <Card className="bg-black/20 backdrop-blur-lg border border-white/20">
            <CardContent className="p-6">
              <p className="text-white/70 text-center">
                Your payment history will appear here once you have active
                subscriptions.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export { Billing };
