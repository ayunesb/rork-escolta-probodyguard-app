const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.yourdomain.com";

async function testBraintree() {
  console.log("🔍 Testing Braintree client token request…");

  try {
    // dynamic import to avoid ESM/CommonJS interop
    const { default: fetch } = await import('node-fetch');
    // Call the same endpoint your app uses in braintreeService.ts
    const response = await fetch(`${API_URL}/api/trpc/payments.braintree.clientToken`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    console.log("✅ Braintree client token received successfully:");
    console.log(json);

    console.log("\nNext, verify you can generate a payment method nonce in the app UI.");
    console.log("If this succeeds, sandbox handshake is 100% good.");
  } catch (err: any) {
    console.error("❌ Braintree handshake failed:", err.message);
    console.error("Make sure your API_URL is correct and the backend .env has the same BRAINTREE_* keys.");
  }
}

testBraintree();
