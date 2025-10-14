import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
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
  publicKey: process.env.BRAINTREE_PUBLIC_KEY || 'fnjq66rkd6vbkmxt',
  privateKey: process.env.BRAINTREE_PRIVATE_KEY || 'c96f93d2d472395ed663393d6e4e2976',
});

// === Payments routes (mobile expects /payments/*) ===
app.get('/payments/client-token', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || req.body?.userId;

    const result = await gateway.clientToken.generate({
      customerId: userId,
    });

    res.json({ clientToken: result.clientToken });
  } catch (error) {
    console.error('[ClientToken] Error:', error);
    res.status(500).json({ error: 'Failed to generate client token' });
  }
});

app.post('/payments/process', async (req: Request, res: Response) => {
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

app.post('/payments/refund', async (req: Request, res: Response) => {
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

app.get('/payments/methods/:userId', async (req: Request, res: Response) => {
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

app.delete('/payments/methods/:userId/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    await gateway.paymentMethod.delete(token);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[DeleteMethod] Error:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

export const api = onRequest(app);

// === Webhook route moved into Express app to avoid separate Cloud Run service ===
app.post('/webhooks/braintree', async (req: Request, res: Response) => {
  try {
    console.log('[Webhook] Received request');
    console.log('[Webhook] Headers:', req.headers);
    console.log('[Webhook] Body:', req.body);
    console.log('[Webhook] Query:', req.query);
    
    const bt_signature = req.body.bt_signature || req.query.bt_signature as string;
    const bt_payload = req.body.bt_payload || req.query.bt_payload as string;
    
    if (!bt_signature || !bt_payload) {
      console.error('[Webhook] Missing signature or payload');
      console.log('[Webhook] bt_signature:', bt_signature);
      console.log('[Webhook] bt_payload:', bt_payload);
      res.status(400).json({ error: 'Missing signature or payload' });
      return;
    }
    
    const webhookNotification = await gateway.webhookNotification.parse(
      bt_signature,
      bt_payload
    );
    
    console.log('[Webhook] Parsed notification:', webhookNotification.kind);
    
    const db = admin.firestore();
    
    await db.collection('webhook_logs').add({
      kind: webhookNotification.kind,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      rawData: JSON.stringify(webhookNotification),
    });
    
    switch (webhookNotification.kind) {
      case 'subscription_charged_successfully':
        console.log('[Webhook] Payment successful');
        break;
        
      case 'subscription_charged_unsuccessfully':
        console.log('[Webhook] Payment failed');
        break;
        
      case 'check':
        console.log('[Webhook] Check notification received');
        break;
        
      default:
        console.log('[Webhook] Unhandled notification kind:', webhookNotification.kind);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    console.error('[Webhook] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[Webhook] Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(200).json({ success: true, note: 'Error logged but returning 200 to prevent retries' });
  }
});

export const processPayouts = onSchedule('every monday 09:00', async () => {
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

export const generateInvoice = onCall(async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { bookingId } = request.data as { bookingId: string };
  
  try {
    const db = admin.firestore();
    
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      throw new HttpsError('not-found', 'Booking not found');
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
    throw new HttpsError('internal', 'Failed to generate invoice');
  }
});

export const recordUsageMetrics = onSchedule('every day 00:00', async () => {
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
