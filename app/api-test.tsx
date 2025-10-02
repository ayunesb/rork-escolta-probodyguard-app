import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export default function APITestScreen() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    results.push({
      name: 'Environment Variables',
      status: 'pending',
      message: 'Checking...',
    });
    setTests([...results]);

    try {
      const hasFirebaseKey = !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      const hasStripeKey = !!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      
      results[results.length - 1] = {
        name: 'Environment Variables',
        status: hasFirebaseKey && hasStripeKey ? 'success' : 'warning',
        message: hasFirebaseKey && hasStripeKey ? 'All keys present' : 'Some keys missing',
        details: `Firebase: ${hasFirebaseKey ? '✓' : '✗'}, Stripe: ${hasStripeKey ? '✓' : '✗'}`,
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Failed to check',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    setTests([...results]);

    results.push({
      name: 'Firebase Auth',
      status: 'pending',
      message: 'Checking...',
    });
    setTests([...results]);

    try {
      const currentUser = auth.currentUser;
      results[results.length - 1] = {
        name: 'Firebase Auth',
        status: 'success',
        message: currentUser ? 'User authenticated' : 'No user (OK)',
        details: currentUser ? `UID: ${currentUser.uid}` : 'Auth service initialized',
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Firebase Auth',
        status: 'error',
        message: 'Auth check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    setTests([...results]);

    results.push({
      name: 'Firebase Firestore',
      status: 'pending',
      message: 'Checking...',
    });
    setTests([...results]);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(1));
      await getDocs(q);
      
      results[results.length - 1] = {
        name: 'Firebase Firestore',
        status: 'success',
        message: 'Connected successfully',
        details: 'Can read from Firestore',
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Firebase Firestore',
        status: 'error',
        message: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    setTests([...results]);

    results.push({
      name: 'tRPC Health Check',
      status: 'pending',
      message: 'Checking...',
    });
    setTests([...results]);

    try {
      const response = await trpcClient.example.hi.query();
      results[results.length - 1] = {
        name: 'tRPC Health Check',
        status: 'success',
        message: 'API responding',
        details: response.message,
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'tRPC Health Check',
        status: 'error',
        message: 'API not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    setTests([...results]);

    results.push({
      name: 'Guards List API',
      status: 'pending',
      message: 'Checking...',
    });
    setTests([...results]);

    try {
      const guards = await trpcClient.guards.list.query({});
      results[results.length - 1] = {
        name: 'Guards List API',
        status: 'success',
        message: `Found ${guards.length} guards`,
        details: 'Guards API working',
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Guards List API',
        status: 'error',
        message: 'Failed to fetch guards',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    setTests([...results]);

    results.push({
      name: 'Stripe Configuration',
      status: 'pending',
      message: 'Checking...',
    });
    setTests([...results]);

    try {
      const hasPublishableKey = !!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const keyPrefix = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7);
      
      results[results.length - 1] = {
        name: 'Stripe Configuration',
        status: hasPublishableKey ? 'success' : 'warning',
        message: hasPublishableKey ? 'Stripe configured' : 'Stripe key missing',
        details: hasPublishableKey ? `Key: ${keyPrefix}...` : 'Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Stripe Configuration',
        status: 'error',
        message: 'Failed to check',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    setTests([...results]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} color={Colors.success} />;
      case 'error':
        return <XCircle size={24} color={Colors.error} />;
      case 'warning':
        return <AlertCircle size={24} color={Colors.warning} />;
      case 'pending':
        return <ActivityIndicator size="small" color={Colors.gold} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'pending':
        return Colors.gold;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'System Health Check',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{successCount}</Text>
            <Text style={styles.statLabel}>Passed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{warningCount}</Text>
            <Text style={styles.statLabel}>Warnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.error }]}>{errorCount}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, isRunning && styles.refreshButtonDisabled]}
          onPress={runTests}
          disabled={isRunning}
        >
          <RefreshCw size={20} color={Colors.background} />
          <Text style={styles.refreshButtonText}>
            {isRunning ? 'Running...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {tests.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <View style={styles.testHeader}>
              {getStatusIcon(test.status)}
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                  {test.message}
                </Text>
                {test.details && (
                  <Text style={styles.testDetails}>{test.details}</Text>
                )}
              </View>
            </View>
          </View>
        ))}

        {tests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tests run yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    padding: 16,
    borderRadius: 12,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  testCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testMessage: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  testDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
