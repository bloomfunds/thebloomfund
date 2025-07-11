import { supabase } from './supabase';

// Production analytics system for tracking thousands of users
export class AnalyticsService {
  private static instance: AnalyticsService;
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track page views
  async trackPageView(page: string, userId?: string, metadata?: any) {
    await this.trackEvent('page_view', {
      page,
      userId,
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track campaign views
  async trackCampaignView(campaignId: string, userId?: string, metadata?: any) {
    await this.trackEvent('campaign_view', {
      campaignId,
      userId,
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });

    // Update campaign view count in database
    try {
      await supabase.rpc('increment_campaign_views', { campaign_id: campaignId });
    } catch (error) {
      console.error('Failed to increment campaign views:', error);
    }
  }

  // Track user interactions
  async trackInteraction(action: string, target: string, userId?: string, metadata?: any) {
    await this.trackEvent('interaction', {
      action,
      target,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track donations
  async trackDonation(campaignId: string, amount: number, userId?: string, metadata?: any) {
    await this.trackEvent('donation', {
      campaignId,
      amount,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track campaign creation
  async trackCampaignCreated(campaignId: string, userId: string, metadata?: any) {
    await this.trackEvent('campaign_created', {
      campaignId,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track user registration
  async trackUserRegistered(userId: string, metadata?: any) {
    await this.trackEvent('user_registered', {
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track search queries
  async trackSearch(query: string, results: number, userId?: string, metadata?: any) {
    await this.trackEvent('search', {
      query,
      results,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track social shares
  async trackSocialShare(campaignId: string, platform: string, userId?: string, metadata?: any) {
    await this.trackEvent('social_share', {
      campaignId,
      platform,
      userId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });

    // Update campaign share count
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ shares_count: supabase.rpc('increment', { val: 1 }) })
        .eq('id', campaignId);
      
      if (error) {
        console.error('Failed to update share count:', error);
      }
    } catch (error) {
      console.error('Failed to update share count:', error);
    }
  }

  // Track errors
  async trackError(error: Error, context?: any, userId?: string) {
    await this.trackEvent('error', {
      error: error.message,
      stack: error.stack,
      context,
      userId,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track performance metrics
  async trackPerformance(metric: string, value: number, metadata?: any) {
    await this.trackEvent('performance', {
      metric,
      value,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Core tracking method
  private async trackEvent(eventType: string, data: any) {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      event_type: eventType,
      data,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      user_id: data.userId,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent
    };

    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushEvents();
    }

    // Start flush timer if not already running
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushEvents();
      }, this.flushInterval);
    }
  }

  // Flush events to database
  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToFlush);

      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-queue events for retry
        this.eventQueue.unshift(...eventsToFlush);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  // Get session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Get client IP (simplified - in production you'd get this from your server)
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Analytics reporting methods
  async getCampaignAnalytics(campaignId: string, dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('data->campaignId', campaignId);

      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start)
          .lte('timestamp', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return this.processCampaignAnalytics(data || []);
    } catch (error) {
      console.error('Get campaign analytics error:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId: string, dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId);

      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start)
          .lte('timestamp', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return this.processUserAnalytics(data || []);
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  }

  async getPlatformAnalytics(dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*');

      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start)
          .lte('timestamp', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return this.processPlatformAnalytics(data || []);
    } catch (error) {
      console.error('Get platform analytics error:', error);
      throw error;
    }
  }

  // Process analytics data
  private processCampaignAnalytics(events: AnalyticsEvent[]) {
    const views = events.filter(e => e.event_type === 'campaign_view').length;
    const donations = events.filter(e => e.event_type === 'donation');
    const shares = events.filter(e => e.event_type === 'social_share').length;
    const totalDonated = donations.reduce((sum, e) => sum + (e.data.amount || 0), 0);
    const uniqueDonors = new Set(donations.map(e => e.user_id)).size;

    return {
      views,
      donations: donations.length,
      totalDonated,
      uniqueDonors,
      shares,
      conversionRate: views > 0 ? (donations.length / views) * 100 : 0,
      averageDonation: donations.length > 0 ? totalDonated / donations.length : 0
    };
  }

  private processUserAnalytics(events: AnalyticsEvent[]) {
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const interactions = events.filter(e => e.event_type === 'interaction').length;
    const donations = events.filter(e => e.event_type === 'donation').length;
    const campaignsCreated = events.filter(e => e.event_type === 'campaign_created').length;

    return {
      pageViews,
      interactions,
      donations,
      campaignsCreated,
      engagementScore: (pageViews + interactions * 2 + donations * 5 + campaignsCreated * 10) / 10
    };
  }

  private processPlatformAnalytics(events: AnalyticsEvent[]) {
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size;
    const eventTypes = events.reduce((acc, e) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      uniqueUsers,
      eventTypes,
      averageEventsPerUser: uniqueUsers > 0 ? totalEvents / uniqueUsers : 0
    };
  }

  // Cleanup on page unload
  cleanup() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushEvents();
  }
}

// Analytics event type
interface AnalyticsEvent {
  id: string;
  event_type: string;
  data: any;
  timestamp: string;
  session_id: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsService.cleanup();
  });
} 