import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/middleware/auth';
import { getBraintreeGateway } from '@/backend/lib/braintree';
import { PAYMENTS_CURRENCY } from '@/backend/config/env';
import { db as getDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { rateLimitService } from '@/services/rateLimitService';

export const braintreeCheckoutProcedure = protectedProcedure
  .input(
    z.object({
      nonce: z.string(),
      amount: z.number().positive(),
      currency: z.string().default('MXN'),
      customerId: z.string().optional(),
      bookingId: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[Braintree] Processing checkout:', {
      amount: input.amount,
      currency: input.currency,
      customerId: input.customerId,
      bookingId: input.bookingId,
    });

    const rateLimitCheck = await rateLimitService.checkRateLimit(
      'payment',
      ctx.userId
    );
    if (!rateLimitCheck.allowed) {
      const errorMessage = rateLimitService.getRateLimitError(
        'payment',
        rateLimitCheck.blockedUntil!
      );
      throw new Error(errorMessage);
    }

    try {
      const gateway = getBraintreeGateway();
      
      const saleRequest: any = {
        amount: input.amount.toFixed(2),
        paymentMethodNonce: input.nonce,
        options: {
          submitForSettlement: true,
        },
      };

      if (input.customerId) {
        saleRequest.customerId = input.customerId;
        saleRequest.options.storeInVaultOnSuccess = true;
      }

      const result = await gateway.transaction.sale(saleRequest);

      if (!result || !result.success) {
        console.error('[Braintree] Transaction failed:', result?.message);
        throw new Error(result?.message || 'Transaction failed');
      }

      const transaction = result.transaction;
      if (!transaction) {
        console.error('[Braintree] Transaction object missing in result');
        throw new Error('Transaction response missing from gateway');
      }
      console.log('[Braintree] Transaction successful:', transaction.id);

      const amountCents = Math.round(input.amount * 100);
      const platformFeeCents = Math.round(amountCents * 0.15);
      const guardPayoutCents = Math.round(amountCents * 0.70);
      const companyPayoutCents = amountCents - platformFeeCents - guardPayoutCents;

      const paymentRecord = {
  transactionId: transaction.id,
        userId: ctx.userId,
        bookingId: input.bookingId || null,
        amount: input.amount,
        amountCents,
        currency: input.currency || PAYMENTS_CURRENCY,
  status: (transaction as any).status,
  paymentMethod: (transaction as any).paymentInstrumentType,
        platformFeeCents,
        guardPayoutCents,
        companyPayoutCents,
        description: input.description || 'Booking payment',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const firestore = getDb();
      const paymentRef = await addDoc(collection(firestore, 'payments'), paymentRecord);
      console.log('[Braintree] Payment record created:', paymentRef.id);

      await rateLimitService.resetRateLimit('payment', ctx.userId);

      return {
        id: transaction.id,
        status: (transaction as any).status,
        amount: input.amount,
        currency: input.currency || PAYMENTS_CURRENCY,
        paymentRecordId: paymentRef.id,
      };
    } catch (error: any) {
      console.error('[Braintree] Checkout error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  });
