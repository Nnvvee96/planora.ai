import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from '@/features/auth/authApi';
import { 
  getActiveSubscription, 
  getActiveProductsWithPrices,
  ProductWithPrices,
  Subscription
} from '@/features/subscriptions/subscriptionsApi';
// We will use these later when we fetch live data
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/features/auth/authApi';

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [_checkoutLoading, _setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        const [sub, prods] = await Promise.all([
          getActiveSubscription(),
          getActiveProductsWithPrices()
        ]);
        setSubscription(sub);
        setProducts(prods);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getButtonLabel = (priceId: string): string => {
    if (subscription?.price_id === priceId) {
      return "Current Plan";
    }
    // This logic can be enhanced later
    return "Upgrade";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-planora-accent-purple" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      
      {/* Current Plan Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>
        {subscription ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {products.find(p => p.prices.some(pr => pr.id === subscription.price_id))?.product.name} Plan
                  </CardTitle>
                  <CardDescription>
                    Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-white bg-planora-accent-purple capitalize">{subscription.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add more subscription details here if needed */}
              <div className="flex gap-3">
                <Button variant="outline">Manage Subscription</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>You are currently on the free plan.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
      
      {/* Payment History - Placeholder */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Your payment history will appear here.</p>
          </CardContent>
        </Card>
      </section>
      
      {/* Available Plans */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(({ product, prices }) => {
            const price = prices[0]; // Assuming one price per product for simplicity
            if (!price) return null;

            return (
              <Card key={product.id} className={subscription?.price_id === price.id ? "border-planora-accent-purple" : ""}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end mb-4">
                    <span className="text-3xl font-bold">
                      ${price.unit_amount ? (price.unit_amount / 100).toFixed(2) : '0.00'}
                    </span>
                    <span className="text-muted-foreground ml-2">/{price.interval}</span>
                  </div>
                  {/* Features can be stored in product metadata */}
                  <ul className="space-y-2">
                    {(product.metadata?.features as string[])?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={subscription?.price_id === price.id}
                  >
                    {getButtonLabel(price.id)}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export { Billing };
