import braintree from "braintree";
import fetch from "node-fetch";

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "8jbpcm9yj7df7w4h",
  publicKey: "sandbox_p2dkbpfh_8jbpcm9yj7df7w4h",
  privateKey: "93d6e4e2976c96f93d2d472395ed6633",
});

async function sendSampleWebhook() {
  try {
    // ✅ Use string literal instead of WebhookNotification.Kind enum
    const sample = await gateway.webhookTesting.sampleNotification(
      "subscription_went_past_due", // ← use the literal string
      "test-subscription-id"
    );

    const res = await fetch("https://handlepaymentwebhook-fqzvp2js5q-uc.a.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        bt_signature: sample.bt_signature,
        bt_payload: sample.bt_payload,
      }),
    });

    console.log("📡 Sent webhook. Status:", res.status);
    const text = await res.text();
    console.log("📨 Response:", text);
  } catch (err: any) {
    console.error("❌ Error sending sample webhook:", err.message);
  }
}

sendSampleWebhook();

