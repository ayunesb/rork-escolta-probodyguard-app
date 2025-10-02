import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const setDefaultPaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Payment] Set default payment method:', input);

      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_secret_key')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe is not configured',
        });
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

      if (!stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No Stripe customer found',
        });
      }

      await fetch(`https://api.stripe.com/v1/customers/${stripeCustomerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          invoice_settings: JSON.stringify({
            default_payment_method: input.paymentMethodId,
          }),
        }).toString(),
      });

      const savedPaymentMethods = userData.savedPaymentMethods || [];
      const updatedPaymentMethods = savedPaymentMethods.map((pm: any) => ({
        ...pm,
        isDefault: pm.stripePaymentMethodId === input.paymentMethodId,
      }));

      await updateDoc(userRef, {
        savedPaymentMethods: updatedPaymentMethods,
      });

      console.log('[Payment] Default payment method set successfully');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[Payment] Set default payment method error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to set default payment method',
      });
    }
  });
