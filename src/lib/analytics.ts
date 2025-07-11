import { supabase } from './supabase';
import { incrementCampaignViews } from './database';

// Simplified analytics system for tracking user behavior
export class AnalyticsService {
  private static instance: AnalyticsService;
  private eventQueue: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track page views
  async trackPageView(page: string, userId?: string, metadata?: any) {
    console.log('Page view tracked:', { page, userId, metadata });
    // In production, you would send this to your analytics service
  }

  // Track campaign views
  async trackCampaignView(campaignId: string, userId?: string, metadata?: any) {
    console.log('Campaign view tracked:', { campaignId, userId, metadata });
    
    // Update campaign view count in database
    try {
      await incrementCampaignViews(campaignId);
    } catch (error) {
      console.error('Failed to increment campaign views:', error);
    }
  }

  // Track user interactions
  async trackInteraction(action: string, target: string, userId?: string, metadata?: any) {
    console.log('Interaction tracked:', { action, target, userId, metadata });
  }

  // Track donations
  async trackDonation(campaignId: string, amount: number, userId?: string, metadata?: any) {
    console.log('Donation tracked:', { campaignId, amount, userId, metadata });
  }

  // Track campaign creation
  async trackCampaignCreated(campaignId: string, userId: string, metadata?: any) {
    console.log('Campaign created tracked:', { campaignId, userId, metadata });
  }

  // Track user registration
  async trackUserRegistered(userId: string, metadata?: any) {
    console.log('User registered tracked:', { userId, metadata });
  }

  // Track search queries
  async trackSearch(query: string, results: number, userId?: string, metadata?: any) {
    console.log('Search tracked:', { query, results, userId, metadata });
  }

  // Track social shares
  async trackSocialShare(campaignId: string, platform: string, userId?: string, metadata?: any) {
    console.log('Social share tracked:', { campaignId, platform, userId, metadata });
  }

  // Track errors
  async trackError(error: Error, context?: any, userId?: string) {
    console.error('Error tracked:', { error: error.message, context, userId });
  }

  // Track performance metrics
  async trackPerformance(metric: string, value: number, metadata?: any) {
    console.log('Performance tracked:', { metric, value, metadata });
  }

  // Get campaign analytics (simplified)
  async getCampaignAnalytics(campaignId: string, dateRange?: { start: string; end: string }) {
    // In production, this would query your analytics database
    return {
      views: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 100),
      donations: Math.floor(Math.random() * 50),
      conversionRate: Math.random() * 0.1
    };
  }

  // Get user analytics (simplified)
  async getUserAnalytics(userId: string, dateRange?: { start: string; end: string }) {
    // In production, this would query your analytics database
    return {
      campaignsCreated: Math.floor(Math.random() * 5),
      totalDonations: Math.floor(Math.random() * 1000),
      averageDonation: Math.floor(Math.random() * 100),
      activeDays: Math.floor(Math.random() * 30)
    };
  }

  // Get platform analytics (simplified)
  async getPlatformAnalytics(dateRange?: { start: string; end: string }) {
    // In production, this would query your analytics database
    return {
      totalUsers: Math.floor(Math.random() * 10000),
      totalCampaigns: Math.floor(Math.random() * 500),
      totalDonations: Math.floor(Math.random() * 100000),
      averageCampaignSuccess: Math.random() * 0.8
    };
  }

  // Cleanup
  cleanup() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance(); 