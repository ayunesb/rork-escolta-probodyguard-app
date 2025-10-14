const fetch = require('node-fetch');

describe('payment endpoints (integration)', () => {
  const base = 'http://127.0.0.1:5001/escolta-pro/us-central1/api';

  it('GET /payments/client-token returns mock token when test-mode', async () => {
    const res = await fetch(`${base}/payments/client-token?userId=test-user`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('clientToken');
    expect(body.clientToken).toMatch(/mock-client-token/);
  });

  it('POST /payments/methods/:userId returns mock pm token when test-mode', async () => {
    const res = await fetch(`${base}/payments/methods/test-user`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payment_method_nonce: 'fake-nonce' }),
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('token');
    expect(body.token).toMatch(/mock-pm-/);
  });
});
