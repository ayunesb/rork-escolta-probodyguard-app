import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { checkRateLimit } from "@/backend/middleware/rateLimitMiddleware";

const createBookingSchema = z.object({
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
  userId: z.string(),
});

type CreateBookingInput = z.infer<typeof createBookingSchema>;

export default publicProcedure
  .input(createBookingSchema)
  .mutation(async ({ input }: { input: CreateBookingInput }) => {
    try {
      console.log('[Booking] Create booking:', input);

      const rateLimit = await checkRateLimit('booking', input.userId);
      if (!rateLimit.allowed) {
        console.log('[Booking] Rate limit exceeded for:', input.userId);
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimit.error || 'Too many booking requests. Please try again later.',
        });
      }

      const startCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { userId, ...bookingData } = input;

      const booking = {
        id: 'booking-' + Date.now(),
        clientId: userId,
        status: 'quote' as const,
        ...bookingData,
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
