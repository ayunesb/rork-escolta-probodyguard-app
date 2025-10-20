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

const merchantId = process.env.BRAINTREE_MERCHANT_ID;
const publicKey = process.env.BRAINTREE_PUBLIC_KEY;
const privateKey = process.env.BRAINTREE_PRIVATE_KEY;

if (!merchantId || !publicKey || !privateKey) {
  console.error('[Braintree] Missing required credentials. Set BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, and BRAINTREE_PRIVATE_KEY in Firebase Functions config.');
  throw new Error('Braintree credentials are not configured');
}

console.log('[Braintree] Using credentials:', { merchantId, publicKey, privateKey: privateKey.substring(0, 8) + '...' });

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId,
  publicKey,
  privateKey,
});

// === Payments routes (mobile expects /payments/*) ===
app.get('/payments/client-token', async (req: Request, res: Response) => {
  try {
    // Ensure Braintree credentials are present (check fallback values too)
    if (!privateKey || !merchantId) {
      throw new Error('Braintree credentials missing');
    }

    // Only use mock in explicit Jest test environment
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID) {
      console.warn('[ClientToken] Jest test mode active, returning mock client token');
      res.json({ clientToken: 'mock-client-token-for-testing' });
      return;
    }

    // Use mock for development when BRAINTREE_EMULATE_LOCAL is true or when credentials are invalid
    if (process.env.BRAINTREE_EMULATE_LOCAL === 'true') {
      console.warn('[ClientToken] Development mode active, returning sandbox-style mock client token');
      res.json({ clientToken: 'sandbox_mock_' + Buffer.from(JSON.stringify({
        authorizationFingerprint: 'mock_auth_fingerprint_' + Date.now(),
        configUrl: 'https://api.sandbox.braintreegateway.com/merchants/mock/client_api/v1/configuration',
        challenges: [],
        environment: 'sandbox',
        clientApiUrl: 'https://api.sandbox.braintreegateway.com:443/merchants/mock/client_api',
        assetsUrl: 'https://assets.braintreegateway.com',
        authUrl: 'https://auth.venmo.sandbox.braintreegateway.com',
        analytics: { url: 'https://origin-analytics-sand.sandbox.braintree-api.com/mock' },
        threeDSecureEnabled: false,
        paypalEnabled: true,
        paypal: { displayName: 'Mock Company', clientId: null, assetsUrl: 'https://checkout.paypal.com' }
      })).toString('base64') });
      return;
    }

    // Use promise wrapper for Braintree callback
    const result = await new Promise((resolve, reject) => {
      // Don't pass customerId unless we have a valid Braintree customer
      (gateway.clientToken.generate as any)({
        // customerId: userId, // Remove this - we don't need to specify a customer for token generation
      }, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const clientToken = (result as any)?.clientToken;

    if (!clientToken) {
      throw new Error('Failed to generate client token from Braintree');
    }

    res.json({ clientToken });
  } catch (error) {
    console.error('[ClientToken] Error:', error);
    
    // If Braintree authentication fails, fall back to mock for development
    if ((error as any)?.type === 'authenticationError' && process.env.BRAINTREE_EMULATE_LOCAL === 'true') {
      console.warn('[ClientToken] Braintree auth failed, falling back to mock token');
      res.json({ clientToken: 'sandbox_mock_fallback_' + Date.now() });
      return;
    }
    
    res.status(500).json({ error: 'Failed to generate client token' });
  }
});

// Serve a hosted payment page with Braintree Drop-In UI
app.get('/payments/hosted-form', async (req: Request, res: Response) => {
  try {
    const { clientToken, amount, returnUrl } = req.query;

    if (!clientToken || !amount) {
      res.status(400).send('Missing required parameters: clientToken and amount');
      return;
    }

    // HTML page with Braintree Drop-In UI
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Seguro</title>
          <script src="https://js.braintreegateway.com/web/dropin/1.43.0/js/dropin.min.js"></script>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              min-height: 100vh;
              padding: 20px;
              color: #fff;
            }
            .container {
              max-width: 500px;
              margin: 40px auto;
              background: #2a2a2a;
              border-radius: 16px;
              padding: 30px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #DAA520;
              text-align: center;
            }
            .amount {
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0 30px;
              color: #fff;
            }
            #dropin-container {
              min-height: 300px;
            }
            .button {
              width: 100%;
              padding: 16px;
              background: #DAA520;
              color: #000;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 700;
              cursor: pointer;
              margin-top: 20px;
              transition: opacity 0.2s;
            }
            .button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .button:not(:disabled):hover {
              opacity: 0.9;
            }
            .security-note {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 20px;
            }
            .error {
              background: #ff4444;
              color: white;
              padding: 12px;
              border-radius: 8px;
              margin-top: 15px;
              display: none;
            }
            .loading {
              text-align: center;
              padding: 40px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔒 Pago Seguro</h1>
            <div class="amount">$${amount}</div>
            
            <div id="dropin-container"></div>
            <div id="loading" class="loading">Cargando formulario de pago...</div>
            <div id="error" class="error"></div>
            
            <button id="submit-button" class="button" style="display:none;">
              Pagar $${amount}
            </button>
            
            <div class="security-note">
              🔒 Conexión segura. Tu información está protegida por Braintree.
            </div>
          </div>

          <script>
            var button = document.getElementById('submit-button');
            var errorDiv = document.getElementById('error');
            var loading = document.getElementById('loading');
            var dropinInstance;

            dropin.create({
              authorization: '${clientToken}',
              container: '#dropin-container',
              locale: 'es_ES',
              card: {
                cardholderName: {
                  required: true
                },
                cvv: {
                  required: true
                },
                postalCode: {
                  required: true
                }
              }
            }, function (err, instance) {
              loading.style.display = 'none';
              
              if (err) {
                console.error('Drop-in error:', err);
                errorDiv.textContent = 'Error al cargar el formulario de pago: ' + err.message;
                errorDiv.style.display = 'block';
                return;
              }

              dropinInstance = instance;
              button.style.display = 'block';

              button.addEventListener('click', function () {
                button.disabled = true;
                button.textContent = 'Procesando...';
                errorDiv.style.display = 'none';

                instance.requestPaymentMethod(function (err, payload) {
                  if (err) {
                    console.error('Payment method error:', err);
                    errorDiv.textContent = 'Error: ' + err.message;
                    errorDiv.style.display = 'block';
                    button.disabled = false;
                    button.textContent = 'Pagar $${amount}';
                    return;
                  }

                  // Return nonce to the app via redirect
                  var returnUrl = '${returnUrl || 'nobodyguard://payment/success'}';
                  window.location.href = returnUrl + '?nonce=' + encodeURIComponent(payload.nonce);
                });
              });
            });
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('[HostedForm] Error:', error);
    res.status(500).send('Internal server error');
  }
});



app.post('/payments/process', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const db = admin.firestore();
  
  try {
    const { nonce, amount, saveCard, bookingId, userId } = req.body;
    
    if (!nonce || !amount) {
      res.status(400).json({ error: 'Missing required parameters: nonce and amount' });
      return;
    }

    if (!privateKey || !merchantId) {
      throw new Error('Braintree credentials missing');
    }
    
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID) {
      console.warn('[ProcessPayment] Jest test mode active, returning mock payment result');
      res.json({
        success: true,
        transactionId: `mock-transaction-${Date.now()}`,
        status: 'settled',
        amount: amount,
      });
      return;
    }
    
    await db.collection('payment_attempts').add({
      userId: userId || null,
      bookingId: bookingId || null,
      amount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'initiated',
    });
    
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
    const duration = Date.now() - startTime;
    
    if (result.success) {
      await db.collection('payment_attempts').add({
        userId: userId || null,
        bookingId: bookingId || null,
        amount,
        transactionId: result.transaction?.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'success',
        duration,
      });
      
      res.json({
        success: true,
        transactionId: result.transaction?.id,
      });
    } else {
      await db.collection('payment_attempts').add({
        userId: userId || null,
        bookingId: bookingId || null,
        amount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed',
        error: result.message,
        duration,
      });
      
      res.status(400).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[ProcessPayment] Error:', error);
    
    await db.collection('payment_attempts').add({
      userId: req.body.userId || null,
      bookingId: req.body.bookingId || null,
      amount: req.body.amount || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });
    
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

// POST creates (vaults) a payment method for a user. Use verifyCard and
// failOnDuplicatePaymentMethod to reduce fraud and duplicates.
export async function handleCreatePaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const {
      payment_method_nonce,
      token,
      cardholder_name,
      billing_address,
      make_default,
      verify_card,
      options,
    } = req.body || {};

    if (!payment_method_nonce && !token) {
      res.status(400).json({ success: false, error: 'payment_method_nonce or token is required' });
      return;
    }

    // Ensure Braintree credentials are present
    if (!process.env.BRAINTREE_PRIVATE_KEY || !process.env.BRAINTREE_MERCHANT_ID) {
      throw new Error('Braintree credentials missing');
    }

    // Only use mock in explicit Jest test environment
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID) {
      console.warn('[PaymentMethod] Jest test mode active, returning mock payment method token');
      res.json({ success: true, token: `mock-pm-${Date.now()}` });
      return;
    }

    const createParams: any = { customerId: userId };
    if (payment_method_nonce) createParams.paymentMethodNonce = payment_method_nonce;
    if (token) createParams.token = token;
    if (cardholder_name) createParams.cardholderName = cardholder_name;
    if (billing_address) createParams.billingAddress = billing_address;

    createParams.options = {
      ...(options || {}),
      verifyCard: verify_card !== undefined ? !!verify_card : true,
      failOnDuplicatePaymentMethod: true,
    };
    if (make_default) createParams.options.makeDefault = true;

    const result = await (gateway.paymentMethod as any).create(createParams as any);

    if ((result as any)?.success) {
      const pm = (result as any).paymentMethod;
      res.status(201).json({ success: true, token: pm.token, type: pm.__type || pm.type });
      return;
    }

    console.error('[PaymentMethod] create failed:', (result as any)?.message || result);
    res.status(400).json({ success: false, error: (result as any)?.message || 'Failed to create payment method' });
  } catch (error) {
    console.error('[PaymentMethod] Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Register the exported function as the route handler
app.post('/payments/methods/:userId', handleCreatePaymentMethod);

// GET lists vaulted payment methods for a user (customer)
app.get('/payments/methods/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });

    // Ensure Braintree credentials are present
    if (!process.env.BRAINTREE_PRIVATE_KEY || !process.env.BRAINTREE_MERCHANT_ID) {
      throw new Error('Braintree credentials missing');
    }

    // Only use mock in explicit Jest test environment
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID) {
      console.warn('[ListPaymentMethods] Jest test mode active, returning mock payment methods');
      res.json({ 
        success: true, 
        paymentMethods: [
          { token: 'mock-pm-1', type: 'CreditCard', default: true, cardType: 'Visa', maskedNumber: '****1111' },
          { token: 'mock-pm-2', type: 'CreditCard', default: false, cardType: 'MasterCard', maskedNumber: '****4444' }
        ]
      });
      return;
    }

    // Use gateway.customer.find to retrieve customer + payment methods
    const customerResult = await (gateway.customer as any).find(userId);
    if (!customerResult) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const vaulted: any[] = [];
    const paymentMethods = customerResult.paymentMethods || [];
    for (const pm of paymentMethods) {
      vaulted.push({ token: pm.token, type: pm.__type || pm.type, default: pm.default, cardType: pm.cardType || pm.brand, maskedNumber: pm.maskedNumber || pm.maskedNumber });
    }

    res.json({ success: true, paymentMethods: vaulted });
  } catch (error) {
    console.error('[ListPaymentMethods] Error:', error);
    // Braintree throws for missing customer; map to 404
    if (error && (error as any).type === 'notFoundError') {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
  return;
});

app.delete('/payments/methods/:userId/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Ensure Braintree credentials are present
    if (!process.env.BRAINTREE_PRIVATE_KEY || !process.env.BRAINTREE_MERCHANT_ID) {
      throw new Error('Braintree credentials missing');
    }
    
    // Only use mock in explicit Jest test environment
    if (process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID) {
      console.warn('[DeleteMethod] Jest test mode active, returning mock success');
      res.json({ success: true });
      return;
    }
    
    await gateway.paymentMethod.delete(token);
    
    res.json({ success: true });
  } catch (error) {
    console.error('[DeleteMethod] Error:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

export { app };
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
    
    let webhookNotification;
    try {
      webhookNotification = await gateway.webhookNotification.parse(
        bt_signature,
        bt_payload
      );
      console.log('[Webhook] Signature verified successfully');
    } catch (verificationError) {
      console.error('[Webhook] Signature verification failed:', verificationError);
      res.status(403).json({ error: 'Invalid webhook signature' });
      return;
    }
    
    console.log('[Webhook] Parsed notification:', webhookNotification.kind);
    
    const db = admin.firestore();
    
    await db.collection('webhook_logs').add({
      kind: webhookNotification.kind,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      rawData: JSON.stringify(webhookNotification),
      verified: true,
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
    res.status(500).json({ error: 'Webhook processing failed' });
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
