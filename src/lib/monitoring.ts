// Application monitoring and error tracking
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

class MonitoringService {
  private errorQueue: ErrorReport[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
  }

  private setupGlobalErrorHandling() {
    if (!this.isEnabled) return;

    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high'
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'medium'
      });
    });
  }

  private setupPerformanceMonitoring() {
    if (!this.isEnabled || !('performance' in window)) return;

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.recordMetric('first_contentful_paint', this.getFirstContentfulPaint());
        }
      }, 0);
    });
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  reportError(error: Partial<ErrorReport>) {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || Date.now(),
      userId: error.userId,
      severity: error.severity || 'medium'
    };

    this.errorQueue.push(errorReport);
    console.error('Error reported:', errorReport);

    // In production, send to error tracking service
    this.flushErrors();
  }

  recordMetric(name: string, value: number) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href
    };

    this.metricsQueue.push(metric);
    
    // In production, send to analytics service
    this.flushMetrics();
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    try {
      // In production, replace with actual error tracking service
      console.log('Flushing errors:', this.errorQueue);
      this.errorQueue = [];
    } catch (error) {
      console.error('Failed to flush errors:', error);
    }
  }

  private async flushMetrics() {
    if (this.metricsQueue.length === 0) return;

    try {
      // In production, replace with actual analytics service
      console.log('Flushing metrics:', this.metricsQueue);
      this.metricsQueue = [];
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  // Health check endpoint
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      environment: import.meta.env.MODE,
      features: {
        supabase: !!import.meta.env.VITE_SUPABASE_URL,
        analytics: this.isEnabled,
        mockMode: import.meta.env.VITE_USE_MOCK_DB === 'true'
      }
    };
  }
}

export const monitoring = new MonitoringService();

// Performance measurement utilities
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    monitoring.recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    monitoring.recordMetric(`${name}_error`, duration);
    throw error;
  }
};

// User session tracking
export const trackUserSession = (userId: string) => {
  if (!monitoring) return;
  
  const sessionStart = Date.now();
  
  // Track session duration on page unload
  window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - sessionStart;
    monitoring.recordMetric('session_duration', sessionDuration);
  });
};