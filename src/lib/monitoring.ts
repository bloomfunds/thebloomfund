import React from 'react';

// Production monitoring and error tracking system
export interface ErrorEvent {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
}

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  details?: Record<string, any>;
}

// Centralized monitoring service
export class MonitoringService {
  private static instance: MonitoringService;
  private errors: ErrorEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private maxErrors = 1000;
  private maxMetrics = 5000;
  private flushInterval: NodeJS.Timeout;

  private constructor() {
    // Flush data every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Error tracking
  captureError(
    error: Error | string,
    context?: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): void {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      userId,
      sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    this.errors.push(errorEvent);

    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorEvent);
    }

    // In production, you'd send this to an error tracking service
    this.sendToErrorService(errorEvent);
  }

  // Performance monitoring
  captureMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date(),
      name,
      value,
      unit,
      tags,
    };

    this.metrics.push(metric);

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send to metrics service
    this.sendToMetricsService(metric);
  }

  // Health check monitoring
  updateHealthCheck(
    name: string,
    status: HealthCheck['status'],
    responseTime: number,
    details?: Record<string, any>
  ): void {
    const healthCheck: HealthCheck = {
      name,
      status,
      responseTime,
      lastChecked: new Date(),
      details,
    };

    this.healthChecks.set(name, healthCheck);
  }

  // Performance timing wrapper
  async timeOperation<T>(
    name: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.captureMetric(name, duration, 'ms', {
        ...tags,
        status: 'success',
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.captureMetric(name, duration, 'ms', {
        ...tags,
        status: 'error',
      });
      
      this.captureError(error as Error, { operation: name });
      throw error;
    }
  }

  // Database operation monitoring
  async monitorDatabaseOperation<T>(
    operation: string,
    query: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    return this.timeOperation(
      `db.${operation}`,
      operationFn,
      {
        operation,
        query: query.substring(0, 100), // Truncate long queries
      }
    );
  }

  // API request monitoring
  async monitorApiRequest<T>(
    endpoint: string,
    method: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    return this.timeOperation(
      `api.${method.toLowerCase()}.${endpoint}`,
      requestFn,
      {
        endpoint,
        method,
      }
    );
  }

  // Get current system status
  getSystemStatus(): {
    errors: { count: number; recent: ErrorEvent[] };
    metrics: { count: number; recent: PerformanceMetric[] };
    health: HealthCheck[];
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return {
      errors: {
        count: this.errors.length,
        recent: this.errors.filter(e => e.timestamp > oneHourAgo),
      },
      metrics: {
        count: this.metrics.length,
        recent: this.metrics.filter(m => m.timestamp > oneHourAgo),
      },
      health: Array.from(this.healthChecks.values()),
    };
  }

  // Get error rate
  getErrorRate(timeWindowMs: number = 60 * 60 * 1000): number {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowMs);
    
    const errorsInWindow = this.errors.filter(e => e.timestamp > windowStart);
    const totalRequests = this.metrics.filter(m => 
      m.timestamp > windowStart && m.name.startsWith('api.')
    ).length;

    return totalRequests > 0 ? (errorsInWindow.length / totalRequests) * 100 : 0;
  }

  // Get average response time
  getAverageResponseTime(timeWindowMs: number = 60 * 60 * 1000): number {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowMs);
    
    const metricsInWindow = this.metrics.filter(m => 
      m.timestamp > windowStart && m.name.startsWith('api.')
    );

    if (metricsInWindow.length === 0) return 0;

    const totalTime = metricsInWindow.reduce((sum, m) => sum + m.value, 0);
    return totalTime / metricsInWindow.length;
  }

  // Send to external error tracking service (Sentry, etc.)
  private sendToErrorService(error: ErrorEvent): void {
    // In production, implement integration with error tracking service
    // For now, we'll just log to console
    if (process.env.NODE_ENV === 'production') {
      console.error('Error tracking:', {
        message: error.message,
        stack: error.stack,
        context: error.context,
        userId: error.userId,
        timestamp: error.timestamp,
      });
    }
  }

  // Send to external metrics service (DataDog, etc.)
  private sendToMetricsService(metric: PerformanceMetric): void {
    // In production, implement integration with metrics service
    // For now, we'll just log to console
    if (process.env.NODE_ENV === 'production') {
      console.log('Metric tracking:', {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
        timestamp: metric.timestamp,
      });
    }
  }

  // Flush data to external services
  private flush(): void {
    // In production, this would batch and send data to external services
    if (process.env.NODE_ENV === 'production') {
      console.log('Flushing monitoring data...');
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

// React error boundary with monitoring
export class MonitoredErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean; error?: Error }
> {
  private monitoring = MonitoringService.getInstance();

  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.monitoring.captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">
              Something went wrong
            </h2>
            <p className="text-muted-foreground">
              We've been notified and are working to fix this issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const monitoring = MonitoringService.getInstance();

  const trackEvent = (name: string, data?: Record<string, any>) => {
    monitoring.captureMetric(`event.${name}`, 1, 'count', data);
  };

  const trackTiming = (name: string, duration: number) => {
    monitoring.captureMetric(`timing.${name}`, duration, 'ms');
  };

  return { trackEvent, trackTiming };
}

// Database monitoring wrapper
export function withDatabaseMonitoring<TArgs extends any[], TResult>(
  operation: string,
  fn: (...args: TArgs) => Promise<TResult>
) {
  const monitoring = MonitoringService.getInstance();
  
  return async (...args: TArgs): Promise<TResult> => {
    return monitoring.monitorDatabaseOperation(
      operation,
      JSON.stringify(args),
      () => fn(...args)
    );
  };
} 