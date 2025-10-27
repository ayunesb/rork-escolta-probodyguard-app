// Optional: Performance monitoring is disabled if package is not installed
// To enable: npm install @react-native-firebase/perf
let perf: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const perfModule = require('@react-native-firebase/perf');
  perf = perfModule.default;
} catch {
  // Package not installed - performance monitoring disabled
  console.log('[Performance] @react-native-firebase/perf not installed, monitoring disabled');
}

// Performance Monitoring Service
class PerformanceService {
  private static instance: PerformanceService;
  private traces: Map<string, any> = new Map();
  private enabled: boolean = perf !== null;

  static getInstance() {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Start a custom trace
  async startTrace(traceName: string): Promise<any> {
    if (!this.enabled) {
      console.log(`[Performance] Monitoring disabled, skipping trace: ${traceName}`);
      return null;
    }
    try {
      const trace = perf().newTrace(traceName);
      await trace.start();
      this.traces.set(traceName, trace);
      console.log(`[Performance] Started trace: ${traceName}`);
      return trace;
    } catch (error) {
      console.error(`[Performance] Failed to start trace ${traceName}:`, error);
      throw error;
    }
  }

  // Stop a trace
  async stopTrace(traceName: string): Promise<void> {
    if (!this.enabled) return;
    
    try {
      const trace = this.traces.get(traceName);
      if (trace) {
        await trace.stop();
        this.traces.delete(traceName);
        console.log(`[Performance] Stopped trace: ${traceName}`);
      } else {
        console.warn(`[Performance] Trace not found: ${traceName}`);
      }
    } catch (error) {
      console.error(`[Performance] Failed to stop trace ${traceName}:`, error);
    }
  }

  // Add custom attributes to a trace
  putAttribute(traceName: string, key: string, value: string): void {
    if (!this.enabled) return;
    
    try {
      const trace = this.traces.get(traceName);
      if (trace) {
        trace.putAttribute(key, value);
        console.log(`[Performance] Added attribute to ${traceName}: ${key}=${value}`);
      }
    } catch (error) {
      console.error(`[Performance] Failed to add attribute to ${traceName}:`, error);
    }
  }

  // Add metrics to a trace
  putMetric(traceName: string, metricName: string, value: number): void {
    try {
      const trace = this.traces.get(traceName);
      if (trace) {
        trace.putMetric(metricName, value);
        console.log(`[Performance] Added metric to ${traceName}: ${metricName}=${value}`);
      }
    } catch (error) {
      console.error(`[Performance] Failed to add metric to ${traceName}:`, error);
    }
  }

  // Increment a metric
  incrementMetric(traceName: string, metricName: string, incrementBy = 1): void {
    try {
      const trace = this.traces.get(traceName);
      if (trace) {
        trace.incrementMetric(metricName, incrementBy);
        console.log(`[Performance] Incremented metric ${metricName} by ${incrementBy}`);
      }
    } catch (error) {
      console.error(`[Performance] Failed to increment metric:`, error);
    }
  }

  // Measure API call performance
  async measureApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const traceName = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    try {
      const trace = await this.startTrace(traceName);
      trace.putAttribute('endpoint', endpoint);
      
      const startTime = Date.now();
      
      try {
        const result = await apiCall();
        const duration = Date.now() - startTime;
        
        trace.putAttribute('status', 'success');
        trace.putMetric('response_time', duration);
        
        await this.stopTrace(traceName);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        trace.putAttribute('status', 'error');
        trace.putAttribute('error_message', (error as Error).message);
        trace.putMetric('response_time', duration);
        
        await this.stopTrace(traceName);
        throw error;
      }
    } catch (error) {
      console.error(`[Performance] Failed to measure API call ${endpoint}:`, error);
      throw error;
    }
  }

  // Measure screen load performance
  async measureScreenLoad(screenName: string, loadFunction: () => Promise<void>): Promise<void> {
    const traceName = `screen_${screenName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    try {
      const trace = await this.startTrace(traceName);
      trace.putAttribute('screen_name', screenName);
      
      const startTime = Date.now();
      
      try {
        await loadFunction();
        const loadTime = Date.now() - startTime;
        
        trace.putAttribute('status', 'success');
        trace.putMetric('load_time', loadTime);
        
        await this.stopTrace(traceName);
      } catch (error) {
        const loadTime = Date.now() - startTime;
        
        trace.putAttribute('status', 'error');
        trace.putAttribute('error_message', (error as Error).message);
        trace.putMetric('load_time', loadTime);
        
        await this.stopTrace(traceName);
        throw error;
      }
    } catch (error) {
      console.error(`[Performance] Failed to measure screen load ${screenName}:`, error);
      throw error;
    }
  }

  // Measure payment processing performance
  async measurePaymentProcessing<T>(
    amount: number,
    paymentFunction: () => Promise<T>
  ): Promise<T> {
    const traceName = 'payment_processing';
    
    try {
      const trace = await this.startTrace(traceName);
      trace.putAttribute('amount_range', this.getAmountRange(amount));
      trace.putMetric('amount', amount);
      
      const startTime = Date.now();
      
      try {
        const result = await paymentFunction();
        const processingTime = Date.now() - startTime;
        
        trace.putAttribute('status', 'success');
        trace.putMetric('processing_time', processingTime);
        
        await this.stopTrace(traceName);
        return result;
      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        trace.putAttribute('status', 'error');
        trace.putAttribute('error_type', (error as Error).name);
        trace.putMetric('processing_time', processingTime);
        
        await this.stopTrace(traceName);
        throw error;
      }
    } catch (error) {
      console.error('[Performance] Failed to measure payment processing:', error);
      throw error;
    }
  }

  // Helper method to categorize amounts
  private getAmountRange(amount: number): string {
    if (amount < 500) return 'small';
    if (amount < 2000) return 'medium';
    if (amount < 5000) return 'large';
    return 'extra_large';
  }

  // Measure booking creation performance
  async measureBookingCreation<T>(
    bookingData: any,
    bookingFunction: () => Promise<T>
  ): Promise<T> {
    const traceName = 'booking_creation';
    
    try {
      const trace = await this.startTrace(traceName);
      trace.putAttribute('service_type', bookingData.serviceType || 'unknown');
      trace.putAttribute('duration_range', this.getDurationRange(bookingData.duration || 0));
      
      const startTime = Date.now();
      
      try {
        const result = await bookingFunction();
        const creationTime = Date.now() - startTime;
        
        trace.putAttribute('status', 'success');
        trace.putMetric('creation_time', creationTime);
        
        await this.stopTrace(traceName);
        return result;
      } catch (error) {
        const creationTime = Date.now() - startTime;
        
        trace.putAttribute('status', 'error');
        trace.putAttribute('error_type', (error as Error).name);
        trace.putMetric('creation_time', creationTime);
        
        await this.stopTrace(traceName);
        throw error;
      }
    } catch (error) {
      console.error('[Performance] Failed to measure booking creation:', error);
      throw error;
    }
  }

  // Helper method to categorize durations
  private getDurationRange(duration: number): string {
    if (duration < 60) return 'short';
    if (duration < 240) return 'medium';
    if (duration < 480) return 'long';
    return 'extended';
  }

  // Create a generic performance wrapper
  async measure<T>(
    operationName: string,
    operation: () => Promise<T>,
    attributes?: Record<string, string>
  ): Promise<T> {
    const traceName = operationName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    
    try {
      const trace = await this.startTrace(traceName);
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          trace.putAttribute(key, value);
        });
      }
      
      const startTime = Date.now();
      
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        
        trace.putAttribute('status', 'success');
        trace.putMetric('duration', duration);
        
        await this.stopTrace(traceName);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        trace.putAttribute('status', 'error');
        trace.putAttribute('error_message', (error as Error).message);
        trace.putMetric('duration', duration);
        
        await this.stopTrace(traceName);
        throw error;
      }
    } catch (error) {
      console.error(`[Performance] Failed to measure ${operationName}:`, error);
      throw error;
    }
  }
}

export const performanceService = PerformanceService.getInstance();
export default performanceService;