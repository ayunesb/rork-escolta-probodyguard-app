import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export default publicProcedure
  .input(
    z.object({
      bookingId: z.string(),
      amount: z.number().min(50),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Payment] Create intent:', input);

      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_secret_key')) {
        console.warn('[Payment] Using mock mode - Stripe key not configured');
        return {
          clientSecret: 'mock_client_secret_' + Date.now(),
          paymentIntentId: 'pi_mock_' + Date.now(),
        };
      }

      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: input.amount.toString(),
          currency: 'usd',
          'metadata[bookingId]': input.bookingId,
          'automatic_payment_methods[enabled]': 'true',
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Payment] Stripe API error:', error);
        throw new Error(error.error?.message || 'Failed to create payment intent');
      }

      const paymentIntent = await response.json();

      console.log('[Payment] Payment intent created:', paymentIntent.id);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('[Payment] Create intent error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to create payment intent',
      });
    }
  });
