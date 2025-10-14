import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/middleware/auth';
import { getBraintreeGateway } from '@/backend/lib/braintree';
import { db as getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

export const braintreeRefundProcedure = protectedProcedure
  .input(
    z.object({
      transactionId: z.string(),
      amount: z.number().positive().optional(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[Braintree] Processing refund:', {
      transactionId: input.transactionId,
      amount: input.amount,
    });

    try {
      const gateway = getBraintreeGateway();
      
      const firestore = getDb();
      const paymentsRef = collection(firestore, 'payments');
      const q = query(paymentsRef, where('transactionId', '==', input.transactionId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Payment record not found');
      }

      const paymentDoc = snapshot.docs[0];
      const paymentData = paymentDoc.data();

      if (paymentData.userId !== ctx.userId) {
        throw new Error('Unauthorized to refund this payment');
      }

      const refundAmount = input.amount ? input.amount.toFixed(2) : undefined;
      const result = await gateway.transaction.refund(input.transactionId, refundAmount);

      if (!result || !result.success) {
        console.error('[Braintree] Refund failed:', result?.message);
        throw new Error(result?.message || 'Refund failed');
      }

      const transaction = result.transaction;
      if (!transaction) {
        console.error('[Braintree] Refund result missing transaction');
        throw new Error('Refund response missing transaction');
      }

      console.log('[Braintree] Refund successful:', transaction.id);

      await updateDoc(doc(firestore, 'payments', paymentDoc.id), {
        status: 'refunded',
        refundedAt: serverTimestamp(),
        refundTransactionId: transaction.id,
        refundAmount: input.amount || (paymentData as any).amount,
        refundReason: input.reason || 'Customer requested refund',
        updatedAt: serverTimestamp(),
      });

      const refundRecord = {
        originalTransactionId: input.transactionId,
        refundTransactionId: transaction.id,
        originalPaymentId: paymentDoc.id,
        userId: ctx.userId,
        amount: input.amount || (paymentData as any).amount,
        currency: (paymentData as any).currency,
        reason: input.reason || 'Customer requested refund',
        status: (transaction as any).status,
        createdAt: serverTimestamp(),
      };

      const refundRef = await addDoc(collection(firestore, 'refunds'), refundRecord);
      console.log('[Braintree] Refund record created:', refundRef.id);

      return {
        id: transaction.id,
        status: (transaction as any).status,
        amount: input.amount || (paymentData as any).amount,
        currency: (paymentData as any).currency,
        refundRecordId: refundRef.id,
      };
    } catch (error: any) {
      console.error('[Braintree] Refund error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  });
