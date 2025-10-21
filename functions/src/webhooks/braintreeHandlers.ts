/**
 * Braintree Webhook Handlers
 * Implements handlers for all Braintree webhook events
 * Reference: https://developer.paypal.com/braintree/docs/guides/webhooks
 */

import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v2';

// Helper to get Firestore instance
const getDb = () => admin.firestore();

/**
 * Handle subscription charged successfully
 */
export async function handleSubscriptionChargedSuccessfully(notification: any): Promise<void> {
  try {
    const db = getDb();
    const subscription = notification.subscription;
    const subscriptionId = subscription.id;

    logger.info('Processing subscription charge success', { subscriptionId });

    // Update subscription status in Firestore
    await db.collection('subscriptions').doc(subscriptionId).set({
      status: 'active',
      lastChargedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastChargedAmount: subscription.price,
      nextBillingDate: subscription.nextBillingDate,
      billingPeriodStartDate: subscription.billingPeriodStartDate,
      billingPeriodEndDate: subscription.billingPeriodEndDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Log the transaction
    if (subscription.transactions && subscription.transactions.length > 0) {
      const transaction = subscription.transactions[0];
      await db.collection('payment_transactions').doc(transaction.id).set({
        subscriptionId,
        amount: transaction.amount,
        status: transaction.status,
        type: 'subscription_charge',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    logger.info('Subscription charge processed successfully', { subscriptionId });
  } catch (error) {
    logger.error('Failed to handle subscription charged successfully', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: notification.subscription?.id 
    });
    throw error;
  }
}

/**
 * Handle subscription charged unsuccessfully
 */
export async function handleSubscriptionChargedUnsuccessfully(notification: any): Promise<void> {
  try {
    const db = getDb();
    const subscription = notification.subscription;
    const subscriptionId = subscription.id;

    logger.warn('Subscription charge failed', { subscriptionId });

    // Update subscription with failed status
    await db.collection('subscriptions').doc(subscriptionId).set({
      status: 'past_due',
      lastChargeAttempt: admin.firestore.FieldValue.serverTimestamp(),
      failureCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Get user ID from subscription to send notification
    const subscriptionDoc = await db.collection('subscriptions').doc(subscriptionId).get();
    if (subscriptionDoc.exists) {
      const userId = subscriptionDoc.data()?.userId;
      if (userId) {
        await sendUserNotification(userId, {
          type: 'payment_failed',
          title: 'Payment Failed',
          body: 'Your subscription payment failed. Please update your payment method.',
          data: { subscriptionId },
        });
      }
    }

    logger.info('Subscription charge failure processed', { subscriptionId });
  } catch (error) {
    logger.error('Failed to handle subscription charged unsuccessfully', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: notification.subscription?.id
    });
    throw error;
  }
}

/**
 * Handle subscription canceled
 */
export async function handleSubscriptionCanceled(notification: any): Promise<void> {
  try {
    const db = getDb();
    const subscription = notification.subscription;
    const subscriptionId = subscription.id;

    logger.info('Processing subscription cancellation', { subscriptionId });

    await db.collection('subscriptions').doc(subscriptionId).update({
      status: 'canceled',
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info('Subscription cancellation processed', { subscriptionId });
  } catch (error) {
    logger.error('Failed to handle subscription canceled', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: notification.subscription?.id
    });
    throw error;
  }
}

/**
 * Handle subscription expired
 */
export async function handleSubscriptionExpired(notification: any): Promise<void> {
  try {
    const db = getDb();
    const subscription = notification.subscription;
    const subscriptionId = subscription.id;

    logger.info('Processing subscription expiration', { subscriptionId });

    await db.collection('subscriptions').doc(subscriptionId).update({
      status: 'expired',
      expiredAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get user ID and send notification
    const subscriptionDoc = await db.collection('subscriptions').doc(subscriptionId).get();
    if (subscriptionDoc.exists) {
      const userId = subscriptionDoc.data()?.userId;
      if (userId) {
        await sendUserNotification(userId, {
          type: 'subscription_expired',
          title: 'Subscription Expired',
          body: 'Your subscription has expired. Renew now to continue your service.',
          data: { subscriptionId },
        });
      }
    }

    logger.info('Subscription expiration processed', { subscriptionId });
  } catch (error) {
    logger.error('Failed to handle subscription expired', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: notification.subscription?.id
    });
    throw error;
  }
}

/**
 * Handle dispute opened
 */
export async function handleDisputeOpened(notification: any): Promise<void> {
  try {
    const db = getDb();
    const dispute = notification.dispute;
    const disputeId = dispute.id;
    const transactionId = dispute.transaction?.id;

    logger.warn('CRITICAL: Dispute opened', { disputeId, transactionId });

    // Store dispute information
    await db.collection('disputes').doc(disputeId).set({
      transactionId,
      status: 'open',
      amount: dispute.amount,
      amountWon: dispute.amountWon,
      amountDisputed: dispute.amountDisputed,
      reason: dispute.reason,
      reasonCode: dispute.reasonCode,
      kind: dispute.kind,
      receivedDate: dispute.receivedDate,
      replyByDate: dispute.replyByDate,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update transaction status
    if (transactionId) {
      await db.collection('payment_transactions').doc(transactionId).update({
        disputeStatus: 'open',
        disputeId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Send alert to all admins
    await sendAdminAlert({
      type: 'dispute_opened',
      severity: 'high',
      title: '🚨 Payment Dispute Opened',
      body: `Dispute ID: ${disputeId}\nTransaction: ${transactionId}\nAmount: $${dispute.amount}\nReason: ${dispute.reason}\nReply by: ${dispute.replyByDate}`,
      data: { disputeId, transactionId, amount: dispute.amount },
    });

    logger.info('Dispute opened processed and admins notified', { disputeId });
  } catch (error) {
    logger.error('Failed to handle dispute opened', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disputeId: notification.dispute?.id
    });
    throw error;
  }
}

/**
 * Handle dispute lost
 */
export async function handleDisputeLost(notification: any): Promise<void> {
  try {
    const db = getDb();
    const dispute = notification.dispute;
    const disputeId = dispute.id;

    logger.warn('Dispute lost', { disputeId });

    await db.collection('disputes').doc(disputeId).update({
      status: 'lost',
      closedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update transaction
    if (dispute.transaction?.id) {
      await db.collection('payment_transactions').doc(dispute.transaction.id).update({
        disputeStatus: 'lost',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await sendAdminAlert({
      type: 'dispute_lost',
      severity: 'high',
      title: '⚠️ Payment Dispute Lost',
      body: `Dispute ID: ${disputeId}\nAmount Lost: $${dispute.amount}`,
      data: { disputeId },
    });

    logger.info('Dispute lost processed', { disputeId });
  } catch (error) {
    logger.error('Failed to handle dispute lost', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disputeId: notification.dispute?.id
    });
    throw error;
  }
}

/**
 * Handle dispute won
 */
export async function handleDisputeWon(notification: any): Promise<void> {
  try {
    const db = getDb();
    const dispute = notification.dispute;
    const disputeId = dispute.id;

    logger.info('Dispute won', { disputeId });

    await db.collection('disputes').doc(disputeId).update({
      status: 'won',
      closedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update transaction
    if (dispute.transaction?.id) {
      await db.collection('payment_transactions').doc(dispute.transaction.id).update({
        disputeStatus: 'won',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await sendAdminAlert({
      type: 'dispute_won',
      severity: 'low',
      title: '✅ Payment Dispute Won',
      body: `Dispute ID: ${disputeId}\nAmount Recovered: $${dispute.amountWon}`,
      data: { disputeId },
    });

    logger.info('Dispute won processed', { disputeId });
  } catch (error) {
    logger.error('Failed to handle dispute won', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disputeId: notification.dispute?.id
    });
    throw error;
  }
}

/**
 * Handle transaction settled
 */
export async function handleTransactionSettled(notification: any): Promise<void> {
  try {
    const db = getDb();
    const transaction = notification.disbursement?.transaction || notification.transaction;
    if (!transaction) {
      logger.warn('Transaction settled event missing transaction data');
      return;
    }

    const transactionId = transaction.id;

    logger.info('Processing transaction settlement', { transactionId });

    await db.collection('payment_transactions').doc(transactionId).set({
      status: 'settled',
      settledAt: admin.firestore.FieldValue.serverTimestamp(),
      settlementAmount: transaction.amount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    logger.info('Transaction settlement processed', { transactionId });
  } catch (error) {
    logger.error('Failed to handle transaction settled', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Handle transaction settlement declined
 */
export async function handleTransactionSettlementDeclined(notification: any): Promise<void> {
  try {
    const db = getDb();
    const transaction = notification.transaction;
    if (!transaction) {
      logger.warn('Transaction settlement declined event missing transaction data');
      return;
    }

    const transactionId = transaction.id;

    logger.warn('Transaction settlement declined', { transactionId });

    await db.collection('payment_transactions').doc(transactionId).update({
      status: 'settlement_declined',
      settlementDeclinedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendAdminAlert({
      type: 'settlement_declined',
      severity: 'medium',
      title: '⚠️ Transaction Settlement Declined',
      body: `Transaction ID: ${transactionId}\nAmount: $${transaction.amount}`,
      data: { transactionId },
    });

    logger.info('Transaction settlement declined processed', { transactionId });
  } catch (error) {
    logger.error('Failed to handle transaction settlement declined', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Handle disbursement
 */
export async function handleDisbursement(notification: any): Promise<void> {
  try {
    const db = getDb();
    const disbursement = notification.disbursement;
    const disbursementId = disbursement.id;

    logger.info('Processing disbursement', { disbursementId });

    await db.collection('payouts').doc(disbursementId).set({
      merchantAccountId: disbursement.merchantAccount?.id,
      amount: disbursement.amount,
      status: 'completed',
      disbursementDate: disbursement.disbursementDate,
      exceptionMessage: disbursement.exceptionMessage || null,
      followUpAction: disbursement.followUpAction || null,
      transactionIds: disbursement.transactionIds || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update related transactions
    if (disbursement.transactionIds && disbursement.transactionIds.length > 0) {
      const batch = db.batch();
      for (const txId of disbursement.transactionIds) {
        const txRef = db.collection('payment_transactions').doc(txId);
        batch.update(txRef, {
          disbursementId,
          disbursementStatus: 'completed',
          disbursedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }

    logger.info('Disbursement processed successfully', { 
      disbursementId, 
      amount: disbursement.amount,
      transactionCount: disbursement.transactionIds?.length || 0
    });
  } catch (error) {
    logger.error('Failed to handle disbursement', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disbursementId: notification.disbursement?.id
    });
    throw error;
  }
}

/**
 * Handle disbursement exception
 */
export async function handleDisbursementException(notification: any): Promise<void> {
  try {
    const db = getDb();
    const disbursement = notification.disbursement;
    const disbursementId = disbursement.id;

    logger.error('CRITICAL: Disbursement exception', { 
      disbursementId,
      exceptionMessage: disbursement.exceptionMessage 
    });

    await db.collection('payouts').doc(disbursementId).set({
      merchantAccountId: disbursement.merchantAccount?.id,
      amount: disbursement.amount,
      status: 'failed',
      disbursementDate: disbursement.disbursementDate,
      exceptionMessage: disbursement.exceptionMessage,
      followUpAction: disbursement.followUpAction,
      transactionIds: disbursement.transactionIds || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update related transactions
    if (disbursement.transactionIds && disbursement.transactionIds.length > 0) {
      const batch = db.batch();
      for (const txId of disbursement.transactionIds) {
        const txRef = db.collection('payment_transactions').doc(txId);
        batch.update(txRef, {
          disbursementId,
          disbursementStatus: 'failed',
          disbursementError: disbursement.exceptionMessage,
        });
      }
      await batch.commit();
    }

    await sendAdminAlert({
      type: 'disbursement_exception',
      severity: 'critical',
      title: '🚨 CRITICAL: Disbursement Failed',
      body: `Disbursement ID: ${disbursementId}\nAmount: $${disbursement.amount}\nReason: ${disbursement.exceptionMessage}\nAction Required: ${disbursement.followUpAction}`,
      data: { 
        disbursementId, 
        exceptionMessage: disbursement.exceptionMessage,
        followUpAction: disbursement.followUpAction
      },
    });

    logger.info('Disbursement exception processed and admins alerted', { disbursementId });
  } catch (error) {
    logger.error('Failed to handle disbursement exception', {
      error: error instanceof Error ? error.message : 'Unknown error',
      disbursementId: notification.disbursement?.id
    });
    throw error;
  }
}

/**
 * Helper: Send notification to user
 */
async function sendUserNotification(userId: string, notification: {
  type: string;
  title: string;
  body: string;
  data?: any;
}): Promise<void> {
  try {
    const db = getDb();
    await db.collection('notifications').add({
      userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info('User notification created', { userId, type: notification.type });
  } catch (error) {
    logger.error('Failed to send user notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId
    });
  }
}

/**
 * Helper: Send alert to all admin users
 */
async function sendAdminAlert(alert: {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  body: string;
  data?: any;
}): Promise<void> {
  try {
    const db = getDb();
    // Get all admin users
    const adminsSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get();

    const batch = db.batch();

    adminsSnapshot.forEach((adminDoc: admin.firestore.QueryDocumentSnapshot) => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId: adminDoc.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        body: alert.body,
        data: alert.data || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    logger.info('Admin alerts sent', { 
      type: alert.type, 
      severity: alert.severity,
      adminCount: adminsSnapshot.size 
    });
  } catch (error) {
    logger.error('Failed to send admin alert', {
      error: error instanceof Error ? error.message : 'Unknown error',
      alertType: alert.type
    });
  }
}
