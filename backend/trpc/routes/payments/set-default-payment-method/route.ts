import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SavedPaymentMethod } from "@/types";

export const setDefaultPaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Payment] Set default payment method:', input);

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

      const updatedMethods = savedPaymentMethods.map((pm: SavedPaymentMethod) => ({
        ...pm,
        isDefault: pm.stripePaymentMethodId === input.paymentMethodId,
      }));

      await updateDoc(userRef, { savedPaymentMethods: updatedMethods });

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
