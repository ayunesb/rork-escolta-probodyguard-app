const http = require('http');

async function fetchClientToken() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5001/escolta-pro-fe90e/us-central1/api/payments/client-token?userId=test-user', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          if (json.clientToken) {
            console.log('OK: clientToken found:', json.clientToken);
            process.exit(0);
          } else {
            console.error('FAIL: clientToken missing in response:', json);
            process.exit(2);
          }
        } catch (_err) {
          console.error('FAIL: response not JSON', data);
          process.exit(2);
        }
      });
    }).on('error', (err) => {
      console.error('FAIL: request error', err);
      process.exit(2);
    });
  });
}

fetchClientToken();
