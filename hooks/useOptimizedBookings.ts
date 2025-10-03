import { useMemo, useCallback } from 'react';
import { Booking, BookingStatus } from '@/types';

export function useOptimizedBookings(bookings: Booking[]) {
  const activeBookings = useMemo(() => {
    return bookings.filter(b => 
      b.status === 'active' || 
      b.status === 'accepted' || 
      b.status === 'en_route'
    );
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'completed');
  }, [bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'pending');
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(b => {
        if (b.status !== 'accepted' && b.status !== 'pending') return false;
        const scheduledDate = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return scheduledDate > now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [bookings]);

  const getBookingsByStatus = useCallback((status: BookingStatus) => {
    return bookings.filter(b => b.status === status);
  }, [bookings]);

  const getBookingById = useCallback((id: string) => {
    return bookings.find(b => b.id === id);
  }, [bookings]);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings]);

  const bookingStats = useMemo(() => {
    return {
      total: bookings.length,
      active: activeBookings.length,
      completed: completedBookings.length,
      pending: pendingBookings.length,
      upcoming: upcomingBookings.length,
    };
  }, [bookings, activeBookings, completedBookings, pendingBookings, upcomingBookings]);

  return {
    activeBookings,
    completedBookings,
    pendingBookings,
    upcomingBookings,
    sortedBookings,
    bookingStats,
    getBookingsByStatus,
    getBookingById,
  };
}
