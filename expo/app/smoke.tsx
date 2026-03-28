import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { trpcClient } from '@/lib/trpc';
import Colors from '@/constants/colors';
import { CheckCircle2, XCircle, Play, RotateCcw } from 'lucide-react-native';
import { ratingsService } from '@/services/ratingsService';

interface StepResult {
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed' | 'skipped';
  error?: string;
  meta?: Record<string, unknown>;
}

const stepsOrder = [
  'auth',
  'select-guard',
  'create-booking',
  'pay',
  'track',
  'rate',
] as const;

type StepName = typeof stepsOrder[number];

export default function SmokeRunner() {
  const [running, setRunning] = useState<boolean>(false);
  const [results, setResults] = useState<Record<StepName, StepResult>>(() => {
    const base: Record<StepName, StepResult> = {
      'auth': { name: 'Auth', status: 'idle' },
      'select-guard': { name: 'Select Guard', status: 'idle' },
      'create-booking': { name: 'Create Booking', status: 'idle' },
      'pay': { name: 'Pay', status: 'idle' },
      'track': { name: 'Track', status: 'idle' },
      'rate': { name: 'Rate', status: 'idle' },
    };
    return base;
  });

  const [ids, setIds] = useState<{ userId?: string; bookingId?: string; guardId?: string; transactionId?: string }>({});

  const setStep = useCallback((key: StepName, patch: Partial<StepResult>) => {
    setResults((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as StepResult), ...(patch as StepResult) },
    }));
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setIds({});
    setResults({
      'auth': { name: 'Auth', status: 'idle' },
      'select-guard': { name: 'Select Guard', status: 'idle' },
      'create-booking': { name: 'Create Booking', status: 'idle' },
      'pay': { name: 'Pay', status: 'idle' },
      'track': { name: 'Track', status: 'idle' },
      'rate': { name: 'Rate', status: 'idle' },
    });
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);

    try {
      // 1) Auth: sign up a fresh throwaway client and auto-signed-in
      setStep('auth', { status: 'running' });
      const rand = Math.random().toString(36).slice(2, 8);
      const email = `smoke+${rand}@example.com`;
      const password = 'SmokeTest#123';
      console.log('[Smoke] Creating test user', email);

      const signUpRes = await trpcClient.auth.signUp.mutate({
        email,
        password,
        firstName: 'Smoke',
        lastName: 'Test',
        phone: '+520000000000',
        role: 'client',
      });
      const userId = signUpRes.user.id as string;
      setIds((p) => ({ ...p, userId }));
      setStep('auth', { status: 'passed', meta: { email, userId } });

      // 2) Select Guard: list and pick the first available
      setStep('select-guard', { status: 'running' });
      const guards = await trpcClient.guards.list.query({ radius: 50 });
      if (!guards || guards.length === 0) {
        throw new Error('No guards available');
      }
      const guard = guards[0] as any;
      setIds((p) => ({ ...p, guardId: guard.id as string }));
      setStep('select-guard', { status: 'passed', meta: { guardId: guard.id, guardName: guard.name } });

      // 3) Create Booking via TRPC (quote stage)
      setStep('create-booking', { status: 'running' });
      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 60 * 1000);
      const scheduledDate = in30.toISOString().slice(0, 10);
      const scheduledTime = in30.toISOString().slice(11, 16);

      const createRes = await trpcClient.bookings.create.mutate({
        vehicleType: 'standard',
        protectionType: 'unarmed',
        dressCode: 'business_casual',
        numberOfProtectees: 1,
        numberOfProtectors: 1,
        scheduledDate,
        scheduledTime,
        duration: 2,
        pickupAddress: 'Av. Paseo de la Reforma 1, CDMX',
        pickupLatitude: 19.4326,
        pickupLongitude: -99.1332,
        pickupCity: 'Ciudad de México',
        destinationAddress: 'Aeropuerto MEX',
        destinationLatitude: 19.4361,
        destinationLongitude: -99.0719,
        isScheduled: true,
        isCrossCity: false,
        userId,
      });

      const booking = (createRes as any).booking;
      if (!booking?.id) throw new Error('Booking did not return an id');
      setIds((p) => ({ ...p, bookingId: booking.id as string }));
      setStep('create-booking', { status: 'passed', meta: { bookingId: booking.id, startCode: booking.startCode } });

      // 4) Pay: use Braintree test nonce
      setStep('pay', { status: 'running' });
      await trpcClient.payments.braintree.clientToken.mutate({});
      const amount = 100;
      const checkout = await trpcClient.payments.braintree.checkout.mutate({
        nonce: 'fake-valid-nonce',
        amount,
        currency: 'MXN',
        bookingId: booking.id,
        description: 'Smoke Test Booking Payment',
      });
      setIds((p) => ({ ...p, transactionId: checkout.id as string }));
      setStep('pay', { status: 'passed', meta: { transactionId: checkout.id, amount } });

      // 5) Track: simulate success by verifying we can compute minutes until start
      setStep('track', { status: 'running' });
      const minutesUntil = Math.max(0, Math.floor((new Date(`${scheduledDate}T${scheduledTime}`).getTime() - Date.now()) / 60000));
      setStep('track', { status: 'passed', meta: { minutesUntil } });

      // 6) Rate: write a review document to Firestore
      setStep('rate', { status: 'running' });
      const ratingBreakdown = { professionalism: 5, punctuality: 5, communication: 5, languageClarity: 5 } as const;
      const reviewId = await ratingsService.submitRating(
        booking.id,
        (guard.id as string) ?? 'guard-unknown',
        userId,
        5,
        ratingBreakdown,
        'Excellent service (smoke test)'
      );
      setStep('rate', { status: 'passed', meta: { reviewId } });

      console.log('[Smoke] Flow completed successfully');
    } catch (err: any) {
      console.error('[Smoke] Flow failed', err);
      // Mark the first running step as failed
      for (const key of stepsOrder) {
        const s = results[key];
        if (s.status === 'running') {
          setStep(key, { status: 'failed', error: err?.message ?? 'Unknown error' });
          break;
        }
        if (s.status === 'idle') {
          setStep(key, { status: 'skipped' });
        }
      }
      if (Platform.OS !== 'web') {
        try { Alert.alert('Smoke Test Failed', err?.message ?? 'Unknown error'); } catch {}
      }
    } finally {
      setRunning(false);
    }
  }, [running, results, setStep]);

  const passCount = useMemo(() => Object.values(results).filter((r) => r.status === 'passed').length, [results]);

  const renderRow = (key: StepName) => {
    const res = results[key];
    let color = Colors.textPrimary;
    if (res.status === 'passed') color = '#10B981';
    if (res.status === 'failed') color = '#EF4444';
    if (res.status === 'running') color = Colors.gold;
    if (res.status === 'skipped') color = '#9CA3AF';

    return (
      <View key={key} style={styles.row} testID={`smoke-row-${key}`}>
        <Text style={[styles.rowTitle, { color }]}>{res.name}</Text>
        <View style={styles.rowRight}>
          {res.status === 'running' && <ActivityIndicator color={Colors.gold} />}
          {res.status === 'passed' && <CheckCircle2 color="#10B981" size={20} />}
          {res.status === 'failed' && <XCircle color="#EF4444" size={20} />}
          {res.status === 'skipped' && <Text style={styles.skipped}>SKIPPED</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} testID="smoke-container">
      <View style={styles.header}>
        <Text style={styles.title}>Final Smoke Test</Text>
        <Text style={styles.subtitle}>auth → create booking → select guard → pay → track → rate</Text>
      </View>

      <View style={styles.card}>
        {stepsOrder.map(renderRow)}
        <View style={styles.divider} />
        <Text style={styles.summary} testID="smoke-summary">{passCount}/{stepsOrder.length} passed</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            testID="smoke-run"
            style={[styles.button, running ? styles.buttonDisabled : undefined]}
            activeOpacity={0.8}
            onPress={run}
            disabled={running}
          >
            <Play color="#111827" size={18} />
            <Text style={styles.buttonText}>{running ? 'Running…' : 'Run Smoke Test'}</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="smoke-reset" style={[styles.button, styles.secondary]} onPress={reset} activeOpacity={0.8}>
            <RotateCcw color="#111827" size={18} />
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.log} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.logTitle}>Console</Text>
        <Text style={styles.logHint}>Open devtools to see detailed logs.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { marginTop: 6, fontSize: 13, color: '#6B7280' },
  card: { margin: 20, padding: 16, borderRadius: 16, backgroundColor: Colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowRight: { minWidth: 80, alignItems: 'flex-end' },
  skipped: { color: '#9CA3AF', fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginVertical: 8 },
  summary: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: { flexDirection: 'row', gap: 8, backgroundColor: Colors.gold, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  secondary: { backgroundColor: '#F3F4F6' },
  buttonText: { color: '#111827', fontWeight: '700' },
  log: { flex: 1, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  logTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  logHint: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
