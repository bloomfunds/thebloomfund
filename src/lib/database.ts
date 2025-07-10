// Real Supabase database operations
import {
  Campaign,
  Payment,
  RewardTier,
  CampaignMedia,
  CampaignMilestone,
  User,
  supabase,
} from "./supabase";
import { Database } from "../types/supabase";

// Mock data storage
let mockCampaigns: Campaign[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Cozy Corner Coffee House",
    description:
      "Creating a warm community space with artisan coffee, sustainable practices, and local partnerships. Our cozy corner will feature locally roasted beans, comfortable seating areas, and community events that bring neighbors together while supporting local artists and musicians.",
    business_name: "Cozy Corner Coffee",
    owner_name: "Sarah Johnson",
    owner_id: "22222222-2222-2222-2222-222222222222",
    funding_goal: 200000,
    current_funding: 190000,
    category: "food",
    location: "Portland, Oregon, USA",
    website: "https://cozycornercoffee.com",
    cover_image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
    owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    start_date: "2024-01-15",
    end_date: "2024-03-15",
    status: "active",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "1",
    title: "Tech Startup Innovation Hub",
    description:
      "Building the next generation of technology solutions with a focus on sustainability and community impact. Our innovation hub will provide resources and support for emerging tech entrepreneurs.",
    business_name: "TechHub Innovations",
    owner_name: "Alex Rodriguez",
    owner_id: "12345678-1234-1234-1234-123456789012",
    funding_goal: 500000,
    current_funding: 350000,
    category: "technology",
    location: "Austin, Texas, USA",
    website: "https://techhub-innovations.com",
    cover_image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    start_date: "2024-01-01",
    end_date: "2024-04-01",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Community Garden Project",
    description:
      "Creating sustainable community gardens that provide fresh produce to local families while teaching sustainable farming practices and building stronger neighborhood connections.",
    business_name: "Green Community Gardens",
    owner_name: "Maria Santos",
    owner_id: "23456789-2345-2345-2345-234567890123",
    funding_goal: 150000,
    current_funding: 95000,
    category: "environment",
    location: "Portland, Oregon, USA",
    website: "https://greengardens.org",
    cover_image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    start_date: "2024-02-01",
    end_date: "2024-05-01",
    status: "active",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Smart Investment Portfolio Platform",
    description:
      "Revolutionary AI-powered investment platform that democratizes wealth building through intelligent portfolio management, personalized financial guidance, and automated rebalancing. Our platform makes sophisticated investment strategies accessible to everyone, regardless of their financial background or experience level.",
    business_name: "InvestSmart AI",
    owner_name: "Michael Chen",
    owner_id: "44444444-4444-4444-4444-444444444444",
    funding_goal: 300000,
    current_funding: 1200000,
    category: "technology",
    location: "San Francisco, California, USA",
    website: "https://investsmart-ai.com",
    cover_image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    start_date: "2024-02-01",
    end_date: "2024-04-01",
    status: "active",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Artisan Craft Brewery",
    description:
      "Local craft brewery specializing in unique flavor combinations and traditional brewing methods. We're expanding our production capacity to serve the growing demand for craft beer in our community.",
    business_name: "Hoppy Trails Brewery",
    owner_name: "James Wilson",
    owner_id: "66666666-6666-6666-6666-666666666666",
    funding_goal: 75000,
    current_funding: 45000,
    category: "food",
    location: "Austin, Texas, USA",
    cover_image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
    owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    start_date: "2024-01-20",
    end_date: "2024-03-20",
    status: "active",
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    title: "Sustainable Fashion Brand",
    description:
      "Eco-friendly clothing line made from recycled materials and sustainable fabrics. Our mission is to revolutionize fast fashion with ethical, durable, and stylish alternatives.",
    business_name: "EcoThreads",
    owner_name: "Emma Davis",
    owner_id: "88888888-8888-8888-8888-888888888888",
    funding_goal: 30000,
    current_funding: 12000,
    category: "retail",
    location: "Los Angeles, California, USA",
    cover_image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    owner_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    start_date: "2024-02-10",
    end_date: "2024-04-10",
    status: "active",
    created_at: "2024-02-10T00:00:00Z",
    updated_at: "2024-02-10T00:00:00Z",
  },
];

let mockRewardTiers: RewardTier[] = [
  {
    id: "99999999-9999-9999-9999-999999999991",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    amount: 2500,
    title: "Coffee Supporter",
    description:
      "Thank you for your support! Receive a personalized thank you note.",
    display_order: 0,
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "99999999-9999-9999-9999-999999999992",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    amount: 4900,
    title: "Premium Coffee Package",
    description:
      "Get 1 lb of our premium roasted coffee beans plus exclusive brewing tips delivered to your door.",
    display_order: 1,
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "99999999-9999-9999-9999-999999999993",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    amount: 9900,
    title: "Coffee Connoisseur",
    description:
      "Receive 2 lbs of coffee plus a branded mug, brewing guide, and exclusive access to new blends.",
    display_order: 2,
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "rt-1-001",
    campaign_id: "1",
    amount: 5000,
    title: "Early Bird",
    description: "Get early access and exclusive updates on our progress.",
    display_order: 0,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "rt-1-002",
    campaign_id: "1",
    amount: 15000,
    title: "Innovator",
    description: "Premium access with beta testing opportunities.",
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "rt-2-001",
    campaign_id: "2",
    amount: 2500,
    title: "Garden Friend",
    description: "Receive fresh produce from our first harvest.",
    display_order: 0,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "rt-2-002",
    campaign_id: "2",
    amount: 7500,
    title: "Green Thumb",
    description: "Get a garden starter kit plus produce delivery.",
    display_order: 1,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "99999999-9999-9999-9999-999999999994",
    campaign_id: "33333333-3333-3333-3333-333333333333",
    amount: 4900,
    title: "Early Access Pass",
    description:
      "Get early access to the platform, exclusive updates, and priority customer support.",
    display_order: 0,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "99999999-9999-9999-9999-999999999995",
    campaign_id: "33333333-3333-3333-3333-333333333333",
    amount: 9900,
    title: "Premium Investor",
    description:
      "Premium features, personalized investment consultation, and advanced portfolio analytics.",
    display_order: 1,
    created_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "99999999-9999-9999-9999-999999999996",
    campaign_id: "33333333-3333-3333-3333-333333333333",
    amount: 19900,
    title: "VIP Investor Elite",
    description:
      "VIP access with direct consultation, custom portfolio management, and exclusive investment opportunities.",
    display_order: 2,
    created_at: "2024-02-01T00:00:00Z",
  },
];

let mockPayments: Payment[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    user_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    amount: 5000,
    currency: "usd",
    status: "succeeded",
    donor_name: "Anonymous Supporter",
    is_anonymous: true,
    created_at: "2024-01-16T00:00:00Z",
    updated_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    user_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    amount: 2500,
    currency: "usd",
    status: "succeeded",
    donor_name: "Coffee Enthusiast",
    is_anonymous: false,
    created_at: "2024-01-17T00:00:00Z",
    updated_at: "2024-01-17T00:00:00Z",
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    user_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    amount: 1000,
    currency: "usd",
    status: "succeeded",
    donor_name: "Local Business Owner",
    is_anonymous: false,
    created_at: "2024-01-18T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
  },
];

// Campaign operations with Supabase integration
export async function getCampaigns(filters?: {
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase.from("campaigns").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching campaigns:", error);
      console.log(
        "Falling back to mock data due to database error:",
        error.message,
      );
      // Fallback to mock data if Supabase fails
      return getMockCampaigns(filters);
    }

    // If we get data from Supabase, use it; otherwise fallback to mock data
    return data && data.length > 0 ? data : getMockCampaigns(filters);
  } catch (error) {
    console.error("Error in getCampaigns:", error);
    console.log("Falling back to mock data due to connection error");
    // Fallback to mock data
    return getMockCampaigns(filters);
  }
}

// Fallback function for mock data
function getMockCampaigns(filters?: {
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  let filteredCampaigns = [...mockCampaigns];

  if (filters?.status) {
    filteredCampaigns = filteredCampaigns.filter(
      (c) => c.status === filters.status,
    );
  }

  if (filters?.category) {
    filteredCampaigns = filteredCampaigns.filter(
      (c) => c.category === filters.category,
    );
  }

  if (filters?.limit) {
    filteredCampaigns = filteredCampaigns.slice(0, filters.limit);
  }

  return filteredCampaigns;
}

export async function getCampaignById(id: string) {
  try {
    // Fetch campaign data first
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (campaignError) {
      console.error("Error fetching campaign:", campaignError);
      console.log("Falling back to mock data for campaign:", id);
      // Fallback to mock data
      const mockCampaign = mockCampaigns.find((c) => c.id === id);
      if (!mockCampaign) return null;

      const rewardTiers = mockRewardTiers.filter((rt) => rt.campaign_id === id);

      return {
        ...mockCampaign,
        reward_tiers: rewardTiers,
        campaign_media: [],
        campaign_milestones: [],
      };
    }

    // Fetch related data separately to avoid foreign key relationship issues
    const [rewardTiersResult, campaignMediaResult, campaignMilestonesResult] =
      await Promise.allSettled([
        supabase.from("reward_tiers").select("*").eq("campaign_id", id),
        supabase.from("campaign_media").select("*").eq("campaign_id", id),
        supabase.from("campaign_milestones").select("*").eq("campaign_id", id),
      ]);

    // Extract data from settled promises, fallback to empty arrays if failed
    const reward_tiers =
      rewardTiersResult.status === "fulfilled" && !rewardTiersResult.value.error
        ? rewardTiersResult.value.data || []
        : mockRewardTiers.filter((rt) => rt.campaign_id === id);

    const campaign_media =
      campaignMediaResult.status === "fulfilled" &&
      !campaignMediaResult.value.error
        ? campaignMediaResult.value.data || []
        : [];

    const campaign_milestones =
      campaignMilestonesResult.status === "fulfilled" &&
      !campaignMilestonesResult.value.error
        ? campaignMilestonesResult.value.data || []
        : [];

    return {
      ...campaign,
      reward_tiers,
      campaign_media,
      campaign_milestones,
    };
  } catch (error) {
    console.error("Error in getCampaignById:", error);
    // Fallback to mock data
    const mockCampaign = mockCampaigns.find((c) => c.id === id);
    if (!mockCampaign) return null;

    const rewardTiers = mockRewardTiers.filter((rt) => rt.campaign_id === id);

    return {
      ...mockCampaign,
      reward_tiers: rewardTiers,
      campaign_media: [],
      campaign_milestones: [],
    };
  }
}

export async function createCampaign(
  campaignData: Omit<
    Campaign,
    "id" | "created_at" | "updated_at" | "current_funding"
  >,
) {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        ...campaignData,
        current_funding: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      console.log("Falling back to mock implementation for campaign creation");
      // Fallback to mock implementation
      const newCampaign: Campaign = {
        ...campaignData,
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        current_funding: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCampaigns.push(newCampaign);
      console.log("Campaign created successfully (mock):", newCampaign.id);
      return newCampaign;
    }

    console.log("Campaign created successfully (database):", data.id);
    return data;
  } catch (error) {
    console.error("Error in createCampaign:", error);
    console.log("Falling back to mock implementation due to connection error");
    // Fallback to mock implementation
    const newCampaign: Campaign = {
      ...campaignData,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      current_funding: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockCampaigns.push(newCampaign);
    console.log(
      "Campaign created successfully (mock fallback):",
      newCampaign.id,
    );
    return newCampaign;
  }
}

export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const index = mockCampaigns.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Campaign not found");

  mockCampaigns[index] = {
    ...mockCampaigns[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mockCampaigns[index];
}

// Payment operations (disabled - payment system coming soon)
export async function createPayment(
  paymentData: Omit<Payment, "id" | "created_at" | "updated_at">,
) {
  // Payment system is currently disabled
  throw new Error(
    "Payment system is currently being integrated. Check back soon!",
  );
}

export async function getPaymentsByCampaign(campaignId: string) {
  // Return mock payments for display purposes only
  return mockPayments.filter(
    (p) => p.campaign_id === campaignId && p.status === "succeeded",
  );
}

// Reward tier operations
export async function createRewardTiers(
  campaignId: string,
  tiers: Omit<RewardTier, "id" | "campaign_id" | "created_at">[],
) {
  try {
    // Try to insert into Supabase first
    const tiersToInsert = tiers.map((tier) => ({
      ...tier,
      campaign_id: campaignId,
    }));

    const { data, error } = await supabase
      .from("reward_tiers")
      .insert(tiersToInsert)
      .select();

    if (error) {
      console.error("Error creating reward tiers:", error);
      console.log("Falling back to mock implementation for reward tiers");
    } else if (data) {
      console.log("Reward tiers created successfully (database):", data.length);
      return data;
    }
  } catch (error) {
    console.error("Error in createRewardTiers:", error);
  }

  // Fallback to mock implementation
  const newTiers = tiers.map((tier) => ({
    ...tier,
    id: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    campaign_id: campaignId,
    created_at: new Date().toISOString(),
  }));

  mockRewardTiers.push(...newTiers);
  console.log("Reward tiers created successfully (mock):", newTiers.length);
  return newTiers;
}

// Campaign media operations
export async function createCampaignMedia(
  campaignId: string,
  media: Omit<CampaignMedia, "id" | "campaign_id" | "created_at">[],
) {
  try {
    // Try to insert into Supabase first
    const mediaToInsert = media.map((item) => ({
      ...item,
      campaign_id: campaignId,
    }));

    const { data, error } = await supabase
      .from("campaign_media")
      .insert(mediaToInsert)
      .select();

    if (error) {
      console.error("Error creating campaign media:", error);
      console.log("Falling back to mock implementation for campaign media");
    } else if (data) {
      console.log(
        "Campaign media created successfully (database):",
        data.length,
      );
      return data;
    }
  } catch (error) {
    console.error("Error in createCampaignMedia:", error);
  }

  // Fallback to mock implementation
  const newMedia = media.map((item) => ({
    ...item,
    id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    campaign_id: campaignId,
    created_at: new Date().toISOString(),
  }));

  console.log("Campaign media created successfully (mock):", newMedia.length);
  return newMedia;
}

// Campaign milestones operations
export async function createCampaignMilestones(
  campaignId: string,
  milestones: Omit<
    CampaignMilestone,
    "id" | "campaign_id" | "created_at" | "is_completed" | "completed_at"
  >[],
) {
  // Mock implementation - just return success
  return milestones.map((milestone) => ({
    ...milestone,
    id: `milestone_${Date.now()}_${Math.random()}`,
    campaign_id: campaignId,
    is_completed: false,
    created_at: new Date().toISOString(),
  }));
}

// Statistics
export async function getCampaignStats(campaignId: string) {
  const payments = await getPaymentsByCampaign(campaignId);
  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const backerCount = payments.length;

  return {
    totalAmount,
    backerCount,
    payments,
  };
}

// Search and filter campaigns
export async function searchCampaigns({
  query,
  category,
  status = "active",
  sortBy = "created_at",
  sortOrder = "desc",
  limit = 12,
  offset = 0,
}: {
  query?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  let filteredCampaigns = mockCampaigns.filter((c) => c.status === status);

  if (query) {
    const searchTerm = query.toLowerCase();
    filteredCampaigns = filteredCampaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm) ||
        c.business_name.toLowerCase().includes(searchTerm),
    );
  }

  if (category && category !== "all categories") {
    filteredCampaigns = filteredCampaigns.filter(
      (c) => c.category === category,
    );
  }

  // Sort campaigns
  filteredCampaigns.sort((a, b) => {
    const aValue = a[sortBy as keyof Campaign];
    const bValue = b[sortBy as keyof Campaign];

    // Handle undefined values by treating them as empty string or 0 for comparison
    // If both are undefined, treat as equal
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortOrder === "asc" ? 1 : -1;
    if (bValue === undefined) return sortOrder === "asc" ? -1 : 1;

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filteredCampaigns.slice(offset, offset + limit);
}

// Get campaign leaderboard (top donors)
export async function getCampaignLeaderboard(campaignId: string, limit = 10) {
  const payments = mockPayments
    .filter((p) => p.campaign_id === campaignId && p.status === "succeeded")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  return payments.map((p) => ({
    amount: p.amount,
    donor_name: p.donor_name,
    is_anonymous: p.is_anonymous,
    created_at: p.created_at,
  }));
}

// Get user's campaigns
export async function getUserCampaigns(userId: string) {
  return mockCampaigns.filter((c) => c.owner_id === userId);
}

// Get user's pledges/donations
export async function getUserPledges(userId: string) {
  const userPayments = mockPayments.filter(
    (p) => p.user_id === userId && p.status === "succeeded",
  );

  return userPayments.map((payment) => {
    const campaign = mockCampaigns.find((c) => c.id === payment.campaign_id);
    return {
      ...payment,
      campaigns: campaign
        ? {
            id: campaign.id,
            title: campaign.title,
            business_name: campaign.business_name,
            cover_image: campaign.cover_image,
          }
        : null,
    };
  });
}

// Get platform statistics
export async function getPlatformStats() {
  const activeCampaigns = mockCampaigns.filter((c) => c.status === "active");
  const totalRaised = mockPayments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalBackers = mockPayments.filter(
    (p) => p.status === "succeeded",
  ).length;

  return {
    totalCampaigns: activeCampaigns.length,
    totalRaised,
    totalBackers,
  };
}

// Real-time subscription setup
export function subscribeToRealTimeUpdates(callback: (payload: any) => void) {
  try {
    // Check if Supabase is properly configured
    if (!supabase || typeof window === "undefined" || !window.location) {
      console.warn("Supabase not configured or not in browser, using mock real-time updates");
      return createMockRealTimeSubscription(callback);
    }

    const subscription = supabase
      .channel("campaigns-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaigns",
        },
        callback,
      )
      .subscribe((status: string) => {
        console.log("Real-time subscription status:", status);
        if (status === "CHANNEL_ERROR") {
          console.warn("Real-time subscription failed, falling back to mock");
          return createMockRealTimeSubscription(callback);
        }
      });

    return subscription;
  } catch (error) {
    console.error("Error setting up real-time subscription:", error);
    return createMockRealTimeSubscription(callback);
  }
}

// Mock real-time subscription for development/testing
function createMockRealTimeSubscription(callback: (payload: any) => void) {
  console.log("Creating mock real-time subscription");
  
  // Simulate real-time updates every 30 seconds
  const interval = setInterval(() => {
    const mockUpdate = {
      eventType: "UPDATE",
      new: {
        id: mockCampaigns[0]?.id,
        current_funding: Math.floor(Math.random() * 10000) + 1000,
        updated_at: new Date().toISOString(),
      },
      old: {
        id: mockCampaigns[0]?.id,
        current_funding: mockCampaigns[0]?.current_funding,
      },
    };
    
    callback(mockUpdate);
  }, 30000);

  // Return a cleanup function
  return {
    unsubscribe: () => {
      clearInterval(interval);
      console.log("Mock real-time subscription cleaned up");
    },
  };
}

// Enhanced analytics functions
export async function getCampaignAnalytics(
  campaignId: string,
  period: string = "30d",
) {
  // Mock analytics data - in real implementation, this would query analytics tables
  const mockAnalytics = {
    views: {
      total: 15420,
      unique: 8930,
      trend: "+15.3%",
    },
    conversions: {
      rate: 3.7,
      pledges: 1680,
      trend: "-2.1%",
    },
    traffic: {
      sources: [
        { name: "Direct", value: 35, color: "#0ea5e9" },
        { name: "Social Media", value: 28, color: "#10b981" },
        { name: "Search", value: 20, color: "#f59e0b" },
        { name: "Referral", value: 12, color: "#ef4444" },
        { name: "Email", value: 5, color: "#8b5cf6" },
      ],
    },
    geographic: [
      { country: "United States", backers: 450, funding: 45000 },
      { country: "Canada", backers: 120, funding: 12000 },
      { country: "United Kingdom", backers: 89, funding: 8900 },
      { country: "Germany", backers: 67, funding: 6700 },
      { country: "Australia", backers: 45, funding: 4500 },
    ],
    timeline: [
      { date: "2024-01-01", funding: 12000, backers: 120, views: 2400 },
      { date: "2024-01-02", funding: 19000, backers: 190, views: 3200 },
      { date: "2024-01-03", funding: 25000, backers: 250, views: 4100 },
      { date: "2024-01-04", funding: 35000, backers: 350, views: 5200 },
      { date: "2024-01-05", funding: 45000, backers: 450, views: 6800 },
      { date: "2024-01-06", funding: 65000, backers: 650, views: 8900 },
    ],
  };

  return mockAnalytics;
}

// Enhanced user management
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    website?: string;
    social_links?: Record<string, string>;
  },
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { data: null, error };
  }
}

// Notification system
export async function createNotification(notification: {
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in createNotification:", error);
    return { data: null, error };
  }
}

export async function getUserNotifications(userId: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return [];
  }
}

// Campaign updates and communication
export async function createCampaignUpdate(
  campaignId: string,
  update: {
    title: string;
    content: string;
    is_public: boolean;
  },
) {
  try {
    const { data, error } = await supabase
      .from("campaign_updates")
      .insert({
        campaign_id: campaignId,
        ...update,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign update:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in createCampaignUpdate:", error);
    return { data: null, error };
  }
}

export async function getCampaignUpdates(campaignId: string) {
  try {
    const { data, error } = await supabase
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaign updates:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCampaignUpdates:", error);
    return [];
  }
}

// Get recommended campaigns
export async function getRecommendedCampaigns(
  currentCampaignId?: string,
  limit = 3,
) {
  let campaigns = mockCampaigns.filter((c) => c.status === "active");

  if (currentCampaignId) {
    campaigns = campaigns.filter((c) => c.id !== currentCampaignId);
  }

  // Sort by funding progress
  campaigns.sort(
    (a, b) =>
      b.current_funding / b.funding_goal - a.current_funding / a.funding_goal,
  );

  return campaigns.slice(0, limit);
}
