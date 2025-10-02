import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SavedPaymentMethod } from "@/types";
import { STRIPE_SECRET_KEY } from "@/backend/config/env";

export const removePaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Payment] Remove payment method:', input);

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

      const updatedMethods = savedPaymentMethods.filter(
        (pm: SavedPaymentMethod) => pm.stripePaymentMethodId !== input.paymentMethodId
      );

      if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('your_secret_key')) {
        await fetch(
          `https://api.stripe.com/v1/payment_methods/${input.paymentMethodId}/detach`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
      }

      await updateDoc(userRef, { savedPaymentMethods: updatedMethods });

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
