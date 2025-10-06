# T-10 Tracking Rule Implementation

## Overview
The T-10 tracking rule is a critical privacy and security feature that controls when clients can see guard locations during a booking.

## Rule Definition

### For Scheduled & Cross-City Bookings
- **Before T-10**: Guard location is **HIDDEN**
- **Within T-10** (10 minutes before scheduled time): Guard location is **VISIBLE**
- **After Service Starts**: Guard location is **VISIBLE**

### For Instant Bookings
- **Before Start Code Entry**: Guard location is **HIDDEN**
- **After Start Code Entry** (service active): Guard location is **VISIBLE**

## Booking Types

### 1. Instant Booking
- Scheduled within 30 minutes or less
- Guard location only visible after start code is entered
- Example: Client books now for immediate service

### 2. Scheduled Booking
- Scheduled more than 30 minutes in advance
- Same city pickup and destination
- T-10 rule applies: location visible 10 minutes before scheduled time
- Example: Client books for 2 hours from now

### 3. Cross-City Booking
- Different cities for pickup and destination
- T-10 rule applies: location visible 10 minutes before scheduled time
- Example: Client books from Mexico City to Guadalajara

## Implementation Details

### Backend Logic (`services/bookingService.ts`)

```typescript
function determineBookingType(
  scheduledDate: string,
  scheduledTime: string,
  pickupCity?: string,
  destinationCity?: string
): BookingType {
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  const now = new Date();
  const minutesUntilStart = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);
  
  // Cross-city takes precedence
  if (pickupCity && destinationCity && pickupCity.toLowerCase() !== destinationCity.toLowerCase()) {
    return 'cross-city';
  }
  
  // Instant if within 30 minutes
  if (minutesUntilStart <= 30) {
    return 'instant';
  }
  
  // Otherwise scheduled
  return 'scheduled';
}

function shouldShowGuardLocationByRule(booking: Booking): boolean {
  // Always show if service is active
  if (booking.status === 'active') {
    return true;
  }
  
  // Only show for accepted or en_route status
  if (booking.status !== 'accepted' && booking.status !== 'en_route') {
    return false;
  }
  
  const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
  const now = new Date();
  const minutesUntilStart = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);
  
  // Instant bookings: NEVER show location until active
  if (booking.bookingType === 'instant') {
    return false;
  }
  
  // Scheduled/Cross-city: Show only within T-10
  if (booking.bookingType === 'scheduled' || booking.bookingType === 'cross-city') {
    return minutesUntilStart <= 10;
  }
  
  return false;
}
```

### Frontend Logic (`app/tracking/[bookingId].tsx`)

The tracking screen uses the backend logic to determine visibility:

```typescript
const shouldShowGuardLocation = useMemo(() => {
  if (!booking) return false;
  return bookingService.shouldShowGuardLocation(booking);
}, [booking]);
```

User-friendly messages are displayed based on booking type and time:

```typescript
const trackingMessage = useMemo(() => {
  if (!booking) return null;
  
  if (booking.status === 'active') {
    return 'Service is active - Live tracking enabled';
  }
  
  if (booking.bookingType === 'instant') {
    return 'For instant bookings, guard location will be visible after you enter the start code';
  }
  
  if (minutesUntilStart !== null && minutesUntilStart > 10) {
    const minutesRounded = Math.ceil(minutesUntilStart);
    return `Guard location will be visible ${minutesRounded - 10} minutes before scheduled time (T-10 rule)`;
  }
  
  if (minutesUntilStart !== null && minutesUntilStart <= 10 && minutesUntilStart > 0) {
    return 'Guard is en route - Live tracking enabled';
  }
  
  return 'Waiting for service to begin';
}, [booking, minutesUntilStart]);
```

### Database Security Rules (`database.rules.json`)

Firebase Realtime Database rules enforce the T-10 rule at the database level:

```json
{
  "rules": {
    "guardLocations": {
      "$guardId": {
        ".read": "auth != null && (
          // User must be part of the booking
          root.child('bookings').child($bookingId).child('guardId').val() === $guardId && (
            root.child('bookings').child($bookingId).child('clientId').val() === auth.uid ||
            root.child('bookings').child($bookingId).child('guardId').val() === auth.uid
          ) && (
            // Either service is active
            root.child('bookings').child($bookingId).child('status').val() === 'active' ||
            (
              // Or it's accepted/en_route AND scheduled/cross-city AND within T-10
              (root.child('bookings').child($bookingId).child('status').val() === 'accepted' ||
               root.child('bookings').child($bookingId).child('status').val() === 'en_route') &&
              (
                root.child('bookings').child($bookingId).child('bookingType').val() === 'scheduled' ||
                root.child('bookings').child($bookingId).child('bookingType').val() === 'cross-city'
              ) &&
              now >= root.child('bookings').child($bookingId).child('scheduledDateTime').val() - 600000
            )
          )
        )"
      }
    }
  }
}
```

## Type Definitions (`types/index.ts`)

```typescript
export type BookingType = 'instant' | 'scheduled' | 'cross-city';

export interface Booking {
  // ... other fields
  bookingType: BookingType;
  pickupCity?: string;
  destinationCity?: string;
  // ... other fields
}
```

## Testing Scenarios

### Test Case 1: Instant Booking
1. Create booking for now or within 30 minutes
2. Verify `bookingType === 'instant'`
3. Before start code: Guard location should be **HIDDEN**
4. After start code: Guard location should be **VISIBLE**

### Test Case 2: Scheduled Booking (Same City)
1. Create booking for 2 hours from now in same city
2. Verify `bookingType === 'scheduled'`
3. At T-15 (15 minutes before): Guard location should be **HIDDEN**
4. At T-10 (10 minutes before): Guard location should be **VISIBLE**
5. After start: Guard location should be **VISIBLE**

### Test Case 3: Cross-City Booking
1. Create booking with different pickup and destination cities
2. Verify `bookingType === 'cross-city'`
3. At T-15: Guard location should be **HIDDEN**
4. At T-10: Guard location should be **VISIBLE**
5. After start: Guard location should be **VISIBLE**

### Test Case 4: Status Transitions
1. Booking status: `pending` → Guard location **HIDDEN**
2. Booking status: `confirmed` → Guard location **HIDDEN**
3. Booking status: `accepted` + within T-10 → Guard location **VISIBLE**
4. Booking status: `active` → Guard location **VISIBLE**

## Security Considerations

1. **Client-Side Validation**: The app validates visibility before rendering
2. **Server-Side Enforcement**: Firebase rules prevent unauthorized reads
3. **Time-Based Access**: Rules use server timestamp to prevent client clock manipulation
4. **Role-Based Access**: Only booking participants can access location data

## Privacy Benefits

1. **Guard Privacy**: Guards' locations are not exposed until necessary
2. **Client Trust**: Clients know exactly when tracking begins
3. **Predictable Behavior**: Clear rules prevent confusion
4. **Audit Trail**: All location access is logged and traceable

## Deployment Checklist

- [x] Update `types/index.ts` with `BookingType`
- [x] Implement `determineBookingType()` in `bookingService.ts`
- [x] Implement `shouldShowGuardLocationByRule()` in `bookingService.ts`
- [x] Update tracking screen with T-10 logic
- [x] Create Firebase Realtime Database rules
- [ ] Deploy database rules: `firebase deploy --only database`
- [ ] Test all three booking types
- [ ] Verify security rules in Firebase Console
- [ ] Monitor logs for unauthorized access attempts

## Monitoring

Monitor these metrics to ensure T-10 rule is working:

1. **Location Access Logs**: Track when clients access guard locations
2. **Rule Violations**: Alert on any unauthorized location reads
3. **Booking Type Distribution**: Track instant vs scheduled vs cross-city
4. **T-10 Timing**: Verify location visibility starts exactly at T-10

## Future Enhancements

1. **Configurable T-X**: Allow admins to adjust the 10-minute window
2. **Geofencing**: Hide location when guard is far from pickup
3. **Privacy Zones**: Allow guards to define areas where location is never shared
4. **Client Notifications**: Alert clients when tracking becomes available
