import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      userId: z.string(),
      role: z.enum(['client', 'guard', 'company', 'admin']),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('[Booking] List bookings:', input);

      return {
        bookings: [],
      };
    } catch (error) {
      console.error('[Booking] List error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list bookings',
      });
    }
  });
