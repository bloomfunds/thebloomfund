import { supabase } from "./supabase";
import { Database } from "../types/supabase";

// Production-ready database operations with proper error handling and caching
export type Campaign = {
  id: string;
  title: string;
  description: string;
  business_name: string;
  owner_name: string;
  owner_id: string;
  funding_goal: number;
  current_funding: number;
  category: string;
  location: string;
  website?: string;
  cover_image?: string;
  owner_avatar?: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "draft" | "cancelled";
  created_at: string;
  updated_at: string;
  backers_count: number;
  views_count: number;
  shares_count: number;
  featured: boolean;
  verified: boolean;
};

export type RewardTier = {
  id: string;
  campaign_id: string;
  amount: number;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  claimed_count: number;
  max_claims?: number;
  estimated_delivery?: string;
};

export type Payment = {
  id: string;
  campaign_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  donor_name: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  payment_method: string;
  transaction_id?: string;
  reward_tier_id?: string;
  message?: string;
};

export type CampaignMedia = {
  id: string;
  campaign_id: string;
  media_type: "image" | "video";
  media_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
  file_size: number;
  mime_type: string;
};

export type CampaignMilestone = {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  target_amount: number;
  is_reached: boolean;
  reached_at?: string;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  verified: boolean;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
};

// Cache management for production performance
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Production database operations
export async function createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'current_funding' | 'backers_count' | 'views_count' | 'shares_count' | 'featured' | 'verified'>): Promise<Campaign> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert([{
        ...campaignData,
        current_funding: 0,
        backers_count: 0,
        views_count: 0,
        shares_count: 0,
        featured: false,
        verified: false,
      }])
      .select()
      .single();

    if (error) {
      console.error("Database error creating campaign:", error);
      throw new Error(`Failed to create campaign: ${error.message}`);
    }

    // Clear relevant caches
    clearCache('campaigns');
    clearCache(`user_campaigns_${campaignData.owner_id}`);

    return data;
  } catch (error) {
    console.error("Error in createCampaign:", error);
    throw error;
  }
}

export async function getCampaignsByOwner(ownerId: string): Promise<Campaign[]> {
  const cacheKey = `user_campaigns_${ownerId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching user campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    setCachedData(cacheKey, data || [], 2 * 60 * 1000); // 2 minutes cache
    return data || [];
  } catch (error) {
    console.error("Error in getCampaignsByOwner:", error);
    throw error;
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const cacheKey = `campaign_${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Campaign not found
      }
      console.error("Database error fetching campaign:", error);
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }

    setCachedData(cacheKey, data, 5 * 60 * 1000); // 5 minutes cache
    return data;
  } catch (error) {
    console.error("Error in getCampaignById:", error);
    throw error;
  }
}

export async function getAllCampaigns(limit: number = 20, offset: number = 0, filters?: {
  category?: string;
  status?: string;
  location?: string;
  minGoal?: number;
  maxGoal?: number;
}): Promise<{ campaigns: Campaign[]; total: number }> {
  try {
    let query = supabase
      .from("campaigns")
      .select("*", { count: 'exact' });

    // Apply filters
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters?.minGoal) {
      query = query.gte("funding_goal", filters.minGoal);
    }
    if (filters?.maxGoal) {
      query = query.lte("funding_goal", filters.maxGoal);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error fetching campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return {
      campaigns: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error("Error in getAllCampaigns:", error);
    throw error;
  }
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating campaign:", error);
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    // Clear relevant caches
    clearCache(`campaign_${id}`);
    clearCache('campaigns');
    if (data.owner_id) {
      clearCache(`user_campaigns_${data.owner_id}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateCampaign:", error);
    throw error;
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error deleting campaign:", error);
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }

    // Clear relevant caches
    clearCache(`campaign_${id}`);
    clearCache('campaigns');
  } catch (error) {
    console.error("Error in deleteCampaign:", error);
    throw error;
  }
}

export async function incrementCampaignViews(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('increment_campaign_views', { campaign_id: id });

    if (error) {
      console.error("Database error incrementing views:", error);
      // Don't throw error for view tracking
    }

    // Clear cache for this campaign
    clearCache(`campaign_${id}`);
  } catch (error) {
    console.error("Error in incrementCampaignViews:", error);
    // Don't throw error for view tracking
  }
}

export async function createRewardTiers(campaignId: string, rewardTiers: Omit<RewardTier, 'id' | 'campaign_id' | 'created_at' | 'claimed_count'>[]): Promise<RewardTier[]> {
  try {
    const tiersWithIds = rewardTiers.map(tier => ({
      ...tier,
      campaign_id: campaignId,
      claimed_count: 0,
    }));

    const { data, error } = await supabase
      .from("reward_tiers")
      .insert(tiersWithIds)
      .select();

    if (error) {
      console.error("Database error creating reward tiers:", error);
      throw new Error(`Failed to create reward tiers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in createRewardTiers:", error);
    throw error;
  }
}

export async function getRewardTiersByCampaign(campaignId: string): Promise<RewardTier[]> {
  try {
    const { data, error } = await supabase
      .from("reward_tiers")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Database error fetching reward tiers:", error);
      throw new Error(`Failed to fetch reward tiers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getRewardTiersByCampaign:", error);
    throw error;
  }
}

export async function createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error("Database error creating payment:", error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    // Update campaign funding and backer count
    await updateCampaignFunding(paymentData.campaign_id, paymentData.amount);

    return data;
  } catch (error) {
    console.error("Error in createPayment:", error);
    throw error;
  }
}

async function updateCampaignFunding(campaignId: string, amount: number): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('update_campaign_funding', { 
        campaign_id: campaignId, 
        amount: amount 
      });

    if (error) {
      console.error("Database error updating campaign funding:", error);
      throw new Error(`Failed to update campaign funding: ${error.message}`);
    }

    // Clear relevant caches
    clearCache(`campaign_${campaignId}`);
    clearCache('campaigns');
  } catch (error) {
    console.error("Error in updateCampaignFunding:", error);
    throw error;
  }
}

export async function getPaymentsByCampaign(campaignId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("status", "succeeded")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching payments:", error);
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getPaymentsByCampaign:", error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error("Database error fetching user:", error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Database error updating user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

// Search functionality for production
export async function searchCampaigns(query: string, limit: number = 20): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,business_name.ilike.%${query}%`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Database error searching campaigns:", error);
      throw new Error(`Failed to search campaigns: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchCampaigns:", error);
    throw error;
  }
}

// Analytics and reporting
export async function getCampaignAnalytics(campaignId: string): Promise<{
  totalRaised: number;
  backersCount: number;
  averagePledge: number;
  fundingProgress: number;
  daysRemaining: number;
  recentPayments: Payment[];
}> {
  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const payments = await getPaymentsByCampaign(campaignId);
    const totalRaised = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averagePledge = payments.length > 0 ? totalRaised / payments.length : 0;
    const fundingProgress = (totalRaised / campaign.funding_goal) * 100;

    const endDate = new Date(campaign.end_date);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalRaised,
      backersCount: payments.length,
      averagePledge,
      fundingProgress,
      daysRemaining,
      recentPayments: payments.slice(0, 10)
    };
  } catch (error) {
    console.error("Error in getCampaignAnalytics:", error);
    throw error;
  }
}

// Export cache management for admin use
export { clearCache, getCachedData, setCachedData };
