import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as braintree from 'braintree';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID || '8jbcpm9yj7df7w4h',
  publicKey: process.env.BRAINTREE_PUBLIC_KEY || 'fnig6rkd6vbkmxt',
  privateKey: process.env.BRAINTREE_PRIVATE_KEY || 'c96f93d2d472395ed66339',
});

app.post('/client-token', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    const result = await gateway.clientToken.generate({
      customerId: userId,
    });
    
    res.json({ clientToken: result.clientToken });
  } catch (error) {
    console.error('[ClientToken] Error:', error);
    res.status(500).json({ error: 'Failed to generate client token' });
  }
});

app.post('/process', async (req: Request, res: Response) => {
  try {
    const { nonce, amount, saveCard } = req.body;
    
    const saleRequest: braintree.TransactionRequest = {
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    };
    
    if (saveCard && saleRequest.options) {
      saleRequest.options.storeInVaultOnSuccess = true;
    }
    
    const result = await gateway.transaction.sale(saleRequest);
    
    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transaction?.id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error('[ProcessPayment] Error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

app.post('/refund', async (req: Request, res: Response) => {
  try {
    const { transactionId, amount } = req.body;
    
    const result = await gateway.transaction.refund(
      transactionId,
      amount ? amount.toString() : undefined
    );
    
    if (result.success) {
      res.json({
        success: true,
        refundId: result.transaction?.id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error('[Refund] Error:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

app.get('/methods/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const customer = await gateway.customer.find(userId);
    
    const paymentMethods = customer.paymentMethods?.map((method: braintree.CreditCard | braintree.PayPalAccount) => ({
      token: method.token,
      last4: method.last4,
      cardType: method.cardType,
      expirationMonth: method.expirationMonth,
      expirationYear: method.expirationYear,
    })) || [];
    
    res.json({ paymentMethods });
  } catch (error) {
    console.error('[GetMethods] Error:', error);
    res.json({ paymentMethods: [] });
  }
});

app.delete('/methods/:userId/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    await gateway.paymentMethod.delete(token);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[DeleteMethod] Error:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

export const api = functions.https.onRequest(app);

export const handlePaymentWebhook = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    const { bt_signature, bt_payload } = req.body;
    
    const webhookNotification = await gateway.webhookNotification.parse(
      bt_signature,
      bt_payload
    );
    
    console.log('[Webhook] Received:', webhookNotification.kind);
    
    if (webhookNotification.kind === 'subscription_charged_successfully') {
      console.log('[Webhook] Payment successful');
    } else if (webhookNotification.kind === 'subscription_charged_unsuccessfully') {
      console.log('[Webhook] Payment failed');
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook] Error:', error);
    res.sendStatus(500);
  }
});

export const processPayouts = functions.pubsub.schedule('every monday 09:00').onRun(async (_context: functions.EventContext) => {
  console.log('[ProcessPayouts] Starting weekly payout processing');
  
  try {
    const db = admin.firestore();
    
    const pendingPayoutsSnapshot = await db
      .collection('payouts')
      .where('status', '==', 'pending')
      .get();
    
    for (const doc of pendingPayoutsSnapshot.docs) {
      const payout = doc.data();
      
      try {
        await db.collection('payouts').doc(doc.id).update({
          status: 'processing',
        });
        
        console.log('[ProcessPayouts] Processing payout:', doc.id);
        
        await db.collection('payouts').doc(doc.id).update({
          status: 'completed',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        await db.collection('ledger').add({
          guardId: payout.guardId,
          bookingId: payout.bookingIds[0] || 'multiple',
          type: 'payout',
          amount: -payout.amount,
          description: `Payout ${doc.id}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log('[ProcessPayouts] Payout completed:', doc.id);
      } catch (error) {
        console.error('[ProcessPayouts] Error processing payout:', doc.id, error);
        
        await db.collection('payouts').doc(doc.id).update({
          status: 'failed',
          failureReason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    console.log('[ProcessPayouts] Weekly payout processing completed');
  } catch (error) {
    console.error('[ProcessPayouts] Error:', error);
  }
});

export const generateInvoice = functions.https.onCall(async (data: { bookingId: string }, _context: functions.https.CallableContext) => {
  if (!_context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { bookingId } = data;
  
  try {
    const db = admin.firestore();
    
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }
    
    const booking = bookingDoc.data();
    
    const invoice = {
      bookingId,
      clientId: booking?.clientId,
      guardId: booking?.guardId,
      amount: booking?.totalAmount,
      currency: 'MXN',
      issuedAt: admin.firestore.FieldValue.serverTimestamp(),
      items: [
        {
          description: 'Security Service',
          quantity: booking?.duration,
          unitPrice: booking?.totalAmount / booking?.duration,
          total: booking?.totalAmount,
        },
      ],
    };
    
    const invoiceDoc = await db.collection('invoices').add(invoice);
    
    console.log('[GenerateInvoice] Invoice created:', invoiceDoc.id);
    
    return {
      invoiceId: invoiceDoc.id,
      invoice,
    };
  } catch (error) {
    console.error('[GenerateInvoice] Error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate invoice');
  }
});

export const recordUsageMetrics = functions.pubsub.schedule('every day 00:00').onRun(async (_context: functions.EventContext) => {
  console.log('[RecordUsageMetrics] Recording daily usage metrics');
  
  try {
    const db = admin.firestore();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    const metrics = {
      date: dateStr,
      reads: 0,
      writes: 0,
      deletes: 0,
      storageBytes: 0,
      bandwidthBytes: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await db.collection('usage_metrics').add(metrics);
    
    console.log('[RecordUsageMetrics] Metrics recorded for', dateStr);
  } catch (error) {
    console.error('[RecordUsageMetrics] Error:', error);
  }
});
