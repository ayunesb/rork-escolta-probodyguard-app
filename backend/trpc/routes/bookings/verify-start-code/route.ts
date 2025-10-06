import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db as getDb } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { checkRateLimit, resetRateLimit } from "@/backend/middleware/rateLimitMiddleware";

export default publicProcedure
  .input(
    z.object({
      bookingId: z.string(),
      startCode: z.string().length(6),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { bookingId, startCode, userId } = input;

    try {
      console.log('[StartCode] Verification attempt for booking:', bookingId);

      const rateLimit = await checkRateLimit('startCode', `${userId}_${bookingId}`);
      if (!rateLimit.allowed) {
        console.log('[StartCode] Rate limit exceeded for:', userId);
        throw new Error(rateLimit.error || 'Too many start code attempts. Please try again later.');
      }

      const db = getDb();
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const bookingData = bookingDoc.data();

      if (bookingData.guardId !== userId) {
        throw new Error('Unauthorized: Only the assigned guard can verify the start code');
      }

      if (bookingData.status === 'active') {
        return {
          success: true,
          message: 'Booking already active',
          booking: {
            id: bookingDoc.id,
            ...bookingData,
          },
        };
      }

      if (bookingData.startCode !== startCode.toUpperCase()) {
        console.log('[StartCode] Invalid code for booking:', bookingId);
        throw new Error('Invalid start code. Please check and try again.');
      }

      await updateDoc(bookingRef, {
        status: 'active',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await resetRateLimit('startCode', `${userId}_${bookingId}`);

      console.log('[StartCode] Booking activated:', bookingId);

      return {
        success: true,
        message: 'Start code verified successfully',
        booking: {
          id: bookingDoc.id,
          ...bookingData,
          status: 'active',
          startedAt: new Date(),
        },
      };
    } catch (error: any) {
      console.error('[StartCode] Verification error:', error);
      throw new Error(error.message || 'Failed to verify start code');
    }
  });
