import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface AnalyticsData {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalHours: number;
  bookingsByStatus: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
  topGuards: { id: string; name: string; bookings: number; rating: number }[];
  bookingTrends: { date: string; count: number }[];
}

export interface GuardAnalytics {
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalHours: number;
  acceptanceRate: number;
  responseTime: number;
  earningsByMonth: { month: string; earnings: number }[];
  recentReviews: { rating: number; comment: string; date: string }[];
}

class AnalyticsService {
  async getClientAnalytics(clientId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    try {
      console.log('[Analytics] Fetching client analytics:', clientId);

      const bookingsRef = collection(db, 'bookings');
      let q = query(bookingsRef, where('clientId', '==', clientId));

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate.toISOString()));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate.toISOString()));
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

      const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const ratingsData = bookings
        .filter(b => b.rating)
        .map(b => b.rating);
      const averageRating = ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + r, 0) / ratingsData.length
        : 0;

      const totalHours = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.duration || 0), 0);

      const bookingsByStatus = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const revenueByMonth = this.calculateRevenueByMonth(bookings);
      const bookingTrends = this.calculateBookingTrends(bookings);

      return {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        averageRating,
        totalHours,
        bookingsByStatus,
        revenueByMonth,
        topGuards: [],
        bookingTrends,
      };
    } catch (error) {
      console.error('[Analytics] Error fetching client analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  async getGuardAnalytics(guardId: string, startDate?: Date, endDate?: Date): Promise<GuardAnalytics> {
    try {
      console.log('[Analytics] Fetching guard analytics:', guardId);

      const bookingsRef = collection(db, 'bookings');
      let q = query(bookingsRef, where('guardId', '==', guardId));

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate.toISOString()));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate.toISOString()));
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;

      const totalEarnings = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.guardEarnings || b.totalPrice * 0.8 || 0), 0);

      const ratingsData = bookings
        .filter(b => b.rating)
        .map(b => b.rating);
      const averageRating = ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + r, 0) / ratingsData.length
        : 0;

      const totalHours = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.duration || 0), 0);

      const acceptedBookings = bookings.filter(b => 
        ['accepted', 'en_route', 'active', 'completed'].includes(b.status)
      ).length;
      const acceptanceRate = totalBookings > 0 ? (acceptedBookings / totalBookings) * 100 : 0;

      const earningsByMonth = this.calculateEarningsByMonth(bookings);

      const recentReviews = bookings
        .filter(b => b.rating && b.review)
        .slice(0, 5)
        .map(b => ({
          rating: b.rating,
          comment: b.review,
          date: b.completedAt || b.createdAt,
        }));

      return {
        totalBookings,
        completedBookings,
        totalEarnings,
        averageRating,
        totalHours,
        acceptanceRate,
        responseTime: 0,
        earningsByMonth,
        recentReviews,
      };
    } catch (error) {
      console.error('[Analytics] Error fetching guard analytics:', error);
      return this.getEmptyGuardAnalytics();
    }
  }

  async getAdminAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData & { activeUsers: number }> {
    try {
      console.log('[Analytics] Fetching admin analytics');

      const bookingsRef = collection(db, 'bookings');
      let q = query(bookingsRef);

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate.toISOString()));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate.toISOString()));
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const activeUsers = usersSnapshot.size;

      const analytics = await this.getClientAnalytics('admin', startDate, endDate);

      const guardStats = await this.calculateTopGuards(bookings);

      return {
        ...analytics,
        activeUsers,
        topGuards: guardStats,
      };
    } catch (error) {
      console.error('[Analytics] Error fetching admin analytics:', error);
      return { ...this.getEmptyAnalytics(), activeUsers: 0 };
    }
  }

  private calculateRevenueByMonth(bookings: any[]): { month: string; revenue: number }[] {
    const revenueMap = new Map<string, number>();

    bookings
      .filter(b => b.status === 'completed' && b.createdAt)
      .forEach(booking => {
        const date = new Date(booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = revenueMap.get(monthKey) || 0;
        revenueMap.set(monthKey, current + (booking.totalPrice || 0));
      });

    return Array.from(revenueMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateEarningsByMonth(bookings: any[]): { month: string; earnings: number }[] {
    const earningsMap = new Map<string, number>();

    bookings
      .filter(b => b.status === 'completed' && b.createdAt)
      .forEach(booking => {
        const date = new Date(booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = earningsMap.get(monthKey) || 0;
        const earnings = booking.guardEarnings || booking.totalPrice * 0.8 || 0;
        earningsMap.set(monthKey, current + earnings);
      });

    return Array.from(earningsMap.entries())
      .map(([month, earnings]) => ({ month, earnings }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateBookingTrends(bookings: any[]): { date: string; count: number }[] {
    const trendsMap = new Map<string, number>();

    bookings.forEach(booking => {
      if (booking.createdAt) {
        const date = new Date(booking.createdAt);
        const dateKey = date.toISOString().split('T')[0];
        const current = trendsMap.get(dateKey) || 0;
        trendsMap.set(dateKey, current + 1);
      }
    });

    return Array.from(trendsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async calculateTopGuards(bookings: any[]): Promise<{ id: string; name: string; bookings: number; rating: number }[]> {
    const guardStats = new Map<string, { bookings: number; totalRating: number; ratingCount: number }>();

    bookings.forEach(booking => {
      if (booking.guardId) {
        const current = guardStats.get(booking.guardId) || { bookings: 0, totalRating: 0, ratingCount: 0 };
        current.bookings += 1;
        if (booking.rating) {
          current.totalRating += booking.rating;
          current.ratingCount += 1;
        }
        guardStats.set(booking.guardId, current);
      }
    });

    return Array.from(guardStats.entries())
      .map(([id, stats]) => ({
        id,
        name: 'Guard',
        bookings: stats.bookings,
        rating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);
  }

  private getEmptyAnalytics(): AnalyticsData {
    return {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalHours: 0,
      bookingsByStatus: {},
      revenueByMonth: [],
      topGuards: [],
      bookingTrends: [],
    };
  }

  private getEmptyGuardAnalytics(): GuardAnalytics {
    return {
      totalBookings: 0,
      completedBookings: 0,
      totalEarnings: 0,
      averageRating: 0,
      totalHours: 0,
      acceptanceRate: 0,
      responseTime: 0,
      earningsByMonth: [],
      recentReviews: [],
    };
  }
}

export const analyticsService = new AnalyticsService();
