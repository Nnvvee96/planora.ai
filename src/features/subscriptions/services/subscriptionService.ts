import { supabase } from "@/lib/supabase/client";
import { ProductWithPrices, Subscription } from "../types/subscriptionTypes";

/**
 * Map subscription product names to subscription tiers
 */
const PRODUCT_TIER_MAPPING: Record<string, string> = {
  'planora-explorer': 'explorer',
  'planora-basic': 'explorer', // Legacy mapping
  'planora-wanderer-pro': 'wanderer_pro',
  'planora-premium': 'wanderer_pro', // Legacy mapping
  'planora-global-elite': 'global_elite',
  'planora-pro': 'global_elite', // Legacy mapping
  // Add more mappings as needed
};

/**
 * Update user subscription tier based on subscription status
 * @param userId User ID
 * @param subscriptionStatus Subscription status
 * @param productName Product name from subscription
 * @returns Success status
 */
export const updateUserSubscriptionTier = async (
  userId: string,
  subscriptionStatus: string,
  productName?: string
): Promise<boolean> => {
  try {
    let newTier = 'free';

    // If subscription is active/trialing and we have a product name, determine tier
    if (['active', 'trialing'].includes(subscriptionStatus) && productName) {
      newTier = PRODUCT_TIER_MAPPING[productName] || 'explorer'; // Default to explorer for unknown products
    }

    // Use the database function to update subscription tier
    const { data, error } = await supabase.rpc('update_user_subscription_tier', {
      user_id: userId,
      new_tier: newTier
    });

    if (error) {
      console.error('Error updating user subscription tier:', error);
      return false;
    }

    // Also update local storage for immediate UI updates
    localStorage.setItem('user_subscription_tier', newTier);

    if (import.meta.env.DEV) {
      console.log(`Updated user ${userId} subscription tier to ${newTier}`);
    }

    return data === true;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to update subscription tier:', error);
    return false;
  }
};

/**
 * Get user subscription tier
 * @param userId User ID (optional, uses current user if not provided)
 * @returns Subscription tier
 */
export const getUserSubscriptionTier = async (userId?: string): Promise<string> => {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return 'free';
      }
      targetUserId = user.id;
    }

    // Use the database function to get subscription tier
    const { data, error } = await supabase.rpc('get_user_subscription_tier', {
      user_id: targetUserId
    });

    if (error) {
      console.error('Error getting user subscription tier:', error);
      return 'free';
    }

    return data || 'free';
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to get subscription tier:', error);
    return 'free';
  }
};

/**
 * Handle subscription status change (called by webhook or subscription update)
 * @param userId User ID
 * @param subscription Subscription object
 * @returns Success status
 */
export const handleSubscriptionStatusChange = async (
  userId: string,
  subscription: Partial<Subscription>
): Promise<boolean> => {
  try {
    // Get product name from subscription (you may need to adjust this based on your subscription structure)
    const productName = subscription.price_id ? await getProductNameFromPriceId(subscription.price_id) : undefined;

    // Update the user's subscription tier
    const success = await updateUserSubscriptionTier(
      userId,
      subscription.status || 'inactive',
      productName
    );

    if (success && import.meta.env.DEV) {
      console.log(`Successfully handled subscription status change for user ${userId}`);
    }

    return success;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error handling subscription status change:', error);
    return false;
  }
};

/**
 * Get product name from price ID (helper function)
 * @param priceId Price ID
 * @returns Product name
 */
const getProductNameFromPriceId = async (priceId: string): Promise<string | undefined> => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select('products(name)')
      .eq('id', priceId)
      .single();

    if (error || !data) {
      console.warn('Could not find product for price ID:', priceId);
      return undefined;
    }

    // Properly type the products relationship
    const products = data.products as { name: string } | { name: string }[] | null;
    
    if (Array.isArray(products)) {
      return products[0]?.name;
    }
    
    return products?.name;
  } catch (error) {
    console.warn('Error getting product name from price ID:', error);
    return undefined;
  }
};

/**
 * Fetches the active subscription for the current user.
 * @returns The user's active subscription, or null if none exists.
 */
export const getActiveSubscription = async (): Promise<Subscription | null> => {
  try {
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
  } catch (error) {
    // Silently handle any errors (including 406, table not found, etc.)
    if (import.meta.env.DEV) {
      console.log("Subscription service not available:", error);
    }
    return null;
  }
};

/**
 * Fetches all active products with their prices.
 * @returns A list of products with their associated prices.
 */
export const getActiveProductsWithPrices = async (): Promise<
  ProductWithPrices[]
> => {
  try {
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
  } catch (error) {
    // Silently handle any errors (including table not found, etc.)
    if (import.meta.env.DEV) {
      console.log("Products service not available:", error);
    }
    return [];
  }
};
