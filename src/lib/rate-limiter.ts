// Production rate limiting system for handling millions of users
export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  // Rate limit configurations
  private readonly limitsConfig = {
    // Authentication limits
    auth: {
      signIn: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      signUp: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
      passwordReset: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    },
    // API limits
    api: {
      campaigns: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
      search: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 searches per minute
      upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
      support: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 tickets per hour
    },
    // General limits
    general: {
      pageViews: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 page views per minute
      formSubmissions: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 form submissions per minute
    }
  };

  private constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Check if request is allowed
  isAllowed(identifier: string, type: string, action: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `${identifier}:${type}:${action}`;
    const now = Date.now();
    
    // Get limit configuration with proper typing
    const typeConfig = this.limitsConfig[type as keyof typeof this.limitsConfig];
    const limitConfig = typeConfig && (typeConfig as any)[action];
    
    if (!limitConfig) {
      return { allowed: true, remaining: 999, resetTime: now + 60000 };
    }

    const current = this.limits.get(key);
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + limitConfig.windowMs
      });
      return {
        allowed: true,
        remaining: limitConfig.maxRequests - 1,
        resetTime: now + limitConfig.windowMs
      };
    }

    if (current.count >= limitConfig.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }

    // Increment count
    current.count++;
    this.limits.set(key, current);

    return {
      allowed: true,
      remaining: limitConfig.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  // Get client identifier (IP, user ID, or session)
  getClientIdentifier(req: Request): string {
    // In a real implementation, you'd get this from headers or user session
    // For now, we'll use a simple hash of the user agent and IP
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    
    // Simple hash function
    let hash = 0;
    const str = userAgent + forwardedFor + realIp;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString();
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.limits.entries()) {
      if (now > value.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  // Reset limits for a specific identifier
  reset(identifier: string, type: string, action: string): void {
    const key = `${identifier}:${type}:${action}`;
    this.limits.delete(key);
  }

  // Get current limits for debugging
  getCurrentLimits(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.limits.entries()) {
      result[key] = {
        count: value.count,
        resetTime: new Date(value.resetTime).toISOString(),
        remaining: this.getRemainingRequests(key, value)
      };
    }
    return result;
  }

  private getRemainingRequests(key: string, value: { count: number; resetTime: number }): number {
    const [identifier, type, action] = key.split(':');
    const typeConfig = this.limitsConfig[type as keyof typeof this.limitsConfig];
    const limitConfig = typeConfig && (typeConfig as any)[action];
    if (!limitConfig) return 999;
    return Math.max(0, limitConfig.maxRequests - value.count);
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

// Rate limiting middleware for API routes
export function withRateLimit(
  handler: Function,
  type: string,
  action: string
) {
  return async (req: Request, ...args: any[]) => {
    const rateLimiter = RateLimiter.getInstance();
    const identifier = rateLimiter.getClientIdentifier(req);
    
    const { allowed, remaining, resetTime } = rateLimiter.isAllowed(identifier, type, action);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetTime: new Date(resetTime).toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req, ...args);
    
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
    }
    
    return response;
  };
}

// Client-side rate limiting for UI components
export class ClientRateLimiter {
  private static instance: ClientRateLimiter;
  private limits: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): ClientRateLimiter {
    if (!ClientRateLimiter.instance) {
      ClientRateLimiter.instance = new ClientRateLimiter();
    }
    return ClientRateLimiter.instance;
  }

  isAllowed(action: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const key = `client:${action}`;
    const now = Date.now();
    
    const current = this.limits.get(key);
    
    if (!current || now > current.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    this.limits.set(key, current);
    return true;
  }

  reset(action: string): void {
    const key = `client:${action}`;
    this.limits.delete(key);
  }
} 