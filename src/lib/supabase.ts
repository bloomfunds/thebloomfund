import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client for development when environment variables are not set
const createMockClient = () => {
  return {
    auth: {
      signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithOAuth: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: "Supabase not configured" } }) }) }),
      insert: async () => ({ error: { message: "Supabase not configured" } }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  } as any;
};

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient();

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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
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
