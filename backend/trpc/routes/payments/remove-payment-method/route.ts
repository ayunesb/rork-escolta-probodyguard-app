import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const removePaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Payment] Remove payment method:', input);

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
      const savedPaymentMethods = userData.savedPaymentMethods || [];

      const detachResponse = await fetch(
        `https://api.stripe.com/v1/payment_methods/${input.paymentMethodId}/detach`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!detachResponse.ok) {
        const error = await detachResponse.json();
        console.error('[Payment] Detach payment method error:', error);
        throw new Error('Failed to detach payment method');
      }

      const updatedPaymentMethods = savedPaymentMethods.filter(
        (pm: any) => pm.stripePaymentMethodId !== input.paymentMethodId
      );

      if (updatedPaymentMethods.length > 0) {
        const removedMethod = savedPaymentMethods.find(
          (pm: any) => pm.stripePaymentMethodId === input.paymentMethodId
        );
        if (removedMethod?.isDefault) {
          updatedPaymentMethods[0].isDefault = true;
        }
      }

      await updateDoc(userRef, {
        savedPaymentMethods: updatedPaymentMethods,
      });

      console.log('[Payment] Payment method removed successfully');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[Payment] Remove payment method error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to remove payment method',
      });
    }
  });
