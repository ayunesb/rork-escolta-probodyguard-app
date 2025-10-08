import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db as getDbInstance } from '@/lib/firebase';
import { Booking } from '@/types';

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  activeBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByStatus: Record<string, number>;
  bookingsByType: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topGuards: Array<{ guardId: string; guardName: string; bookings: number; revenue: number }>;
}

export interface GuardAnalytics {
  guardId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  acceptanceRate: number;
  completionRate: number;
  responseTime: number;
  bookingsByMonth: Array<{ month: string; bookings: number }>;
  earningsByMonth: Array<{ month: string; earnings: number }>;
}

export interface ClientAnalytics {
  clientId: string;
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  favoriteGuards: Array<{ guardId: string; guardName: string; bookings: number }>;
  bookingsByMonth: Array<{ month: string; bookings: number }>;
  spendingByMonth: Array<{ month: string; spent: number }>;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalClients: number;
  totalGuards: number;
  totalCompanies: number;
  activeUsers: number;
  totalBookings: number;
  totalRevenue: number;
  platformRevenue: number;
  averageBookingValue: number;
  userGrowth: Array<{ month: string; users: number }>;
  revenueGrowth: Array<{ month: string; revenue: number }>;
  topPerformingGuards: Array<{ guardId: string; guardName: string; rating: number; bookings: number }>;
  bookingTrends: Array<{ date: string; bookings: number }>;
}

export const analyticsService = {
  async getBookingAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<BookingAnalytics> {
    try {
      let bookingsQuery = query(collection(getDbInstance(), 'bookings'));

      if (startDate && endDate) {
        bookingsQuery = query(
          collection(getDbInstance(), 'bookings'),
          where('createdAt', '>=', startDate.toISOString()),
          where('createdAt', '<=', endDate.toISOString())
        );
      }

      const snapshot = await getDocs(bookingsQuery);
      const bookings: Booking[] = [];

      snapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        } as Booking);
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter((b) => b.status === 'completed').length;
      const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
      const activeBookings = bookings.filter((b) =>
        ['confirmed', 'accepted', 'en_route', 'active'].includes(b.status)
      ).length;

      const totalRevenue = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const averageBookingValue = totalRevenue / (completedBookings || 1);

      const bookingsByStatus: Record<string, number> = {};
      bookings.forEach((b) => {
        bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1;
      });

      const bookingsByType: Record<string, number> = {};
      bookings.forEach((b) => {
        bookingsByType[b.bookingType] = (bookingsByType[b.bookingType] || 0) + 1;
      });

      const revenueByMonth = this.calculateRevenueByMonth(bookings);
      const topGuards = await this.getTopGuards(bookings);

      return {
        totalBookings,
        completedBookings,
        cancelledBookings,
        activeBookings,
        totalRevenue,
        averageBookingValue,
        bookingsByStatus,
        bookingsByType,
        revenueByMonth,
        topGuards,
      };
    } catch (error) {
      console.error('[Analytics] Error getting booking analytics:', error);
      throw error;
    }
  },

  async getGuardAnalytics(guardId: string): Promise<GuardAnalytics> {
    try {
      const bookingsQuery = query(
        collection(getDbInstance(), 'bookings'),
        where('guardId', '==', guardId)
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookings: Booking[] = [];

      snapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        } as Booking);
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter((b) => b.status === 'completed').length;
      const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

      const totalEarnings = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.guardPayout, 0);

      const ratings = bookings
        .filter((b) => b.rating)
        .map((b) => b.rating!);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

      const acceptedBookings = bookings.filter((b) =>
        ['accepted', 'en_route', 'active', 'completed'].includes(b.status)
      ).length;
      const acceptanceRate = (acceptedBookings / totalBookings) * 100;

      const completionRate = (completedBookings / acceptedBookings) * 100;

      const bookingsByMonth = this.calculateBookingsByMonth(bookings);
      const earningsByMonth = this.calculateEarningsByMonth(bookings);

      return {
        guardId,
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalEarnings,
        averageRating,
        totalReviews: ratings.length,
        acceptanceRate,
        completionRate,
        responseTime: 0,
        bookingsByMonth,
        earningsByMonth,
      };
    } catch (error) {
      console.error('[Analytics] Error getting guard analytics:', error);
      throw error;
    }
  },

  async getClientAnalytics(clientId: string): Promise<ClientAnalytics> {
    try {
      const bookingsQuery = query(
        collection(getDbInstance(), 'bookings'),
        where('clientId', '==', clientId)
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookings: Booking[] = [];

      snapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        } as Booking);
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter((b) => b.status === 'completed').length;

      const totalSpent = bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const averageBookingValue = totalSpent / (completedBookings || 1);

      const guardCounts: Record<string, number> = {};
      bookings.forEach((b) => {
        if (b.guardId) {
          guardCounts[b.guardId] = (guardCounts[b.guardId] || 0) + 1;
        }
      });

      const favoriteGuards = Object.entries(guardCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([guardId, bookings]) => ({
          guardId,
          guardName: 'Guard',
          bookings,
        }));

      const bookingsByMonth = this.calculateBookingsByMonth(bookings);
      const spendingByMonth = this.calculateSpendingByMonth(bookings);

      return {
        clientId,
        totalBookings,
        completedBookings,
        totalSpent,
        averageBookingValue,
        favoriteGuards,
        bookingsByMonth,
        spendingByMonth,
      };
    } catch (error) {
      console.error('[Analytics] Error getting client analytics:', error);
      throw error;
    }
  },

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      const usersSnapshot = await getDocs(collection(getDbInstance(), 'users'));
      const users: any[] = [];

      usersSnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const totalUsers = users.length;
      const totalClients = users.filter((u) => u.role === 'client').length;
      const totalGuards = users.filter((u) => u.role === 'guard').length;
      const totalCompanies = users.filter((u) => u.role === 'company').length;
      const activeUsers = users.filter((u) => u.availability).length;

      const bookingsSnapshot = await getDocs(collection(getDbInstance(), 'bookings'));
      const bookings: Booking[] = [];

      bookingsSnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        } as Booking);
      });

      const totalBookings = bookings.length;

      const completedBookings = bookings.filter((b) => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const platformRevenue = completedBookings.reduce((sum, b) => sum + b.platformCut, 0);
      const averageBookingValue = totalRevenue / (completedBookings.length || 1);

      const userGrowth = this.calculateUserGrowth(users);
      const revenueGrowth = this.calculateRevenueByMonth(bookings);
      const topPerformingGuards = await this.getTopPerformingGuards();
      const bookingTrends = this.calculateBookingTrends(bookings);

      return {
        totalUsers,
        totalClients,
        totalGuards,
        totalCompanies,
        activeUsers,
        totalBookings,
        totalRevenue,
        platformRevenue,
        averageBookingValue,
        userGrowth,
        revenueGrowth,
        topPerformingGuards,
        bookingTrends,
      };
    } catch (error) {
      console.error('[Analytics] Error getting platform analytics:', error);
      throw error;
    }
  },

  calculateRevenueByMonth(bookings: Booking[]): Array<{ month: string; revenue: number }> {
    const revenueByMonth: Record<string, number> = {};

    bookings
      .filter((b) => b.status === 'completed')
      .forEach((booking) => {
        const date = new Date(booking.completedAt || booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + booking.totalAmount;
      });

    return Object.entries(revenueByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  },

  calculateBookingsByMonth(bookings: Booking[]): Array<{ month: string; bookings: number }> {
    const bookingsByMonth: Record<string, number> = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      bookingsByMonth[monthKey] = (bookingsByMonth[monthKey] || 0) + 1;
    });

    return Object.entries(bookingsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, bookings]) => ({ month, bookings }));
  },

  calculateEarningsByMonth(bookings: Booking[]): Array<{ month: string; earnings: number }> {
    const earningsByMonth: Record<string, number> = {};

    bookings
      .filter((b) => b.status === 'completed')
      .forEach((booking) => {
        const date = new Date(booking.completedAt || booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + booking.guardPayout;
      });

    return Object.entries(earningsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, earnings]) => ({ month, earnings }));
  },

  calculateSpendingByMonth(bookings: Booking[]): Array<{ month: string; spent: number }> {
    const spendingByMonth: Record<string, number> = {};

    bookings
      .filter((b) => b.status === 'completed')
      .forEach((booking) => {
        const date = new Date(booking.completedAt || booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + booking.totalAmount;
      });

    return Object.entries(spendingByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, spent]) => ({ month, spent }));
  },

  calculateUserGrowth(users: any[]): Array<{ month: string; users: number }> {
    const usersByMonth: Record<string, number> = {};

    users.forEach((user) => {
      const date = new Date(user.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
    });

    return Object.entries(usersByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, users]) => ({ month, users }));
  },

  calculateBookingTrends(bookings: Booking[]): Array<{ date: string; bookings: number }> {
    const bookingsByDate: Record<string, number> = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      bookingsByDate[dateKey] = (bookingsByDate[dateKey] || 0) + 1;
    });

    return Object.entries(bookingsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, bookings]) => ({ date, bookings }));
  },

  async getTopGuards(
    bookings: Booking[]
  ): Promise<Array<{ guardId: string; guardName: string; bookings: number; revenue: number }>> {
    const guardStats: Record<string, { bookings: number; revenue: number }> = {};

    bookings
      .filter((b) => b.status === 'completed' && b.guardId)
      .forEach((booking) => {
        const guardId = booking.guardId!;
        if (!guardStats[guardId]) {
          guardStats[guardId] = { bookings: 0, revenue: 0 };
        }
        guardStats[guardId].bookings += 1;
        guardStats[guardId].revenue += booking.totalAmount;
      });

    return Object.entries(guardStats)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(([guardId, stats]) => ({
        guardId,
        guardName: 'Guard',
        ...stats,
      }));
  },

  async getTopPerformingGuards(): Promise<
    Array<{ guardId: string; guardName: string; rating: number; bookings: number }>
  > {
    try {
      const guardsQuery = query(
        collection(getDbInstance(), 'users'),
        where('role', '==', 'guard'),
        orderBy('rating', 'desc')
      );

      const snapshot = await getDocs(guardsQuery);
      const guards: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        guards.push({
          guardId: doc.id,
          guardName: `${data.firstName} ${data.lastName}`,
          rating: data.rating || 0,
          bookings: data.completedJobs || 0,
        });
      });

      return guards.slice(0, 10);
    } catch (error) {
      console.error('[Analytics] Error getting top performing guards:', error);
      return [];
    }
  },

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)} MXN`;
  },

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  },

  formatNumber(value: number): string {
    return value.toLocaleString();
  },
};
