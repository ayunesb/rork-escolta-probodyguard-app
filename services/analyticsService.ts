import { Booking } from '@/types';

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  totalEarned: number;
  averageRating: number;
  averageBookingDuration: number;
  mostBookedGuard?: {
    guardId: string;
    count: number;
  };
  bookingsByMonth: {
    month: string;
    count: number;
    amount: number;
  }[];
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
  topGuards: {
    guardId: string;
    bookings: number;
    earnings: number;
    rating: number;
  }[];
}

export interface GuardAnalytics {
  totalJobs: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  ratingTrend: {
    date: string;
    rating: number;
  }[];
  earningsByMonth: {
    month: string;
    earnings: number;
    jobs: number;
  }[];
  topClients: {
    clientId: string;
    bookings: number;
    totalPaid: number;
  }[];
  peakHours: {
    hour: number;
    bookings: number;
  }[];
}

function getMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const analyticsService = {
  calculateClientAnalytics(bookings: Booking[]): BookingAnalytics {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const ratingsSum = bookings
      .filter(b => b.rating)
      .reduce((sum, b) => sum + (b.rating || 0), 0);
    const ratingsCount = bookings.filter(b => b.rating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    const totalDuration = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.duration, 0);
    const averageBookingDuration = completedBookings > 0 
      ? totalDuration / completedBookings 
      : 0;

    const guardCounts = new Map<string, number>();
    bookings.forEach(b => {
      if (b.guardId) {
        guardCounts.set(b.guardId, (guardCounts.get(b.guardId) || 0) + 1);
      }
    });

    let mostBookedGuard: { guardId: string; count: number } | undefined;
    let maxCount = 0;
    guardCounts.forEach((count, guardId) => {
      if (count > maxCount) {
        maxCount = count;
        mostBookedGuard = { guardId, count };
      }
    });

    const monthlyData = new Map<string, { count: number; amount: number }>();
    bookings.forEach(b => {
      const month = getMonthKey(b.createdAt);
      const existing = monthlyData.get(month) || { count: 0, amount: 0 };
      monthlyData.set(month, {
        count: existing.count + 1,
        amount: existing.amount + (b.status === 'completed' ? b.totalAmount : 0),
      });
    });

    const bookingsByMonth = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const statusCounts = new Map<string, number>();
    bookings.forEach(b => {
      statusCounts.set(b.status, (statusCounts.get(b.status) || 0) + 1);
    });

    const bookingsByStatus = Array.from(statusCounts.entries())
      .map(([status, count]) => ({ status, count }));

    const guardStats = new Map<string, { bookings: number; earnings: number; ratings: number[] }>();
    bookings.forEach(b => {
      if (b.guardId && b.status === 'completed') {
        const existing = guardStats.get(b.guardId) || { bookings: 0, earnings: 0, ratings: [] };
        existing.bookings++;
        existing.earnings += b.guardPayout;
        if (b.rating) existing.ratings.push(b.rating);
        guardStats.set(b.guardId, existing);
      }
    });

    const topGuards = Array.from(guardStats.entries())
      .map(([guardId, stats]) => ({
        guardId,
        bookings: stats.bookings,
        earnings: stats.earnings,
        rating: stats.ratings.length > 0 
          ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length 
          : 0,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalSpent,
      totalEarned: 0,
      averageRating,
      averageBookingDuration,
      mostBookedGuard,
      bookingsByMonth,
      bookingsByStatus,
      topGuards,
    };
  },

  calculateGuardAnalytics(bookings: Booking[], guardId: string): GuardAnalytics {
    const guardBookings = bookings.filter(b => b.guardId === guardId);
    
    const totalJobs = guardBookings.length;
    const completedJobs = guardBookings.filter(b => b.status === 'completed').length;
    
    const totalEarnings = guardBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.guardPayout, 0);

    const ratingsSum = guardBookings
      .filter(b => b.rating)
      .reduce((sum, b) => sum + (b.rating || 0), 0);
    const ratingsCount = guardBookings.filter(b => b.rating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    const ratingTrend = guardBookings
      .filter(b => b.rating && b.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map(b => ({
        date: b.completedAt!,
        rating: b.rating!,
      }));

    const monthlyEarnings = new Map<string, { earnings: number; jobs: number }>();
    guardBookings
      .filter(b => b.status === 'completed')
      .forEach(b => {
        const month = getMonthKey(b.createdAt);
        const existing = monthlyEarnings.get(month) || { earnings: 0, jobs: 0 };
        monthlyEarnings.set(month, {
          earnings: existing.earnings + b.guardPayout,
          jobs: existing.jobs + 1,
        });
      });

    const earningsByMonth = Array.from(monthlyEarnings.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const clientStats = new Map<string, { bookings: number; totalPaid: number }>();
    guardBookings
      .filter(b => b.status === 'completed')
      .forEach(b => {
        const existing = clientStats.get(b.clientId) || { bookings: 0, totalPaid: 0 };
        clientStats.set(b.clientId, {
          bookings: existing.bookings + 1,
          totalPaid: existing.totalPaid + b.totalAmount,
        });
      });

    const topClients = Array.from(clientStats.entries())
      .map(([clientId, stats]) => ({ clientId, ...stats }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    const hourCounts = new Map<number, number>();
    guardBookings.forEach(b => {
      const hour = parseInt(b.scheduledTime.split(':')[0]);
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, bookings]) => ({ hour, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return {
      totalJobs,
      completedJobs,
      totalEarnings,
      averageRating,
      ratingTrend,
      earningsByMonth,
      topClients,
      peakHours,
    };
  },

  getBookingInsights(bookings: Booking[]): {
    busyDays: string[];
    popularTimeSlots: string[];
    averageResponseTime: number;
    completionRate: number;
  } {
    const dayCounts = new Map<string, number>();
    bookings.forEach(b => {
      const day = new Date(b.scheduledDate).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    const busyDays = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    const timeCounts = new Map<string, number>();
    bookings.forEach(b => {
      const hour = parseInt(b.scheduledTime.split(':')[0]);
      let timeSlot: string;
      if (hour < 12) timeSlot = 'Morning (6AM-12PM)';
      else if (hour < 17) timeSlot = 'Afternoon (12PM-5PM)';
      else if (hour < 21) timeSlot = 'Evening (5PM-9PM)';
      else timeSlot = 'Night (9PM-6AM)';
      
      timeCounts.set(timeSlot, (timeCounts.get(timeSlot) || 0) + 1);
    });

    const popularTimeSlots = Array.from(timeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slot]) => slot);

    const responseTimes = bookings
      .filter(b => b.acceptedAt)
      .map(b => {
        const created = new Date(b.createdAt).getTime();
        const accepted = new Date(b.acceptedAt!).getTime();
        return (accepted - created) / (1000 * 60);
      });

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const completionRate = bookings.length > 0 
      ? (completedCount / bookings.length) * 100 
      : 0;

    return {
      busyDays,
      popularTimeSlots,
      averageResponseTime,
      completionRate,
    };
  },
};
