import { protectedProcedure } from "@/backend/trpc/middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const addPaymentMethodProcedure = protectedProcedure
  .input(
    z.object({
      paymentMethodId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[Payment] Add payment method:', input);

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
      let stripeCustomerId = userData.stripeCustomerId;

      if (!stripeCustomerId) {
        const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            'metadata[userId]': userId,
          }).toString(),
        });

        if (!customerResponse.ok) {
          const error = await customerResponse.json();
          console.error('[Payment] Create customer error:', error);
          throw new Error('Failed to create Stripe customer');
        }

        const customer = await customerResponse.json();
        stripeCustomerId = customer.id;

        await updateDoc(userRef, {
          stripeCustomerId,
        });
      }

      const attachResponse = await fetch(
        `https://api.stripe.com/v1/payment_methods/${input.paymentMethodId}/attach`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            customer: stripeCustomerId,
          }).toString(),
        }
      );

      if (!attachResponse.ok) {
        const error = await attachResponse.json();
        console.error('[Payment] Attach payment method error:', error);
        throw new Error('Failed to attach payment method');
      }

      const paymentMethod = await attachResponse.json();

      const savedPaymentMethods = userData.savedPaymentMethods || [];
      const isFirstCard = savedPaymentMethods.length === 0;

      if (isFirstCard) {
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
      }

      const newPaymentMethod = {
        id: paymentMethod.id,
        type: 'card' as const,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        expiryMonth: paymentMethod.card.exp_month,
        expiryYear: paymentMethod.card.exp_year,
        isDefault: isFirstCard,
        stripePaymentMethodId: paymentMethod.id,
        createdAt: new Date().toISOString(),
      };

      const updatedPaymentMethods = isFirstCard
        ? [newPaymentMethod]
        : [...savedPaymentMethods, newPaymentMethod];

      await updateDoc(userRef, {
        savedPaymentMethods: updatedPaymentMethods,
      });

      console.log('[Payment] Payment method added successfully');

      return {
        success: true,
        paymentMethod: newPaymentMethod,
      };
    } catch (error: any) {
      console.error('[Payment] Add payment method error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to add payment method',
      });
    }
  });
