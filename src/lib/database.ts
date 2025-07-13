import { supabase } from "./supabase";
import { Database } from "../types/supabase";

// Production-ready database operations with proper error handling and caching
export type Campaign = {
  id: string;
  title: string;
  description: string;
  business_name: string;
  owner_name: string;
  owner_id: string | null;
  funding_goal: number;
  current_funding: number | null;
  category: string;
  location: string;
  website?: string | null;
  cover_image?: string | null;
  owner_avatar?: string | null;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "draft" | "cancelled";
  created_at: string | null;
  updated_at: string | null;
  backers_count?: number;
  views_count?: number;
  shares_count?: number;
  featured?: boolean;
  verified?: boolean;
  // Payout fields
  payout_status?: "not_eligible" | "eligible" | "requested" | "processing" | "paid" | "failed" | "expired" | null;
  payout_requested_at?: string | null;
  payout_processed_at?: string | null;
  stripe_transfer_id?: string | null;
  payout_amount?: number | null;
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
  user_id?: string | null;
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

export type SupportTicket = {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Stripe Connect fields
  stripe_connect_account_id?: string | null;
  stripe_connect_status?: "not_setup" | "pending" | "active" | "restricted" | "disabled";
  stripe_connect_onboarded_at?: string | null;
};

export type CampaignPayout = {
  id: string;
  campaign_id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed" | "expired";
  stripe_transfer_id?: string | null;
  stripe_connect_account_id?: string | null;
  requested_at: string;
  processed_at?: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
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

// Patch helper for Campaign
function patchCampaignFields(data: any): Campaign {
  return {
    ...data,
    owner_id: data?.owner_id ?? '',
    current_funding: data?.current_funding ?? 0,
    created_at: data?.created_at ?? '',
    updated_at: data?.updated_at ?? '',
    status: (data?.status as "active" | "completed" | "draft" | "cancelled") ?? "draft",
    backers_count: data?.backers_count ?? 0,
    views_count: data?.views_count ?? 0,
    shares_count: data?.shares_count ?? 0,
    featured: data?.featured ?? false,
    verified: data?.verified ?? false,
  };
}

// Patch helper for RewardTier
function patchRewardTierFields(data: any): RewardTier {
  return {
    ...data,
    claimed_count: data?.claimed_count ?? 0,
  };
}

// Patch helper for Payment
function patchPaymentFields(data: any): Payment {
  return {
    ...data,
    payment_method: data?.payment_method ?? 'stripe',
    status: data?.status ?? 'pending',
    is_anonymous: data?.is_anonymous ?? false,
    created_at: data?.created_at ?? '',
    updated_at: data?.updated_at ?? '',
    amount: data?.amount ?? 0,
    currency: data?.currency ?? 'usd',
    donor_name: data?.donor_name ?? '',
    user_id: data?.user_id ?? '',
    campaign_id: data?.campaign_id ?? '',
  };
}



// Patch helper for CampaignMedia
function patchCampaignMediaFields(data: any): CampaignMedia {
  return {
    ...data,
    file_size: data?.file_size ?? 0,
    mime_type: data?.mime_type ?? (data?.media_type === 'image' ? 'image/jpeg' : 'video/mp4'),
    created_at: data?.created_at ?? '',
    display_order: data?.display_order ?? 0,
  };
}

// Patch helper for CampaignMilestone
function patchCampaignMilestoneFields(data: any): CampaignMilestone {
  return {
    ...data,
    target_amount: data?.target_amount ?? 0,
    is_reached: data?.is_reached ?? false,
    created_at: data?.created_at ?? '',
  };
}

// Production database operations
export async function createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'current_funding' | 'backers_count' | 'views_count' | 'shares_count' | 'featured' | 'verified'>): Promise<Campaign> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - returning mock campaign');
    return {
      id: 'mock-campaign-id',
      ...campaignData,
      current_funding: 0,
      backers_count: 0,
      views_count: 0,
      shares_count: 0,
      featured: false,
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Campaign;
  }

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

    if (error || !data) {
      console.error("Database error creating campaign:", error);
      throw new Error(`Failed to create campaign: ${error?.message ?? 'No data returned'}`);
    }

    // Clear relevant caches
    clearCache('campaigns');
    clearCache(`user_campaigns_${campaignData.owner_id}`);

    return patchCampaignFields(data);
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

    const patched = (data || []).map(patchCampaignFields);
    setCachedData(cacheKey, patched, 2 * 60 * 1000); // 2 minutes cache
    return patched;
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

    const patched = data ? patchCampaignFields(data) : null;
    setCachedData(cacheKey, patched, 5 * 60 * 1000); // 5 minutes cache
    return patched;
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
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - returning mock campaigns');
      return {
      campaigns: [], 
      total: 0 
    };
  }

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
      console.error("Database error fetching all campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    const patched = (data || []).map(patchCampaignFields);
    return { campaigns: patched, total: count || 0 };
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

    return patchCampaignFields(data);
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

// Remove incrementCampaignViews since views_count column doesn't exist
export async function incrementCampaignViews(id: string): Promise<void> {
  // Views tracking disabled - column doesn't exist in schema
  console.log('Views tracking disabled - views_count column not in schema');
}

export async function createRewardTiers(campaignId: string, rewardTiers: Omit<RewardTier, 'id' | 'campaign_id' | 'created_at' | 'claimed_count'>[]): Promise<RewardTier[]> {
  try {
    const tiersWithCampaignId = rewardTiers.map((tier, i) => ({
      ...tier,
      campaign_id: campaignId,
      display_order: i,
      claimed_count: 0,
    }));
    const { data, error } = await supabase
      .from("reward_tiers")
      .insert(tiersWithCampaignId)
      .select();
    if (error) throw error;
    return (data || []).map(patchRewardTierFields);
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
    if (error) throw error;
    return (data || []).map(patchRewardTierFields);
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

    return patchPaymentFields(data);
  } catch (error) {
    console.error("Error in createPayment:", error);
    throw error;
  }
}

// Replace update_campaign_funding RPC with direct update
async function updateCampaignFunding(campaignId: string, amount: number): Promise<void> {
  try {
    // Get current funding
    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("current_funding")
      .eq("id", campaignId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentFunding = campaign?.current_funding ?? 0;
    const newFunding = currentFunding + amount;
    
    // Update campaign funding
    const { error } = await supabase
      .from("campaigns")
      .update({ current_funding: newFunding })
      .eq("id", campaignId);
    
    if (error) throw error;
    
    // Clear cache
    clearCache(`campaign_${campaignId}`);
  } catch (error) {
    console.error("Error updating campaign funding:", error);
    throw error;
  }
}

export async function getPaymentsByCampaign(campaignId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        campaigns:campaign_id (
          id,
          title,
          business_name,
          cover_image
        )
      `)
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(patchPaymentFields);
  } catch (error) {
    console.error("Error in getPaymentsByCampaign:", error);
    throw error;
  }
}

// Add getUserPledges function to get user's payment history
export async function getUserPledges(userId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        campaigns:campaign_id (
          id,
          title,
          business_name,
          cover_image
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(patchPaymentFields);
  } catch (error) {
    console.error("Error in getUserPledges:", error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  return getUserProfile(userId);
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
    if (error) throw error;
    return patchUserFields(data);
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

// Search functionality for production
export async function searchCampaigns(filters: {
  query?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "desc" | "asc";
  limit?: number;
  location?: string;
  minGoal?: number;
  maxGoal?: number;
  fundingStatus?: string;
  timeRemaining?: string;
}): Promise<Campaign[]> {
  try {
    let query = supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active");

    // Text search
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,business_name.ilike.%${filters.query}%`);
    }

    // Category filter
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    // Location filter
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    // Funding goal range
    if (filters.minGoal) {
      query = query.gte("funding_goal", filters.minGoal);
    }
    if (filters.maxGoal) {
      query = query.lte("funding_goal", filters.maxGoal);
    }

    // Sort options
    const sortField = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "desc";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Limit
    const limit = filters.limit || 20;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error("Database error searching campaigns:", error);
      throw new Error(`Failed to search campaigns: ${error.message}`);
    }

    let results = data || [];

    // Apply client-side filters that can't be done in SQL
    if (filters.fundingStatus && filters.fundingStatus !== "all") {
      results = results.filter((campaign: any) => {
        const percentage = ((campaign.current_funding || 0) / campaign.funding_goal) * 100;
        switch (filters.fundingStatus) {
          case "under_25": return percentage < 25;
          case "25_50": return percentage >= 25 && percentage < 50;
          case "50_75": return percentage >= 50 && percentage < 75;
          case "75_100": return percentage >= 75 && percentage <= 100;
          case "overfunded": return percentage > 100;
          default: return true;
        }
      });
    }

    if (filters.timeRemaining && filters.timeRemaining !== "all") {
      const now = new Date();
      results = results.filter((campaign: any) => {
        const endDate = new Date(campaign.end_date);
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.timeRemaining) {
          case "ending_soon": return daysRemaining <= 7;
          case "two_weeks": return daysRemaining <= 14;
          case "one_month": return daysRemaining <= 30;
          case "more_month": return daysRemaining > 30;
          default: return true;
        }
      });
    }

    return results.map(patchCampaignFields);
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

// Add getCampaigns function for homepage
export async function getCampaigns(filters?: {
  status?: string;
  limit?: number;
  category?: string;
  featured?: boolean;
}): Promise<Campaign[]> {
    // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - returning mock campaigns');
    return [];
  }

  const cacheKey = `campaigns_${JSON.stringify(filters)}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let query = supabase
      .from("campaigns")
      .select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.featured) {
      query = query.eq("featured", true);
    }

    const limit = filters?.limit || 20;
    query = query.limit(limit).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Database error fetching campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    const patched = (data || []).map(patchCampaignFields);
    setCachedData(cacheKey, patched, 2 * 60 * 1000); // 2 minutes cache
    return patched;
  } catch (error) {
    console.error("Error in getCampaigns:", error);
    throw error;
  }
}

// Patch createCampaignMedia
export async function createCampaignMedia(
  campaignId: string,
  mediaData: Omit<CampaignMedia, 'id' | 'campaign_id' | 'created_at'>
): Promise<CampaignMedia> {
  try {
    const { data, error } = await supabase
      .from("campaign_media")
      .insert([{
        ...mediaData,
        campaign_id: campaignId,
        file_size: mediaData.file_size ?? 0,
        mime_type: mediaData.mime_type ?? (mediaData.media_type === 'image' ? 'image/jpeg' : 'video/mp4'),
      }])
      .select()
      .single();

    if (error) {
      console.error("Database error creating campaign media:", error);
      throw new Error(`Failed to create campaign media: ${error.message}`);
    }

    // Clear relevant caches
    clearCache(`campaign_media_${campaignId}`);

    return patchCampaignMediaFields(data);
  } catch (error) {
    console.error("Error in createCampaignMedia:", error);
    throw error;
  }
}

// Patch createCampaignMediaBatch
export async function createCampaignMediaBatch(
  campaignId: string,
  mediaDataArray: Omit<CampaignMedia, 'id' | 'campaign_id' | 'created_at'>[]
): Promise<CampaignMedia[]> {
  try {
    const mediaDataWithCampaignId = mediaDataArray.map(mediaData => ({
      ...mediaData,
      campaign_id: campaignId,
      file_size: mediaData.file_size ?? 0,
      mime_type: mediaData.mime_type ?? (mediaData.media_type === 'image' ? 'image/jpeg' : 'video/mp4'),
    }));

    const { data, error } = await supabase
      .from("campaign_media")
      .insert(mediaDataWithCampaignId)
      .select();

    if (error) {
      console.error("Database error creating campaign media batch:", error);
      throw new Error(`Failed to create campaign media batch: ${error.message}`);
    }

    // Clear relevant caches
    clearCache(`campaign_media_${campaignId}`);

    return (data || []).map(patchCampaignMediaFields);
  } catch (error) {
    console.error("Error in createCampaignMediaBatch:", error);
    throw error;
  }
}

// Patch createCampaignMilestones
export async function createCampaignMilestones(
  campaignId: string,
  milestones: Omit<CampaignMilestone, 'id' | 'campaign_id' | 'created_at' | 'is_reached'>[]
): Promise<CampaignMilestone[]> {
  try {
    const milestonesData = milestones.map(milestone => ({
      ...milestone,
      campaign_id: campaignId,
      is_reached: false,
      target_date: (milestone as any).target_date ?? new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("campaign_milestones")
      .insert(milestonesData)
      .select();

    if (error) {
      console.error("Database error creating campaign milestones:", error);
      throw new Error(`Failed to create campaign milestones: ${error.message}`);
    }

    // Clear relevant caches
    clearCache(`campaign_milestones_${campaignId}`);

    return (data || []).map(patchCampaignMilestoneFields);
  } catch (error) {
    console.error("Error in createCampaignMilestones:", error);
    throw error;
  }
}

// Support ticket functions
export async function createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'status' | 'priority'>): Promise<SupportTicket> {
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .insert([{
        ...ticketData,
        status: 'open',
        priority: 'medium',
      }])
      .select()
      .single();

    if (error) {
      console.error("Database error creating support ticket:", error);
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as "open" | "in_progress" | "resolved" | "closed",
      priority: data.priority as "low" | "medium" | "high" | "urgent",
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in createSupportTicket:", error);
    throw error;
  }
}

export async function getSupportTicketsByUser(userId: string): Promise<SupportTicket[]> {
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching user support tickets:", error);
      throw new Error(`Failed to fetch support tickets: ${error.message}`);
    }

    return (data || []).map((ticket: any) => ({
      ...ticket,
      status: ticket.status as "open" | "in_progress" | "resolved" | "closed",
      priority: ticket.priority as "low" | "medium" | "high" | "urgent",
      created_at: ticket.created_at || new Date().toISOString(),
      updated_at: ticket.updated_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error in getSupportTicketsByUser:", error);
    throw error;
  }
}

export async function updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating support ticket:", error);
      throw new Error(`Failed to update support ticket: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as "open" | "in_progress" | "resolved" | "closed",
      priority: data.priority as "low" | "medium" | "high" | "urgent",
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in updateSupportTicket:", error);
    throw error;
  }
}

// Payout-related functions
export async function createCampaignPayout(params: {
  campaignId: string;
  userId: string;
  amount: number;
  currency: string;
  stripeConnectAccountId: string;
}): Promise<CampaignPayout> {
  try {
    const { campaignId, userId, amount, currency, stripeConnectAccountId } = params;
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const { data, error } = await supabase
      .from("campaign_payouts")
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        amount,
        currency,
        stripe_connect_account_id: stripeConnectAccountId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating payout:", error);
      throw new Error(`Failed to create payout: ${error.message}`);
    }

    return patchPayoutFields(data);
  } catch (error) {
    console.error("Error in createCampaignPayout:", error);
    throw error;
  }
}

export async function getCampaignPayout(campaignId: string): Promise<CampaignPayout | null> {
  try {
    const { data, error } = await supabase
      .from("campaign_payouts")
      .select("*")
      .eq("campaign_id", campaignId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No payout found
      }
      console.error("Database error getting payout:", error);
      throw new Error(`Failed to get payout: ${error.message}`);
    }

    return patchPayoutFields(data);
  } catch (error) {
    console.error("Error in getCampaignPayout:", error);
    throw error;
  }
}

export async function updatePayoutStatus(payoutId: string, status: CampaignPayout["status"], stripeTransferId?: string): Promise<void> {
  try {
    const updateData: any = { status };
    if (stripeTransferId) {
      updateData.stripe_transfer_id = stripeTransferId;
    }
    if (status === "paid") {
      updateData.processed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("campaign_payouts")
      .update(updateData)
      .eq("id", payoutId);

    if (error) {
      console.error("Database error updating payout:", error);
      throw new Error(`Failed to update payout: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in updatePayoutStatus:", error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Database error getting user profile:", error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return patchUserFields(data);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
}

export async function updateUserStripeConnect(userId: string, stripeConnectAccountId: string, status: User["stripe_connect_status"]): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        stripe_connect_account_id: stripeConnectAccountId,
        stripe_connect_status: status,
        stripe_connect_onboarded_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Database error updating user Stripe Connect:", error);
      throw new Error(`Failed to update user Stripe Connect: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in updateUserStripeConnect:", error);
    throw error;
  }
}

// Helper function to patch payout fields
function patchPayoutFields(data: any): CampaignPayout {
  return {
    id: data.id,
    campaign_id: data.campaign_id,
    user_id: data.user_id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    stripe_transfer_id: data.stripe_transfer_id,
    stripe_connect_account_id: data.stripe_connect_account_id,
    requested_at: data.requested_at,
    processed_at: data.processed_at,
    expires_at: data.expires_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// Helper function to patch user fields
function patchUserFields(data: any): User {
  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    stripe_connect_account_id: data.stripe_connect_account_id,
    stripe_connect_status: data.stripe_connect_status,
    stripe_connect_onboarded_at: data.stripe_connect_onboarded_at,
  };
}

// Export cache management for admin use
export { clearCache, getCachedData, setCachedData };
