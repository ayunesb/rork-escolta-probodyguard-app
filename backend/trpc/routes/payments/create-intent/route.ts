import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      bookingId: z.string(),
      amount: z.number().min(1),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Payment] Create intent:', input);

      return {
        clientSecret: 'mock_client_secret_' + Date.now(),
        paymentIntentId: 'pi_' + Date.now(),
      };
    } catch (error) {
      console.error('[Payment] Create intent error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create payment intent',
      });
    }
  });
