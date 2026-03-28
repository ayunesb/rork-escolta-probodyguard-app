# 🎯 Payment Debug - Quick Steps

## ⚡ 3-STEP PROCESS:

### 1️⃣ Reload App
Press `r` in Metro terminal

### 2️⃣ Try Payment
- Login: `client@demo.com` / `demo123`
- Create booking → Payment
- Card: `4111 1111 1111 1111`
- Name: `Test User`
- Exp: `12/26`, CVV: `123`
- Click **"Pay Now"**

### 3️⃣ Check Logs
Watch Metro terminal for:
```
[WebView] Pay button clicked!
[WebView] Payment nonce received: ...
[PaymentSheet] Received message from WebView
[Payment] Processing payment
```

---

## ✅ Success = You'll see:
```
[Payment] Payment successful: txn_...
[Booking] Booking confirmed
(Navigates to booking details)
```

## ❌ Failure = Tell me where it stops!

---

**Just press `r` and try it!** 🚀
