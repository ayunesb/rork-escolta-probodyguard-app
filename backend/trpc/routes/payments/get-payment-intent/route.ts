import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { STRIPE_SECRET_KEY } from "@/backend/config/env";

export const getPaymentIntentProcedure = protectedProcedure
  .input(
    z.object({
      paymentIntentId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('[Payment] Get payment intent:', input.paymentIntentId);

      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_secret_key')) {
        return {
          paymentIntentId: input.paymentIntentId,
          paymentMethodId: undefined,
          status: 'succeeded',
        };
      }

      const response = await fetch(
        `https://api.stripe.com/v1/payment_intents/${input.paymentIntentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('[Payment] Stripe API error:', error);
        throw new Error(error.error?.message || 'Failed to get payment intent');
      }

      const paymentIntent = await response.json();

      return {
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentIntent.payment_method,
        status: paymentIntent.status,
      };
    } catch (error: any) {
      console.error('[Payment] Get payment intent error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get payment intent',
      });
    }
  });
