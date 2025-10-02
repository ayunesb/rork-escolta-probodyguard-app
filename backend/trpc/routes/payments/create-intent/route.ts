import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export default protectedProcedure
  .input(
    z.object({
      bookingId: z.string(),
      amount: z.number().min(50),
      paymentMethodId: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Payment] Create intent:', input);

      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_secret_key')) {
        console.warn('[Payment] Using mock mode - Stripe key not configured');
        return {
          clientSecret: 'mock_client_secret_' + Date.now(),
          paymentIntentId: 'pi_mock_' + Date.now(),
        };
      }

      const userId = ctx.userId;
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const userData = userDoc.data();
      const stripeCustomerId = userData.stripeCustomerId;

      const params: Record<string, string> = {
        amount: input.amount.toString(),
        currency: 'mxn',
        'metadata[bookingId]': input.bookingId,
      };

      if (stripeCustomerId) {
        params.customer = stripeCustomerId;
      }

      if (input.paymentMethodId) {
        params.payment_method = input.paymentMethodId;
        params.confirm = 'true';
        params.return_url = 'escoltapro://payment-return';
      } else {
        params['automatic_payment_methods[enabled]'] = 'true';
      }

      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
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
