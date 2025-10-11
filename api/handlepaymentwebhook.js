import express from "express";
import bodyParser from "body-parser";
import braintree from "braintree";
import admin from "firebase-admin";

// === FIREBASE ADMIN INIT (Cloud Run Safe) ===
if (!admin.apps.length) {
  admin.initializeApp({
    // ✅ Uses Cloud Run’s built-in service account credentials
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://escolta-pro-fe90e-default-rtdb.firebaseio.com",
  });
}

const db = admin.firestore();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// === BRAINTREE CONFIG ===
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "8jbpcm9yj7df7w4h",
  publicKey: "sandbox_p2dkbpfh_8jbpcm9yj7df7w4h",
  privateKey: "93d6e4e2976c96f93d2d472395ed6633",
});

// === MAIN WEBHOOK ENDPOINT ===
app.post("/", async (req, res) => {
  const { bt_signature, bt_payload } = req.body;

  if (!bt_signature || !bt_payload) {
    console.warn("⚠️ Missing signature or payload");
    return res.status(400).json({ error: "Missing signature or payload" });
  }

  try {
    const webhookNotification = await gateway.webhookNotification.parse(
      bt_signature,
      bt_payload
    );

    const kind = webhookNotification.kind;
    const subscriptionId = webhookNotification.subscription?.id || null;

    console.log(`✅ Webhook received: ${kind}`);
    console.log("🧾 Full payload:", JSON.stringify(webhookNotification, null, 2));

    // === 🔥 FIRESTORE LOGGING ===
    const logEntry = {
      kind,
      subscriptionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      payload: JSON.parse(JSON.stringify(webhookNotification)), // make serializable
    };

    await db.collection("webhook_logs").add(logEntry);
    console.log("🪵 Logged webhook event to Firestore");

    // === 🔥 USER STATUS SYNC ===
    if (subscriptionId) {
      let newStatus = null;

      if (kind === "subscription_went_past_due") newStatus = "inactive";
      if (kind === "subscription_canceled") newStatus = "inactive";
      if (kind === "subscription_charged_successfully") newStatus = "active";

      if (newStatus) {
        const usersRef = db.collection("users");
        const snapshot = await usersRef
          .where("subscriptionId", "==", subscriptionId)
          .get();

        if (!snapshot.empty) {
          for (const doc of snapshot.docs) {
            await doc.ref.update({ status: newStatus });
            console.log(`✅ Updated user ${doc.id} → ${newStatus}`);
          }
        } else {
          console.log("⚠️ No user found with that subscription ID");
        }
      }
    }

    return res.status(200).json({
      success: true,
      type: kind,
      id: subscriptionId || webhookNotification.transaction?.id || "n/a",
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);

    // === 🚨 FIRESTORE FAIL-SAFE LOGGING ===
    try {
      await db.collection("failed_webhook_logs").add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: err.message || String(err),
        body: req.body,
      });
      console.log("🧯 Logged failure to failed_webhook_logs");
    } catch (logErr) {
      console.error("🔥 Failed to log webhook error:", logErr);
    }

    // Always respond 200 to avoid Braintree retry spam
    return res.status(200).json({
      success: true,
      note: "Error logged but returning 200 to prevent retries",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server listening on port ${PORT}`);
});
