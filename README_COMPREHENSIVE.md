# 🛡️ Escolta Pro - On-Demand Security & Bodyguard App

A comprehensive mobile platform for on-demand security services and bodyguard booking built with React Native and Firebase.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+ ([install with nvm](https://github.com/nvm-sh/nvm))
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Expo CLI** (`npm install -g @expo/cli`)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd rork-escolta-probodyguard-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Braintree credentials
   ```

4. **Start development server**
   ```bash
   # Web preview with hot reload
   npm run start-web
   
   # Mobile development
   npm start
   # Then press 'i' for iOS simulator or 'a' for Android
   ```

## 🏗️ Architecture

### Frontend
- **Framework**: React Native + Expo Router
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + tRPC React Query
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Maps**: React Native Maps
- **Payments**: Braintree Drop-in UI

### Backend
- **Functions**: Firebase Cloud Functions + Express
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth
- **Payments**: Braintree Payments API
- **Real-time**: Firebase Realtime Database (chat, tracking)
- **Storage**: Firebase Cloud Storage

## 🔧 Development

### Run Tests
```bash
# Main project tests
npm test

# Functions tests
cd functions && npm test

# Integration tests (requires emulator)
npm run test:integration
```

### Linting & Formatting
```bash
# Run ESLint
npm run lint

# Format with Prettier
npx prettier --write .

# Type check
npx tsc --noEmit
```

### Firebase Emulators
```bash
# Start all emulators
firebase emulators:start

# Functions only
cd functions && npm run serve
```

## 📱 Features

### 🔐 Authentication & User Management
- Email/password authentication
- Multi-role support (Client, Guard, Company Admin, Super Admin)
- KYC verification process
- Profile management

### 👨‍💼 Guard & Company Management
- Guard roster management
- CSV import for bulk guard creation
- Company isolation and multi-tenancy
- Guard availability tracking

### 📅 Booking System
- Real-time booking creation
- Guard assignment and reassignment
- Service type selection (armed/unarmed)
- Duration and location management
- Status tracking

### 💳 Payment Processing
- Braintree integration with 3DS2
- Saved payment methods (card vaulting)
- MXN currency support
- Platform fee calculation (15%)
- Guard payout system (70%)

### 💬 Real-time Communication
- In-app chat system
- Real-time messaging
- Typing indicators
- Message history

### 📍 Location & Tracking
- Real-time location tracking
- Route optimization
- Emergency features
- Geofencing

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/trpc/auth.signIn`
Sign in a user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "role": "client"
  },
  "token": "firebase_id_token"
}
```

#### POST `/api/trpc/auth.signUp`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "client"
}
```

### Payment Endpoints

#### GET `/api/payments/client-token`
Generate Braintree client token for payment initialization.

**Query Parameters:**
- `userId` (optional): User ID for customer-specific token

**Response:**
```json
{
  "clientToken": "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQi..."
}
```

#### POST `/api/payments/methods/:userId`
Create (vault) a payment method for a user.

**Request:**
```json
{
  "payment_method_nonce": "fake-valid-nonce",
  "cardholder_name": "John Doe",
  "make_default": true,
  "verify_card": true
}
```

**Response:**
```json
{
  "success": true,
  "token": "payment_method_token_123",
  "type": "CreditCard"
}
```

#### GET `/api/payments/methods/:userId`
List all saved payment methods for a user.

**Response:**
```json
{
  "success": true,
  "paymentMethods": [
    {
      "token": "pm_token_123",
      "type": "CreditCard",
      "cardType": "Visa",
      "maskedNumber": "****1234",
      "default": true
    }
  ]
}
```

#### DELETE `/api/payments/methods/:userId/:token`
Remove a saved payment method.

**Response:**
```json
{
  "success": true
}
```

### Booking Endpoints

#### POST `/api/trpc/bookings.create`
Create a new booking.

**Request:**
```json
{
  "guardId": "guard123",
  "clientId": "client123",
  "scheduledDateTime": "2024-01-15T14:30:00Z",
  "duration": 120,
  "location": {
    "address": "123 Main St",
    "latitude": 19.4326,
    "longitude": -99.1332
  },
  "serviceType": "armed",
  "hourlyRate": 500
}
```

## 🚀 Deployment

### Firebase Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Mobile App Build
```bash
# Development build
eas build --profile development

# Production build
eas build --profile production

# Submit to app stores
eas submit --platform all
```

### Environment Variables

#### Required for Backend (.env)
```bash
# Braintree Configuration
BRAINTREE_ENV=sandbox # or production
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config

# API Configuration
EXPO_PUBLIC_API_URL=https://your-functions-url.cloudfunctions.net
```

## 🔒 Security

### Authentication
- Firebase Authentication with email verification
- Role-based access control (RBAC)
- JWT token validation

### Payment Security
- PCI-compliant Braintree integration
- 3DS2 authentication for enhanced security
- No raw card data stored in app

### Data Security
- Firestore security rules enforced
- Company data isolation
- Encrypted data transmission

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/          # Component tests
├── services/           # Service tests
├── utils/              # Utility tests
└── integration/        # Integration tests

functions/__tests__/
├── payment-method.test.ts      # Unit tests
└── payment-method.integration.test.js  # Integration tests
```

### Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- BraintreePaymentForm

# Run functions tests
cd functions && npm test
```

## 📊 Monitoring & Analytics

### Error Tracking
- Firebase Crashlytics integration
- Custom error boundaries
- Structured error logging

### Performance
- Firebase Performance Monitoring
- Real User Monitoring (RUM)
- API response time tracking

### Analytics
- Firebase Analytics events
- User journey tracking
- Payment funnel analysis

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style
- ESLint configuration enforced
- Prettier formatting required
- TypeScript strict mode enabled
- 18 warnings max in linting

## 📞 Support

For technical support or questions:
- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Email**: dev@escoltapro.com

---

**Built with ❤️ using React Native, Firebase, and Braintree**