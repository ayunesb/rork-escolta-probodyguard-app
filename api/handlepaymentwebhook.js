import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import braintree from "braintree";
import admin from "firebase-admin";

// === FIREBASE ADMIN INIT ===
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://escolta-pro-fe90e-default-rtdb.firebaseio.com",
  });
}

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// === BRAINTREE CONFIG ===
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID || "8jbpcm9yj7df7w4h",
  publicKey: process.env.BRAINTREE_PUBLIC_KEY || "sandbox_p2dkbpfh_8jbpcm9yj7df7w4h",
  privateKey: process.env.BRAINTREE_PRIVATE_KEY || "93d6e4e2976c96f93d2d472395ed6633",
});

// === 🔹 HEALTH CHECK ===
app.get("/health", (req, res) => res.send("Escolta API OK 🚀"));

// === 🔹 CLIENT TOKEN ===
app.post("/payments/client-token", async (req, res) => {
  try {
    const { clientToken } = await gateway.clientToken.generate({});
    console.log("✅ Client token generated");
    res.json({ clientToken });
  } catch (err) {
    console.error("❌ Error generating token:", err);
    res.status(500).json({ error: "Failed to generate client token" });
  }
});

// === 🔹 PROCESS PAYMENT ===
app.post("/payments/process", async (req, res) => {
  try {
    const { nonce, amount, bookingId, userId } = req.body;
    console.log("💳 Processing payment:", { nonce, amount, bookingId, userId });

    const saleResult = await gateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    });

    if (!saleResult.success) {
      console.error("❌ Braintree sale error:", saleResult.message);
      return res.status(400).json({ error: saleResult.message });
    }

    const tx = saleResult.transaction;
    console.log("✅ Payment processed:", tx.id);

    // Save transaction to Firestore
    await db.collection("payments").add({
      transactionId: tx.id,
      amount,
      userId,
      bookingId,
      status: tx.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, transactionId: tx.id });
  } catch (err) {
    console.error("❌ Payment processing failed:", err);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// === 🔹 GET SAVED METHODS ===
app.get("/payments/methods/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const methodsRef = await db
      .collection("paymentMethods")
      .where("userId", "==", userId)
      .get();

    const paymentMethods = methodsRef.docs.map((doc) => doc.data());
    res.json({ paymentMethods });
  } catch (err) {
    console.error("❌ Error fetching methods:", err);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

// === 🔹 DELETE SAVED METHOD ===
app.delete("/payments/methods/:userId/:token", async (req, res) => {
  try {
    const { userId, token } = req.params;

    const results = await db
      .collection("paymentMethods")
      .where("userId", "==", userId)
      .where("token", "==", token)
      .get();

    if (results.empty) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    for (const doc of results.docs) {
      await doc.ref.delete();
    }

    console.log(`🗑️ Deleted payment method for ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting method:", err);
    res.status(500).json({ error: "Failed to remove payment method" });
  }
});

// === 🔹 REFUND PAYMENT ===
app.post("/payments/refund", async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    console.log("💰 Processing refund:", { transactionId, amount });

    const refund = await gateway.transaction.refund(transactionId, amount?.toString());
    console.log("✅ Refund complete:", refund.transaction.id);

    await db.collection("refunds").add({
      transactionId,
      refundId: refund.transaction.id,
      amount: amount || refund.transaction.amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, refundId: refund.transaction.id });
  } catch (err) {
    console.error("❌ Refund error:", err);
    res.status(500).json({ error: "Refund processing failed" });
  }
});

// === 🔹 BRAINTREE WEBHOOK ===
app.post("/api/braintree/webhook", async (req, res) => {
  const { bt_signature, bt_payload } = req.body;

  if (!bt_signature || !bt_payload) {
    return res.status(400).json({ error: "Missing signature or payload" });
  }

  try {
    const notification = await gateway.webhookNotification.parse(bt_signature, bt_payload);
    const kind = notification.kind;
    const subscriptionId = notification.subscription?.id;

    console.log(`🔔 Webhook received: ${kind}`);

    await db.collection("webhook_logs").add({
      kind,
      subscriptionId: subscriptionId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      payload: JSON.parse(JSON.stringify(notification)),
    });

    res.json({ success: true, kind });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(200).json({ success: true, note: "Error logged but returning 200" });
  }
});

app.listen(PORT, () => console.log(`🚀 Escolta Payments API running on port ${PORT}`));

export default app;
