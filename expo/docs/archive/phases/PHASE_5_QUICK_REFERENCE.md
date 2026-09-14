# Phase 5: Quick Reference Guide

## 🔐 Demo Accounts

### Client Account
```
Email: client@demo.com
Password: <contrasena en tu .env local, no en el repositorio>
Role: Client
Status: Verified & KYC Approved
```

### Guard Accounts
```
Email: guard1@demo.com
Password: <contrasena en tu .env local, no en el repositorio>
Role: Guard (Freelance)
Status: Verified & KYC Approved
Specialties: Armed, Armored Vehicle, Spanish

Email: guard2@demo.com
Password: <contrasena en tu .env local, no en el repositorio>
Role: Guard (Freelance)
Status: Verified & KYC Approved
Specialties: Unarmed, Standard Vehicle, English
```

### Company Account
```
Email: company@demo.com
Password: <contrasena en tu .env local, no en el repositorio>
Role: Company
Status: Verified & KYC Approved
Guards: 5 roster guards
```

### Admin Account
```
Email: admin@demo.com
Password: <contrasena en tu .env local, no en el repositorio>
Role: Admin
Access: Full platform access
```

---

## 💳 Test Payment Cards

### Successful Payment
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
ZIP: 12345
Result: ✅ Payment succeeds
```

### Declined Payment
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
ZIP: 12345
Result: ❌ Payment declined
```

### 3D Secure Required
```
Card Number: 4000 0027 6000 3184
Expiry: 12/25
CVV: 123
ZIP: 12345
Result: 🔐 Requires 3DS authentication
```

### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: 12/25
CVV: 123
ZIP: 12345
Result: ❌ Insufficient funds
```

---

## 📍 Test Locations

### Mexico City (Primary)
```
Address: Paseo de la Reforma 222, Juárez, CDMX
Coordinates: 19.4326, -99.1332
Use for: Local bookings
```

### Guadalajara (Cross-City)
```
Address: Av. Chapultepec 480, Americana, Guadalajara
Coordinates: 20.6737, -103.3576
Use for: Cross-city bookings
```

### Monterrey (Alternative)
```
Address: Av. Constitución 2450, Monterrey
Coordinates: 25.6866, -100.3161
Use for: Multi-city testing
```

---

## 🔢 Test Start Codes

### Valid Codes (Generated per booking)
```
Format: 6 digits (e.g., 123456)
Location: Booking detail page (guard view)
Validation: 3 attempts max, 5-minute cooldown
```

### Invalid Test Codes
```
000000 - Always invalid
111111 - Always invalid
999999 - Always invalid
```

---

## ⏱️ Test Timing Scenarios

### T-10 Testing
```
Scenario 1: Book for 10 minutes from now
- Map should appear immediately when T-10 reached

Scenario 2: Book for tomorrow
- Map should NOT appear until T-10 before scheduled time

Scenario 3: Instant booking
- Map appears only after start code entered
```

### Duration Testing
```
Minimum: 1 hour
Maximum: 8 hours
Extension: Up to 8 hours total
Test: Try 7h booking + 2h extension (should fail)
Test: Try 7h booking + 1h extension (should succeed)
```

---

## 📊 Expected Pricing

### Base Rates
```
Guard 1: $50/hour
Guard 2: $45/hour
Company Guards: $40/hour
```

### Multipliers
```
Armed Protection: +30%
Armored Vehicle: +50%
Multiple Protectors: Linear (2x = double)
```

### Fees (Admin View Only)
```
Processing Fee: 2.9% + $0.30
Platform Cut: 15% of subtotal
Guard Payout: Subtotal - Platform Cut
```

### Example Calculation
```
Base: $50/hour × 4 hours = $200
Armed (+30%): $200 × 1.3 = $260
Armored (+50%): $260 × 1.5 = $390
Processing Fee: $390 × 0.029 + $0.30 = $11.61
Total Client Pays: $401.61 MXN

Platform Cut (15%): $390 × 0.15 = $58.50
Guard Payout: $390 - $58.50 = $331.50 MXN
```

---

## 🧪 Test Data Sets

### Client Profile
```
First Name: Test
Last Name: Client
Phone: +52 55 1234 5678
Email: client@demo.com
Preferred Language: English
```

### Guard Profile
```
First Name: Carlos
Last Name: Rodriguez
Phone: +52 55 8765 4321
Email: guard1@demo.com
Languages: English, Spanish
Height: 6'2"
Weight: 200 lbs
Certifications: Armed Security, CPR, First Aid
```

### Company Profile
```
Company Name: Elite Security Services
Tax ID: RFC123456789
Phone: +52 55 9999 8888
Email: company@demo.com
Roster Size: 5 guards
```

---

## 🐛 Common Test Scenarios

### Happy Path
1. Sign up → Verify email → Upload KYC → Get approved
2. Browse guards → Select guard → Build quote
3. Pay with card → Wait for T-10 → Enter start code
4. Track service → Complete → Rate guard

### Edge Cases
1. Payment decline → Retry with different card
2. Wrong start code 3 times → Wait 5 minutes
3. Extend service → Hit 8-hour cap
4. Poor connectivity → Messages queue and send

### Error Cases
1. Deny location permission → See helpful error
2. Invalid card → See clear error message
3. Cancel completed booking → See error
4. Reassign guard → Requires client approval

---

## 📱 Platform-Specific Notes

### iOS
- Biometric auth available (Face ID/Touch ID)
- Push notifications require permission
- Location tracking in background requires "Always" permission
- Haptic feedback on key actions

### Android
- Biometric auth available (Fingerprint)
- Push notifications require permission
- Location tracking requires foreground service
- Vibration on key actions

### Web
- No biometric auth
- Browser notifications require permission
- Location via browser geolocation API
- No haptic feedback

---

## 🔍 Debugging Tips

### Check Firebase Console
```
Collections to monitor:
- users (user profiles)
- bookings (booking data)
- messages (chat messages)
- reviews (ratings and reviews)
- deviceTokens (push notification tokens)
```

### Check Browser Console
```
Look for:
- [Auth] logs
- [Booking] logs
- [Payment] logs
- [Chat] logs
- [Location] logs
```

### Check Network Tab
```
Monitor:
- API calls to /api/trpc/*
- Braintree payment requests
- Firebase Firestore operations
- Image uploads
```

---

## 📞 Support Contacts

### Technical Issues
```
Email: dev@escoltapro.com
Slack: #escolta-dev
```

### Business Questions
```
Email: support@escoltapro.com
Phone: +52 55 1234 5678
```

---

## 🎯 Success Criteria

### Phase 5 Complete When:
- ✅ All user flows tested end-to-end
- ✅ All payment scenarios verified
- ✅ All edge cases handled gracefully
- ✅ All negative tests pass
- ✅ Performance benchmarks met
- ✅ No critical bugs remaining
- ✅ Documentation complete
- ✅ Stakeholder sign-off obtained

---

## 🚀 Quick Start Testing

### 1. Client Flow (30 min)
```bash
1. Sign in as client@demo.com
2. Browse guards
3. Book guard1@demo.com for 2 hours
4. Pay with test card 4111...
5. Wait for guard acceptance
6. Enter start code when provided
7. Complete and rate
```

### 2. Guard Flow (20 min)
```bash
1. Sign in as guard1@demo.com
2. View pending jobs
3. Accept job
4. Show start code to client
5. Track location during service
6. Complete service
7. View payout
```

### 3. Admin Flow (15 min)
```bash
1. Sign in as admin@demo.com
2. Approve pending KYC
3. View analytics dashboard
4. Issue test refund
5. Export CSV report
```

---

**Last Updated**: 2025-01-06
**Version**: 1.0
