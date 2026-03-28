import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { logger } from '@/utils/logger';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for critical screens (payment, booking, admin)
 * Catches errors and displays user-friendly fallback UI
 */
export class CriticalScreenErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service in production
    logger.error('[CriticalScreenErrorBoundary] Screen crashed', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    }, { sendToMonitoring: true });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} message={this.props.fallbackMessage} />;
    }

    return this.props.children;
  }
}

/**
 * Fallback UI shown when an error is caught
 */
function ErrorFallback({ 
  error, 
  onReset, 
  message 
}: { 
  error: Error | null; 
  onReset: () => void;
  message?: string;
}) {
  const router = useRouter();

  const handleGoBack = () => {
    onReset();
    router.back();
  };

  const handleGoHome = () => {
    onReset();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          {message || "We're sorry for the inconvenience. Please try again."}
        </Text>
        
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleGoHome}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.gold,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});

/**
 * Higher-order component to wrap screens with error boundary
 * 
 * Usage:
 * export default withErrorBoundary(MyScreen, {
 *   fallbackMessage: "Payment processing failed. Please try again."
 * });
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <CriticalScreenErrorBoundary {...options}>
        <Component {...props} />
      </CriticalScreenErrorBoundary>
    );
  };
}
