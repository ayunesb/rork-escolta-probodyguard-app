import * as Sentry from '@sentry/react-native';

// Sentry configuration
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    beforeSend: (event, hint) => {
      // Filter out known issues or PII
      if (event.exception) {
        const error = hint.originalException as Error;
        // Don't send network errors in development
        if (__DEV__ && error?.message?.includes('Network request failed')) {
          return null;
        }
      }
      return event;
    },
  });
};

// Custom error boundary for React components
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring with manual spans
export const measurePerformance = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    Sentry.addBreadcrumb({
      message: `Performance: ${name}`,
      level: 'info',
      data: { duration, status: 'success' },
    });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    Sentry.addBreadcrumb({
      message: `Performance: ${name}`,
      level: 'error',
      data: { duration, status: 'error' },
    });
    throw error;
  }
};

// Custom event tracking
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: eventName,
    level: 'info',
    data,
  });
};

// User context
export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser(user);
};

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

export default Sentry;