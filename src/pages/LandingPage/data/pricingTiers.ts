/**
 * Pricing Tiers Data
 * 
 * Subscription plans and pricing information for the landing page
 */

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  limitations: string[];
  highlighted: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for casual travelers",
    features: [
      "AI-powered trip suggestions",
      "Basic itinerary planning",
      "Limited conversation history",
      "Email support",
    ],
    limitations: [
      "Limited to 3 trips per month",
      "No group planning features",
      "Basic recommendations only",
    ],
    highlighted: false,
  },
  {
    name: "Explorer",
    price: "$9.99",
    period: "per month",
    description: "For frequent travelers",
    features: [
      "Unlimited trip planning",
      "Advanced destination insights",
      "Extended conversation history",
      "Group trip coordination",
      "Priority support",
    ],
    limitations: [],
    highlighted: true,
  },
  {
    name: "Voyager",
    price: "$19.99",
    period: "per month",
    description: "For travel enthusiasts",
    features: [
      "All Explorer features",
      "Premium destination insights",
      "Unlimited conversation history",
      "Advanced group coordination",
      "Concierge support",
      "Custom travel persona",
    ],
    limitations: [],
    highlighted: false,
  },
]; 