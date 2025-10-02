import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { STRIPE_SECRET_KEY } from "@/backend/config/env";

export default publicProcedure
  .input(
    z.object({
      paymentIntentId: z.string(),
      amount: z.number().optional(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Payment] Refund:', input);

      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_secret_key')) {
        console.warn('[Payment] Using mock mode - Stripe key not configured');
        return {
          refundId: 're_mock_' + Date.now(),
          status: 'succeeded',
        };
      }

      const params: Record<string, string> = {
        payment_intent: input.paymentIntentId,
      };

      if (input.amount) {
        params.amount = input.amount.toString();
      }

      if (input.reason) {
        params.reason = input.reason;
      }

      const response = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Payment] Stripe refund error:', error);
        throw new Error(error.error?.message || 'Failed to process refund');
      }

      const refund = await response.json();

      console.log('[Payment] Refund created:', refund.id);

      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
      };
    } catch (error: any) {
      console.error('[Payment] Refund error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to process refund',
      });
    }
  });
