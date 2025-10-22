# Phase 5: Visual Testing Guide

**A visual representation of the testing process**

---

## 🗺️ Testing Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 5 TESTING JOURNEY                  │
└─────────────────────────────────────────────────────────────┘

START HERE
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  📋 STEP 1: PRE-TEST CHECKLIST (30 min)                    │
│  ─────────────────────────────────────────────────────────  │
│  ✅ Verify Firebase setup                                   │
│  ✅ Verify Braintree setup                                  │
│  ✅ Create demo accounts                                    │
│  ✅ Install dependencies                                    │
│  ✅ Launch app successfully                                 │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  👤 STEP 2: CLIENT TESTING (3 hours)                       │
│  ─────────────────────────────────────────────────────────  │
│  📍 Task 5.1.1: Scheduled Cross-City Job                   │
│     ├─ Sign up & verify email                              │
│     ├─ Upload KYC documents                                │
│     ├─ Browse & filter guards                              │
│     ├─ Build quote                                         │
│     ├─ Pay with new card                                   │
│     ├─ Wait for T-10                                       │
│     ├─ Enter start code                                    │
│     ├─ Track service                                       │
│     ├─ Extend service                                      │
│     ├─ Complete & rate                                     │
│     └─ View billing                                        │
│                                                             │
│  ⚡ Task 5.1.2: Instant Job                                │
│     ├─ Book instant job                                    │
│     ├─ Pay with saved card                                 │
│     ├─ Enter start code                                    │
│     └─ Complete & rate                                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  🛡️ STEP 3: GUARD TESTING (3 hours)                        │
│  ─────────────────────────────────────────────────────────  │
│  💼 Task 5.2.1: Freelance Guard                            │
│     ├─ Sign up as guard                                    │
│     ├─ Upload all documents                                │
│     ├─ Set availability & rate                             │
│     ├─ View pending jobs                                   │
│     ├─ Accept job                                          │
│     ├─ Show start code                                     │
│     ├─ Track location                                      │
│     ├─ Chat with client                                    │
│     ├─ Complete job                                        │
│     └─ View payout                                         │
│                                                             │
│  🏢 Task 5.2.2: Company Guard                              │
│     ├─ Company assigns job                                 │
│     ├─ Guard accepts                                       │
│     ├─ Complete flow                                       │
│     └─ Verify payout method                                │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  🏢 STEP 4: COMPANY TESTING (2 hours)                      │
│  ─────────────────────────────────────────────────────────  │
│  Task 5.3: Company Flow                                    │
│     ├─ Sign in as company                                  │
│     ├─ Import CSV roster                                   │
│     ├─ Approve guard docs                                  │
│     ├─ Assign guard to booking                             │
│     ├─ Test reassignment                                   │
│     ├─ View payments                                       │
│     ├─ Toggle payout method                                │
│     └─ Verify isolation                                    │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  👨‍💼 STEP 5: ADMIN TESTING (2 hours)                        │
│  ─────────────────────────────────────────────────────────  │
│  Task 5.4: Admin Flow                                      │
│     ├─ Approve client KYC                                  │
│     ├─ Approve guard KYC                                   │
│     ├─ Approve company KYC                                 │
│     ├─ Freeze/unfreeze user                                │
│     ├─ Issue full refund                                   │
│     ├─ Issue partial refund                                │
│     ├─ View full ledger                                    │
│     ├─ Export CSV                                          │
│     ├─ Test PANIC alert                                    │
│     └─ Resolve with notes                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ STEP 6: NEGATIVE TESTING (2 hours)                     │
│  ─────────────────────────────────────────────────────────  │
│  Task 5.5: Error Handling                                  │
│     ├─ Wrong start code (rate limit)                       │
│     ├─ Payment decline → recovery                          │
│     ├─ 3DS required → complete                             │
│     ├─ Permissions denied → guidance                       │
│     ├─ Poor connectivity → queuing                         │
│     ├─ Time zone skew → T-10 correct                       │
│     ├─ Duplicate payments → idempotency                    │
│     ├─ Extend beyond 8h → error                            │
│     └─ Cancel completed → error                            │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  ✅ STEP 7: COMPLETION (30 min)                            │
│  ─────────────────────────────────────────────────────────  │
│  ✅ Review all test results                                 │
│  ✅ Verify all bugs fixed                                   │
│  ✅ Update documentation                                    │
│  ✅ Obtain sign-off                                         │
│  ✅ Prepare for production                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
🎉 PHASE 5 COMPLETE! 🎉
```

---

## 📊 Client Flow Diagram

```
CLIENT SCHEDULED BOOKING FLOW
═══════════════════════════════════════════════════════════════

┌──────────┐
│  Sign Up │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Verify Email │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│  Upload KYC  │
└────┬─────────┘
     │
     ▼
┌──────────────────┐
│ Wait for Approval│ ◄─── Admin approves
└────┬─────────────┘
     │
     ▼
┌──────────────┐
│ Browse Guards│
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Select Guard │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│  Build Quote │
│  - Protection│
│  - Vehicle   │
│  - Duration  │
│  - Location  │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Pay with Card│
└────┬─────────┘
     │
     ▼
┌──────────────────┐
│ Booking Created  │
│ Status: Pending  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Guard Accepts    │ ◄─── Guard accepts job
│ Status: Accepted │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Wait for T-10    │
│ NO MAP SHOWN     │
│ ETA Countdown    │
└────┬─────────────┘
     │
     ▼ (T-10 minutes)
┌──────────────────┐
│ MAP APPEARS      │
│ Guard Location   │
│ Real-time Track  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Guard Arrives    │
│ Shows Start Code │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Enter Start Code │
│ Validate Code    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Service Active   │
│ Tracking ON      │
│ Timer Running    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Service Complete │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Rate Guard       │
│ Write Review     │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ View Receipt     │
│ MXN Total Only   │
└──────────────────┘
```

---

## 🛡️ Guard Flow Diagram

```
GUARD FREELANCE FLOW
═══════════════════════════════════════════════════════════════

┌──────────┐
│  Sign Up │
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ Upload Documents │
│ - ID             │
│ - Licenses       │
│ - Outfits (3)    │
│ - Vehicle        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Wait for Approval│ ◄─── Admin approves
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Set Availability │
│ Set Hourly Rate  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ View Pending Jobs│
│ Real-time Updates│
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Select Job       │
│ Review Details   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Accept Job       │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Navigate to      │
│ Pickup Location  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Show Start Code  │
│ to Client        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Client Enters    │
│ Start Code       │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Service Active   │
│ Location Tracked │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Chat with Client │
│ Auto-translation │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Complete Service │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Receive Rating   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ View Payout      │
│ Net MXN Only     │
└──────────────────┘
```

---

## 💳 Payment Flow Diagram

```
PAYMENT PROCESSING FLOW
═══════════════════════════════════════════════════════════════

┌──────────────────┐
│ Create Booking   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Payment Sheet    │
│ Opens            │
└────┬─────────────┘
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│ New Card │    │Saved Card│    │  Cancel  │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│Enter Card│    │Select Card│   │  Close   │
│Details   │    │          │    │  Sheet   │
└────┬─────┘    └────┬─────┘    └──────────┘
     │               │
     └───────┬───────┘
             │
             ▼
     ┌──────────────┐
     │ Process      │
     │ Payment      │
     └───┬──────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ Success │      │3DS Req'd│      │ Decline │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                │
         │                ▼                ▼
         │           ┌─────────┐      ┌─────────┐
         │           │Complete │      │  Retry  │
         │           │3DS Auth │      │ Payment │
         │           └────┬────┘      └────┬────┘
         │                │                │
         └────────┬───────┘                │
                  │                        │
                  ▼                        │
         ┌──────────────┐                 │
         │ Booking      │                 │
         │ Confirmed    │                 │
         └──────────────┘                 │
                                          │
                  ┌───────────────────────┘
                  │
                  ▼
         ┌──────────────┐
         │ Show Error   │
         │ Allow Retry  │
         └──────────────┘
```

---

## 🗺️ T-10 Tracking Rule Diagram

```
T-10 TRACKING RULE VISUALIZATION
═══════════════════════════════════════════════════════════════

SCHEDULED BOOKING (Tomorrow at 10:00 AM)
─────────────────────────────────────────────────────────────

Timeline:
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Booking Created                                            │
│  Status: Pending                                            │
│  ❌ NO MAP                                                  │
│  ⏰ Shows: "Guard trackable at 9:50 AM"                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Guard Accepts                                              │
│  Status: Accepted                                           │
│  ❌ NO MAP                                                  │
│  ⏰ Shows: "Guard trackable at 9:50 AM"                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  T-10 Minutes (9:50 AM)                                     │
│  Status: Accepted                                           │
│  ✅ MAP APPEARS                                             │
│  📍 Guard location visible                                  │
│  🗺️ Real-time tracking active                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Start Code Entered (10:00 AM)                              │
│  Status: Active                                             │
│  ✅ MAP CONTINUES                                           │
│  📍 Guard location tracked                                  │
│  ⏱️ Service timer running                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘


INSTANT BOOKING
─────────────────────────────────────────────────────────────

Timeline:
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Booking Created                                            │
│  Status: Pending                                            │
│  ❌ NO MAP                                                  │
│  ⏰ Shows: "Waiting for guard"                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Guard Accepts                                              │
│  Status: Accepted                                           │
│  ❌ NO MAP                                                  │
│  ⏰ Shows: "Guard on the way"                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Start Code Entered                                         │
│  Status: Active                                             │
│  ✅ MAP APPEARS                                             │
│  📍 Guard location visible                                  │
│  ⏱️ Service timer running                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Testing Priority Matrix

```
PRIORITY MATRIX
═══════════════════════════════════════════════════════════════

High Priority + High Impact (DO FIRST)
┌─────────────────────────────────────────────────────────────┐
│ • Payment processing                                        │
│ • Start code validation                                     │
│ • T-10 tracking rule                                        │
│ • Location tracking                                         │
│ • KYC approval flow                                         │
└─────────────────────────────────────────────────────────────┘

High Priority + Medium Impact (DO SECOND)
┌─────────────────────────────────────────────────────────────┐
│ • Guard matching                                            │
│ • Chat functionality                                        │
│ • Booking creation                                          │
│ • Rating system                                             │
│ • Refund processing                                         │
└─────────────────────────────────────────────────────────────┘

Medium Priority + High Impact (DO THIRD)
┌─────────────────────────────────────────────────────────────┐
│ • Company roster management                                 │
│ • Admin analytics                                           │
│ • PANIC button                                              │
│ • Service extension                                         │
│ • Multi-stop routing                                        │
└─────────────────────────────────────────────────────────────┘

Low Priority + Low Impact (DO LAST)
┌─────────────────────────────────────────────────────────────┐
│ • UI polish                                                 │
│ • Animation smoothness                                      │
│ • Minor text corrections                                    │
│ • Optional features                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Progress Visualization

```
TESTING PROGRESS TRACKER
═══════════════════════════════════════════════════════════════

Day 1 Progress
┌─────────────────────────────────────────────────────────────┐
│ Morning (3h)                                                │
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 50%   │
│ ✅ Pre-test checklist                                       │
│ ✅ Task 5.1.1 (Scheduled job)                               │
│ ⏳ Task 5.1.2 (Instant job)                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Afternoon (3h)                                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│ ⏳ Task 5.2.1 (Freelance guard)                             │
│ ⏳ Task 5.2.2 (Company guard)                               │
└─────────────────────────────────────────────────────────────┘

Day 2 Progress
┌─────────────────────────────────────────────────────────────┐
│ Morning (3h)                                                │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│ ⏳ Task 5.3 (Company flow)                                  │
│ ⏳ Task 5.4 (Admin flow)                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Afternoon (3h)                                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│ ⏳ Task 5.5 (Negative testing)                              │
│ ⏳ Bug fixes & wrap-up                                      │
└─────────────────────────────────────────────────────────────┘

Overall Progress: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 12%
```

---

## 🎨 User Role Visualization

```
USER ROLES & PERMISSIONS
═══════════════════════════════════════════════════════════════

┌─────────────┐
│   CLIENT    │
└──────┬──────┘
       │
       ├─ Browse guards
       ├─ Create bookings
       ├─ Make payments
       ├─ Track service
       ├─ Chat with guard
       ├─ Rate guards
       └─ View billing

┌─────────────┐
│    GUARD    │
└──────┬──────┘
       │
       ├─ View pending jobs
       ├─ Accept/reject jobs
       ├─ Show start code
       ├─ Track location
       ├─ Chat with client
       ├─ Complete service
       └─ View payouts

┌─────────────┐
│   COMPANY   │
└──────┬──────┘
       │
       ├─ Manage roster
       ├─ Import guards (CSV)
       ├─ Assign jobs
       ├─ Approve documents
       ├─ View payments
       ├─ Toggle payout method
       └─ View analytics

┌─────────────┐
│    ADMIN    │
└──────┬──────┘
       │
       ├─ Approve KYC (all roles)
       ├─ Freeze/unfreeze users
       ├─ Issue refunds
       ├─ View full ledger
       ├─ Export reports
       ├─ Handle PANIC alerts
       └─ Platform analytics
```

---

**This visual guide complements the detailed testing plan.**
**Use it for quick reference and understanding the big picture!**
