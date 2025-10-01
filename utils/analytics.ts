import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = '@escolta_analytics';

export interface AnalyticsEvent {
  id: string;
  type: 'booking_created' | 'booking_completed' | 'booking_cancelled' | 'payment_success' | 'payment_failed' | 'guard_assigned' | 'rating_submitted' | 'chat_message_sent' | 'translation_used' | 'booking_extended' | 'guard_reassigned';
  userId: string;
  userRole: string;
  bookingId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalGuards: number;
  activeGuards: number;
  totalClients: number;
  activeClients: number;
  translationUsageCount: number;
  bookingExtensionCount: number;
  guardReassignmentCount: number;
  averageBookingDuration: number;
  cancellationRate: number;
  topRatedGuards: { guardId: string; rating: number; completedJobs: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
    await this.initialize();

    const newEvent: AnalyticsEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.events.push(newEvent);

    try {
      await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.events));
      console.log('Analytics event tracked:', newEvent.type);
    } catch (error) {
      console.error('Failed to save analytics event:', error);
    }
  }

  async getEvents(filters?: {
    type?: AnalyticsEvent['type'];
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsEvent[]> {
    await this.initialize();

    let filtered = [...this.events];

    if (filters?.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    if (filters?.userId) {
      filtered = filtered.filter(e => e.userId === filters.userId);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
    }

    return filtered;
  }

  async getSummary(): Promise<AnalyticsSummary> {
    await this.initialize();

    const bookingCreated = this.events.filter(e => e.type === 'booking_created');
    const bookingCompleted = this.events.filter(e => e.type === 'booking_completed');
    const bookingCancelled = this.events.filter(e => e.type === 'booking_cancelled');
    const paymentSuccess = this.events.filter(e => e.type === 'payment_success');
    const ratingsSubmitted = this.events.filter(e => e.type === 'rating_submitted');
    const translationUsed = this.events.filter(e => e.type === 'translation_used');
    const bookingExtended = this.events.filter(e => e.type === 'booking_extended');
    const guardReassigned = this.events.filter(e => e.type === 'guard_reassigned');

    const totalRevenue = paymentSuccess.reduce((sum, e) => {
      return sum + (e.metadata?.amount || 0);
    }, 0);

    const averageRating = ratingsSubmitted.length > 0
      ? ratingsSubmitted.reduce((sum, e) => sum + (e.metadata?.rating || 0), 0) / ratingsSubmitted.length
      : 0;

    const totalBookings = bookingCreated.length;
    const completedBookings = bookingCompleted.length;
    const cancelledBookings = bookingCancelled.length;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    const uniqueGuards = new Set(this.events.filter(e => e.userRole === 'guard').map(e => e.userId));
    const uniqueClients = new Set(this.events.filter(e => e.userRole === 'client').map(e => e.userId));

    const guardRatings = new Map<string, { total: number; count: number; jobs: number }>();
    ratingsSubmitted.forEach(e => {
      const guardId = e.metadata?.guardId;
      if (guardId) {
        const current = guardRatings.get(guardId) || { total: 0, count: 0, jobs: 0 };
        guardRatings.set(guardId, {
          total: current.total + (e.metadata?.rating || 0),
          count: current.count + 1,
          jobs: current.jobs + 1,
        });
      }
    });

    const topRatedGuards = Array.from(guardRatings.entries())
      .map(([guardId, data]) => ({
        guardId,
        rating: data.total / data.count,
        completedJobs: data.jobs,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    const revenueByMonth = this.calculateRevenueByMonth(paymentSuccess);

    const averageBookingDuration = bookingCompleted.reduce((sum, e) => {
      return sum + (e.metadata?.duration || 0);
    }, 0) / (bookingCompleted.length || 1);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      averageRating,
      totalGuards: uniqueGuards.size,
      activeGuards: uniqueGuards.size,
      totalClients: uniqueClients.size,
      activeClients: uniqueClients.size,
      translationUsageCount: translationUsed.length,
      bookingExtensionCount: bookingExtended.length,
      guardReassignmentCount: guardReassigned.length,
      averageBookingDuration,
      cancellationRate,
      topRatedGuards,
      revenueByMonth,
    };
  }

  private calculateRevenueByMonth(paymentEvents: AnalyticsEvent[]): { month: string; revenue: number }[] {
    const revenueMap = new Map<string, number>();

    paymentEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = event.metadata?.amount || 0;
      revenueMap.set(monthKey, (revenueMap.get(monthKey) || 0) + amount);
    });

    return Array.from(revenueMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async clearEvents() {
    this.events = [];
    try {
      await AsyncStorage.removeItem(ANALYTICS_KEY);
      console.log('Analytics events cleared');
    } catch (error) {
      console.error('Failed to clear analytics events:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
