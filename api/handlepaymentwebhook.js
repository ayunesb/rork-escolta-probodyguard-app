import express from "express";
import bodyParser from "body-parser";
import braintree from "braintree";

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

// === MAIN ENDPOINT ===
app.post("/", async (req, res) => {
  const { bt_signature, bt_payload } = req.body;

  if (!bt_signature || !bt_payload) {
    return res.status(400).json({ error: "Missing signature or payload" });
  }

  try {
    const webhookNotification = await gateway.webhookNotification.parse(
      bt_signature,
      bt_payload
    );

    console.log("✅ Webhook verified:", webhookNotification.kind);
    console.log("🧾 Payload:", webhookNotification);

    if (webhookNotification.kind === "subscription_went_past_due") {
      const subId = webhookNotification.subscription?.id;
      console.log("⚠️ Subscription went past due:", subId);
      // 🔜 (Next: Firestore update logic will go here)
    }

    res.status(200).json({
      success: true,
      type: webhookNotification.kind,
      id:
        webhookNotification.subscription?.id ||
        webhookNotification.transaction?.id ||
        "n/a",
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res
      .status(200)
      .json({ success: true, note: "Error logged but returning 200 to prevent retries" });
  }
});

// ✅ REQUIRED FOR CLOUD RUN
app.listen(PORT, () => {
  console.log(`🚀 Webhook server listening on port ${PORT}`);
});
