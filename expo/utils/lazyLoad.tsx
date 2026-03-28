import React, { Suspense, ComponentType, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#D4AF37" />
  </View>
);

export function lazyLoadScreen<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.FC {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export function lazyLoadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.FC {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#000',
  },
});
