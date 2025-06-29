import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/atoms/Card";
import { Button } from "@/ui/atoms/Button";
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

const Billing = () => {
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
            getActiveSubscription().catch(() => null),
            getActiveProductsWithPrices().catch(() => []),
          ]);
          setSubscription(sub);
          setProducts(prods);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.log(
              "Subscription service not available, using mock data:",
              error
            );
          }
          // Use mock data as fallback - don't show error to user
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (import.meta.env.DEV) {
      console.log("Upgrading to plan:", planId);
    }
    setCheckoutLoading(planId);
    // Simulate API call
    setTimeout(() => {
      setCheckoutLoading(null);
      // Here you would integrate with Stripe checkout
      if (import.meta.env.DEV) {
        console.log("Upgrading to plan:", planId);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Modern Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4 md:px-6">
        {/* Modern Header with Back Button */}
        <div className="flex items-center gap-4 mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
              Billing & Subscription
            </h1>
            <p className="text-white/60 mt-2">Manage your subscription and billing preferences</p>
          </div>
        </div>

        {/* Current Plan Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-4"></div>
            Current Plan
          </h2>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-75"></div>
            <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {getCurrentPlan()}
                    </CardTitle>
                    <CardDescription className="text-white/70 text-base">
                      {subscription
                        ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                        : "Free plan with basic features"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-white bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-0 px-4 py-2 text-sm font-medium"
                  >
                    {subscription?.status || "active"}
                  </Badge>
                </div>
              </CardHeader>
              {subscription && (
                <CardContent className="pt-0">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </section>

        {/* Available Plans */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-4"></div>
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div key={planData.id} className="relative rounded-2xl">
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border border-purple-400/30 shadow-xl backdrop-blur-sm">
                        <span className="text-white text-sm font-bold tracking-wide">Most Popular</span>
                      </div>
                    </div>
                  )}
                  
                  <Card
                    className={`relative bg-black/30 backdrop-blur-xl border transition-all duration-300 transform hover:scale-[1.02] rounded-2xl overflow-hidden group ${
                      isPro
                        ? "border-purple-400/50 shadow-lg shadow-purple-500/20"
                        : "border-white/20 hover:border-white/40"
                    } ${isCurrentPlan ? "ring-2 ring-blue-400/50" : ""}`}
                  >
                    {/* Contained hover effect - same pattern as Support page */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      isPro
                        ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100"
                        : "bg-gradient-to-r from-slate-500/5 to-slate-400/5 opacity-0 group-hover:opacity-100"
                    }`}></div>

                    <CardHeader className={`relative text-center pb-4 ${isPro ? 'pt-12' : 'pt-4'}`}>
                      <div className="relative flex justify-center mb-4">
                        <div className={`p-3 rounded-2xl ${
                          isPro 
                            ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30" 
                            : "bg-gradient-to-br from-slate-500/20 to-slate-400/20 border border-slate-400/30"
                        }`}>
                          <div className={isPro ? "text-purple-400" : "text-slate-400"}>
                            {planData.icon}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-white text-2xl font-bold mb-2">
                        {planData.name}
                      </CardTitle>
                      <CardDescription className="text-white/70 text-base">
                        {planData.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative text-center pb-6">
                      <div className="flex items-end justify-center mb-8">
                        <span className="text-5xl font-bold text-white">
                          ${planData.price.toFixed(2)}
                        </span>
                        <span className="text-white/70 ml-2 text-lg">
                          /{planData.interval}
                        </span>
                      </div>

                      <ul className="space-y-4 text-left">
                        {planData.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className="p-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30 mr-3 mt-0.5 flex-shrink-0">
                              <Check className="h-3 w-3 text-green-400" />
                            </div>
                            <span className="text-white/90 text-sm leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="relative pt-0">
                      <Button
                        className={`w-full transition-all duration-300 rounded-xl py-3 font-semibold ${
                          isPro
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/30"
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
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment History */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full mr-4"></div>
            Payment History
          </h2>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Card className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-slate-500/20 to-slate-400/20 rounded-2xl border border-slate-400/30 inline-block mb-4">
                    <Star className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-white/70 text-lg">
                    Your payment history will appear here once you have active subscriptions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export { Billing };
