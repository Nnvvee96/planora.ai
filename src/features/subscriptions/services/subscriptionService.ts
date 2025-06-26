import { supabase } from "@/lib/supabase/client";
import { ProductWithPrices, Subscription } from "../types/subscriptionTypes";

/**
 * Fetches the active subscription for the current user.
 * @returns The user's active subscription, or null if none exists.
 */
export const getActiveSubscription = async (): Promise<Subscription | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"])
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching active subscription:", error);
    return null;
  }

  return data;
};

/**
 * Fetches all active products with their prices.
 * @returns A list of products with their associated prices.
 */
export const getActiveProductsWithPrices = async (): Promise<
  ProductWithPrices[]
> => {
  const { data, error } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index"); // Assuming you add an 'index' to product metadata for ordering

  if (error) {
    console.error("Error fetching products with prices:", error);
    return [];
  }

  // Supabase types don't perfectly match our desired structure, so we map it.
  return data.map((item) => ({
    product: {
      id: item.id,
      active: item.active,
      name: item.name,
      description: item.description,
      image: item.image,
      metadata: item.metadata,
    },
    prices: item.prices,
  }));
};
