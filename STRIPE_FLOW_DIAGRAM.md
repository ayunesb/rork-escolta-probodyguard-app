# 💳 Stripe Payment Flow

## 📊 Complete Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. Browse Guards
   │
   ├─> Select Guard
   │
   ├─> Fill Booking Details
   │   ├─ Date & Time (dropdown)
   │   ├─ Duration (hours)
   │   ├─ Vehicle Type (Standard/Armored)
   │   ├─ Protection Type (Armed/Unarmed)
   │   ├─ Dress Code
   │   ├─ Number of Protectees
   │   └─ Pickup Location (auto-filled)
   │
   └─> Continue to Payment

2. Payment Screen
   │
   ├─> View Booking Summary
   │   ├─ Guard info
   │   ├─ Date/Time
   │   └─ Location
   │
   ├─> View Price Breakdown
   │   ├─ Service Fee (hourly rate × hours)
   │   ├─ Vehicle Fee (+25% if armored)
   │   ├─ Protection Fee (+15% if armed)
   │   ├─ Platform Fee (10% of subtotal)
   │   └─ Total Amount
   │
   └─> Enter Payment Details
       ├─ Card Number
       ├─ Expiry Date
       ├─ CVV
       └─ Cardholder Name

3. Process Payment
   │
   ├─> [LOADING STATE]
   │
   └─> Payment Result
       ├─ ✅ Success → Booking Confirmed
       │   ├─ Generate 6-digit start code
       │   ├─ Create booking in Firebase
       │   ├─ Send notification
       │   └─ Navigate to Active Booking
       │
       └─ ❌ Failed → Show Error
           ├─ Display error message
           └─ Allow retry
```

---

## 🔄 Technical Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │ Backend  │         │  Stripe  │         │ Firebase │
│   App    │         │  (tRPC)  │         │   API    │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │                     │
     │ 1. Create Payment  │                     │                     │
     │ Intent Request     │                     │                     │
     ├───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 2. Create Payment   │                     │
     │                    │ Intent (POST)       │                     │
     │                    ├────────────────────>│                     │
     │                    │                     │                     │
     │                    │ 3. Payment Intent   │                     │
     │                    │ + Client Secret     │                     │
     │                    │<────────────────────┤                     │
     │                    │                     │                     │
     │ 4. Client Secret   │                     │                     │
     │<───────────────────┤                     │                     │
     │                    │                     │                     │
     │ 5. Show Payment    │                     │                     │
     │ Sheet (Native)     │                     │                     │
     │ or Form (Web)      │                     │                     │
     │                    │                     │                     │
     │ 6. User Enters     │                     │                     │
     │ Card Details       │                     │                     │
     │                    │                     │                     │
     │ 7. Confirm Payment │                     │                     │
     │ (via Stripe SDK)   │                     │                     │
     ├────────────────────┼────────────────────>│                     │
     │                    │                     │                     │
     │                    │                     │ 8. Process Payment  │
     │                    │                     │ (Charge Card)       │
     │                    │                     │                     │
     │                    │                     │ 9. Payment Result   │
     │<───────────────────┼─────────────────────┤                     │
     │                    │                     │                     │
     │ 10. Create Booking │                     │                     │
     │ (if success)       │                     │                     │
     ├───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 11. Save Booking    │                     │
     │                    ├─────────────────────┼────────────────────>│
     │                    │                     │                     │
     │                    │ 12. Booking Saved   │                     │
     │                    │<────────────────────┼─────────────────────┤
     │                    │                     │                     │
     │ 13. Booking        │                     │                     │
     │ Confirmation       │                     │                     │
     │<───────────────────┤                     │                     │
     │                    │                     │                     │
     │ 14. Show Success   │                     │                     │
     │ + Start Code       │                     │                     │
     │                    │                     │                     │
```

---

## 💰 Price Calculation Flow

```
Base Rate (Hourly)
    │
    ├─> × Hours
    │
    └─> = Subtotal
         │
         ├─> + Vehicle Fee (if armored: +25%)
         │
         ├─> + Protection Fee (if armed: +15%)
         │
         ├─> = Service Total
         │
         ├─> + Platform Fee (10% of service total)
         │
         └─> = TOTAL AMOUNT
              │
              └─> × 100 = Amount in cents (for Stripe)

Example:
  Hourly Rate: $50
  Hours: 4
  Vehicle: Armored
  Protection: Armed
  
  Subtotal: $50 × 4 = $200
  Vehicle Fee: $200 × 0.25 = $50
  Protection Fee: $200 × 0.15 = $30
  Service Total: $200 + $50 + $30 = $280
  Platform Fee: $280 × 0.10 = $28
  TOTAL: $280 + $28 = $308
  
  Stripe Amount: $308 × 100 = 30800 cents
```

---

## 🔄 Refund Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Admin   │         │ Backend  │         │  Stripe  │         │ Firebase │
│   App    │         │  (tRPC)  │         │   API    │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │                     │
     │ 1. Request Refund  │                     │                     │
     ├───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 2. Verify Booking   │                     │
     │                    ├─────────────────────┼────────────────────>│
     │                    │                     │                     │
     │                    │ 3. Booking Data     │                     │
     │                    │<────────────────────┼─────────────────────┤
     │                    │                     │                     │
     │                    │ 4. Create Refund    │                     │
     │                    ├────────────────────>│                     │
     │                    │                     │                     │
     │                    │ 5. Refund Result    │                     │
     │                    │<────────────────────┤                     │
     │                    │                     │                     │
     │                    │ 6. Update Booking   │                     │
     │                    │ Status              │                     │
     │                    ├─────────────────────┼────────────────────>│
     │                    │                     │                     │
     │ 7. Refund Success  │                     │                     │
     │<───────────────────┤                     │                     │
     │                    │                     │                     │
```

---

## 🔐 Security Flow

```
Environment Variables (.env)
    │
    ├─> EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
    │   └─> Used in client app (safe to expose)
    │
    └─> STRIPE_SECRET_KEY
        └─> Used in backend only (NEVER exposed to client)

Payment Intent Creation
    │
    ├─> Client requests payment intent
    │
    ├─> Backend creates intent with Stripe API
    │   └─> Uses SECRET KEY
    │
    ├─> Backend returns CLIENT SECRET only
    │
    └─> Client uses client secret to confirm payment
        └─> Uses PUBLISHABLE KEY

Card Details
    │
    ├─> Never stored in our database
    │
    ├─> Sent directly to Stripe (PCI compliant)
    │
    └─> We only store:
        ├─ Payment Intent ID
        ├─ Last 4 digits
        └─ Transaction status
```

---

## 📱 Platform Differences

### iOS/Android (Native)
```
User taps "Pay"
    │
    ├─> Stripe SDK initializes payment sheet
    │
    ├─> Native UI appears (bottom sheet)
    │
    ├─> User enters card details
    │
    ├─> Stripe SDK handles:
    │   ├─ Card validation
    │   ├─ 3D Secure authentication
    │   └─ Payment confirmation
    │
    └─> Result returned to app
```

### Web
```
User taps "Pay"
    │
    ├─> Custom form validates input
    │
    ├─> Create payment method via API
    │
    ├─> Confirm payment intent
    │
    ├─> If 3D Secure required:
    │   └─> Open authentication modal
    │
    └─> Result returned to app
```

---

## 🎯 State Management

```
Payment States:
    │
    ├─> IDLE
    │   └─> Initial state, form ready
    │
    ├─> CREATING_INTENT
    │   └─> Requesting payment intent from backend
    │
    ├─> INTENT_CREATED
    │   └─> Client secret received
    │
    ├─> PROCESSING
    │   └─> User confirming payment
    │
    ├─> SUCCEEDED
    │   └─> Payment successful, creating booking
    │
    └─> FAILED
        └─> Error occurred, show message

Booking States:
    │
    ├─> PENDING_PAYMENT
    │   └─> Waiting for payment
    │
    ├─> CONFIRMED
    │   └─> Payment succeeded, booking active
    │
    ├─> IN_PROGRESS
    │   └─> Service started (start code entered)
    │
    ├─> COMPLETED
    │   └─> Service finished
    │
    ├─> CANCELLED
    │   └─> Booking cancelled
    │
    └─> REFUNDED
        └─> Payment refunded
```

---

## 🔍 Error Handling

```
Error Types:
    │
    ├─> Network Errors
    │   ├─ No internet connection
    │   ├─ Backend unreachable
    │   └─ Timeout
    │
    ├─> Validation Errors
    │   ├─ Invalid card number
    │   ├─ Expired card
    │   └─ Invalid CVV
    │
    ├─> Payment Errors
    │   ├─ Card declined
    │   ├─ Insufficient funds
    │   └─ 3D Secure failed
    │
    └─> System Errors
        ├─ Stripe API error
        ├─ Firebase error
        └─ Unknown error

Error Flow:
    │
    ├─> Catch error
    │
    ├─> Log to console (with details)
    │
    ├─> Show user-friendly message
    │
    ├─> Allow retry
    │
    └─> Track in analytics (optional)
```

---

## 📊 Data Flow

```
Booking Data:
    │
    ├─> Client Input
    │   ├─ Guard ID
    │   ├─ Date/Time
    │   ├─ Duration
    │   ├─ Vehicle Type
    │   ├─ Protection Type
    │   ├─ Dress Code
    │   ├─ Number of Protectees
    │   └─ Pickup Location
    │
    ├─> Calculated Data
    │   ├─ Subtotal
    │   ├─ Vehicle Fee
    │   ├─ Protection Fee
    │   ├─ Platform Fee
    │   └─ Total Amount
    │
    ├─> Payment Data
    │   ├─ Payment Intent ID
    │   ├─ Transaction ID
    │   ├─ Payment Status
    │   └─ Payment Method (last 4)
    │
    └─> Booking Record
        ├─ Booking ID
        ├─ User ID
        ├─ Guard ID
        ├─ Start Code
        ├─ Status
        ├─ Created At
        └─ All above data
```

---

This diagram shows the complete flow from user browsing guards to successful payment and booking creation. Each step is handled with proper error handling and user feedback.
