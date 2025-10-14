import createContextHook from '../shims/create-context-hook.cjs';
import { useState, useCallback, useMemo } from 'react';
import { analyticsService, AnalyticsEvent, AnalyticsSummary } from '@/utils/analytics';
import { useAuth } from './AuthContext';

export const [AnalyticsProvider, useAnalytics] = createContextHook(() => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackEvent = useCallback(async (
    type: AnalyticsEvent['type'],
    metadata?: Record<string, any>,
    bookingId?: string
  ) => {
    if (!user) return;

    await analyticsService.trackEvent({
      type,
      userId: user.id,
      userRole: user.role,
      bookingId,
      metadata,
    });
  }, [user]);

  const trackBookingCreated = useCallback(async (bookingId: string, amount: number) => {
    await trackEvent('booking_created', { amount }, bookingId);
  }, [trackEvent]);

  const trackBookingCompleted = useCallback(async (bookingId: string, duration: number) => {
    await trackEvent('booking_completed', { duration }, bookingId);
  }, [trackEvent]);

  const trackBookingCancelled = useCallback(async (bookingId: string, reason?: string) => {
    await trackEvent('booking_cancelled', { reason }, bookingId);
  }, [trackEvent]);

  const trackPaymentSuccess = useCallback(async (bookingId: string, amount: number) => {
    await trackEvent('payment_success', { amount }, bookingId);
  }, [trackEvent]);

  const trackPaymentFailed = useCallback(async (bookingId: string, error: string) => {
    await trackEvent('payment_failed', { error }, bookingId);
  }, [trackEvent]);

  const trackGuardAssigned = useCallback(async (bookingId: string, guardId: string) => {
    await trackEvent('guard_assigned', { guardId }, bookingId);
  }, [trackEvent]);

  const trackRatingSubmitted = useCallback(async (bookingId: string, guardId: string, rating: number) => {
    await trackEvent('rating_submitted', { guardId, rating }, bookingId);
  }, [trackEvent]);

  const trackChatMessageSent = useCallback(async (bookingId: string) => {
    await trackEvent('chat_message_sent', {}, bookingId);
  }, [trackEvent]);

  const trackTranslationUsed = useCallback(async (bookingId: string, fromLang: string, toLang: string) => {
    await trackEvent('translation_used', { fromLang, toLang }, bookingId);
  }, [trackEvent]);

  const trackBookingExtended = useCallback(async (bookingId: string, additionalHours: number, additionalAmount: number) => {
    await trackEvent('booking_extended', { additionalHours, additionalAmount }, bookingId);
  }, [trackEvent]);

  const trackGuardReassigned = useCallback(async (bookingId: string, oldGuardId: string, newGuardId: string) => {
    await trackEvent('guard_reassigned', { oldGuardId, newGuardId }, bookingId);
  }, [trackEvent]);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load analytics summary:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEvents = useCallback(async (filters?: Parameters<typeof analyticsService.getEvents>[0]) => {
    return await analyticsService.getEvents(filters);
  }, []);

  return useMemo(() => ({
    summary,
    isLoading,
    trackBookingCreated,
    trackBookingCompleted,
    trackBookingCancelled,
    trackPaymentSuccess,
    trackPaymentFailed,
    trackGuardAssigned,
    trackRatingSubmitted,
    trackChatMessageSent,
    trackTranslationUsed,
    trackBookingExtended,
    trackGuardReassigned,
    loadSummary,
    getEvents,
  }), [
    summary,
    isLoading,
    trackBookingCreated,
    trackBookingCompleted,
    trackBookingCancelled,
    trackPaymentSuccess,
    trackPaymentFailed,
    trackGuardAssigned,
    trackRatingSubmitted,
    trackChatMessageSent,
    trackTranslationUsed,
    trackBookingExtended,
    trackGuardReassigned,
    loadSummary,
    getEvents,
  ]);
});
