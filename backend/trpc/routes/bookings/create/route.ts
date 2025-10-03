import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      vehicleType: z.enum(['standard', 'armored']),
      protectionType: z.enum(['armed', 'unarmed']),
      dressCode: z.enum(['suit', 'business_casual', 'tactical', 'casual']),
      numberOfProtectees: z.number().min(1),
      numberOfProtectors: z.number().min(1),
      scheduledDate: z.string(),
      scheduledTime: z.string(),
      duration: z.number().min(1),
      pickupAddress: z.string(),
      pickupLatitude: z.number(),
      pickupLongitude: z.number(),
      pickupCity: z.string(),
      destinationAddress: z.string().optional(),
      destinationLatitude: z.number().optional(),
      destinationLongitude: z.number().optional(),
      isScheduled: z.boolean(),
      isCrossCity: z.boolean(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Booking] Create booking:', input);

      const startCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const booking = {
        id: 'booking-' + Date.now(),
        clientId: 'user-123',
        status: 'quote' as const,
        ...input,
        startCode,
        totalAmount: 0,
        processingFee: 0,
        platformCut: 0,
        guardPayout: 0,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        booking,
      };
    } catch (error) {
      console.error('[Booking] Create error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create booking',
      });
    }
  });
