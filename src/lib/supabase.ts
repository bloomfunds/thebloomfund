import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Production Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a mock client for development when environment variables are not set
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not configured. Using mock client for development.");
  // Create a mock client that doesn't require real credentials
  supabase = {
    auth: {
      signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  };
} else {
  // Production Supabase client with enhanced configuration
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: isBrowser,
      detectSessionInUrl: isBrowser,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'thebloomfund-web',
      },
    },
  });
}

export { supabase };

// Enhanced error handling and retry logic
class SupabaseService {
  private static instance: SupabaseService;
  private retryAttempts = 3;
  private retryDelay = 1000;

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryAttempts) {
          throw lastError;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
    
    throw lastError!;
  }

  // Enhanced authentication methods
  async signUp(email: string, password: string, userData?: any) {
    return this.withRetry(async () => {
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured - using mock signup');
        // Return mock data for development
        return {
          user: { id: 'mock-user-id', email },
          session: null,
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async signIn(email: string, password: string) {
    return this.withRetry(async () => {
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured - using mock signin');
        // Return mock data for development
        return {
          user: { id: 'mock-user-id', email },
          session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async signOut() {
    return this.withRetry(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message);
      }
    });
  }

  async resetPassword(email: string) {
    return this.withRetry(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message);
      }
    });
  }

  async getCurrentUser() {
    return this.withRetry(async () => {
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured - returning null user');
        return null;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        throw new Error(error.message);
      }

      return user;
    });
  }

  // Real-time subscriptions for live updates
  subscribeToCampaign(campaignId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`campaign:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${campaignId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToPayments(campaignId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`payments:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: `campaign_id=eq.${campaignId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToUserCampaigns(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_campaigns:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `owner_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  // Enhanced database operations with proper error handling
  async createUser(userData: any) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Create user error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update user error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async getUserById(userId: string) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        console.error('Get user by ID error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  // Campaign operations with enhanced error handling
  async createCampaign(campaignData: any) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) {
        console.error('Create campaign error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async updateCampaign(campaignId: string, updates: any) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        console.error('Update campaign error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async getCampaignById(campaignId: string) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Campaign not found
        }
        console.error('Get campaign by ID error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async getCampaigns(filters?: any, limit = 20, offset = 0) {
    return this.withRetry(async () => {
      let query = supabase
        .from('campaigns')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.minGoal) {
        query = query.gte('funding_goal', filters.minGoal);
      }
      if (filters?.maxGoal) {
        query = query.lte('funding_goal', filters.maxGoal);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Get campaigns error:', error);
        throw new Error(error.message);
      }

      return { campaigns: data || [], total: count || 0 };
    });
  }

  // Payment operations
  async createPayment(paymentData: any) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Create payment error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async getPaymentsByCampaign(campaignId: string) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get payments error:', error);
        throw new Error(error.message);
      }

      return data || [];
    });
  }

  // Search functionality
  async searchCampaigns(query: string, limit = 20) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,business_name.ilike.%${query}%`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Search campaigns error:', error);
        throw new Error(error.message);
      }

      return data || [];
    });
  }

  // Analytics and reporting
  async getCampaignAnalytics(campaignId: string) {
    return this.withRetry(async () => {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const payments = await this.getPaymentsByCampaign(campaignId);
      const totalRaised = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
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
    });
  }

  // File upload handling
  async uploadFile(bucket: string, path: string, file: File) {
    return this.withRetry(async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('File upload error:', error);
        throw new Error(error.message);
      }

      return data;
    });
  }

  async getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Notification system
  async createNotification(userId: string, type: string, title: string, message: string, data?: any) {
    return this.withRetry(async () => {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          data: data || {},
        }])
        .select()
        .single();

      if (error) {
        console.error('Create notification error:', error);
        throw new Error(error.message);
      }

      return notification;
    });
  }

  async getNotifications(userId: string, limit = 50) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get notifications error:', error);
        throw new Error(error.message);
      }

      return data || [];
    });
  }


}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();

// Export the raw client for direct use when needed
export { supabase as client };

// Mock types for development
export interface Campaign {
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
  status: "draft" | "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  campaign_id: string;
  user_id?: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  receipt_email?: string;
  donor_name?: string;
  donor_message?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardTier {
  id: string;
  campaign_id: string;
  amount: number;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface CampaignMedia {
  id: string;
  campaign_id: string;
  media_type: "image" | "video";
  media_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface CampaignMilestone {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  target_date: string;
  is_completed: boolean;
  completed_at?: string;
  display_order: number;
  created_at: string;
}

// Real Supabase authentication functions
export async function signUp(
  email: string,
  password: string,
  fullName?: string,
) {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - using mock signup');
    return { 
      data: { 
        user: { id: 'mock-user-id', email }, 
        session: null 
      }, 
      error: null 
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { data: null, error };
  }

  // Create user profile in public.users table
  if (data.user && data.user.id && data.user.email) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });
    if (profileError) {
      console.error("Error creating user profile:", profileError);
    }
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - using mock signin');
    return { 
      data: { 
        user: { id: 'mock-user-id', email }, 
        session: { access_token: 'mock-token', refresh_token: 'mock-refresh' } 
      }, 
      error: null 
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured - returning null user');
    return { user: null, error: null };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}

// Real-time subscriptions
export function createRealtimeSubscription(
  table: string,
  callback: (payload: any) => void,
) {
  return supabase
    .channel(`${table}-changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
      },
      callback,
    )
    .subscribe();
}

// Enhanced user profile management
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return { data: null, error };
  }
}

// Social authentication
export async function signInWithProvider(
  provider: "google" | "github" | "facebook",
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

// Email verification
export async function resendEmailVerification() {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: "", // This would need to be passed in
  });

  return { data, error };
}

// Session management
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  return { data, error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

// Auth state change listener
export function onAuthStateChange(
  callback: (event: string, session: any) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}
