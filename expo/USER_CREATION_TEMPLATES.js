/**
 * Manual User Creation Guide
 * 
 * Since the users collection is now empty, follow these steps to create all 6 demo users:
 */

// STEP 1: Get UIDs from Firebase Auth Console
// Go to: https://console.firebase.google.com/project/escolta-pro-fe90e/authentication/users
// Copy the UID for each user:

const userUIDs = {
  'client@demo.com': 'qlDzWsluu1c9JOfmgUTV5amzaZu2',
  'bodyguard@demo.com': 'PASTE_UID_HERE',
  'company@demo.com': 'PASTE_UID_HERE',
  'admin@demo.com': 'PASTE_UID_HERE',
  'guard1@demo.com': 'PASTE_UID_HERE',
  'guard2@demo.com': 'PASTE_UID_HERE'
};

// STEP 2: In Firebase Console -> Firestore -> users collection
// Click "Add document" for each user with these exact fields:

const userTemplates = {
  client: {
    email: 'client@demo.com',
    role: 'client',
    firstName: 'Demo',
    lastName: 'Client',
    phone: '+1234567890',
    language: 'en',
    kycStatus: 'approved',
    createdAt: '2025-10-21T12:00:00.000Z',
    isActive: true,
    emailVerified: true,
    updatedAt: '2025-10-21T12:00:00.000Z'
  },
  bodyguard: {
    email: 'bodyguard@demo.com',
    role: 'bodyguard',
    firstName: 'Demo',
    lastName: 'Guard',
    phone: '+1234567891',
    language: 'en',
    kycStatus: 'approved',
    createdAt: '2025-10-21T12:00:00.000Z',
    isActive: true,
    emailVerified: true,
    updatedAt: '2025-10-21T12:00:00.000Z'
  },
  company: {
    email: 'company@demo.com',
    role: 'company',
    firstName: 'Demo',
    lastName: 'Company',
    phone: '+1234567892',
    language: 'en',
    kycStatus: 'approved',
    createdAt: '2025-10-21T12:00:00.000Z',
    isActive: true,
    emailVerified: true,
    updatedAt: '2025-10-21T12:00:00.000Z'
  },
  admin: {
    email: 'admin@demo.com',
    role: 'admin',
    firstName: 'Demo',
    lastName: 'Admin',
    phone: '+1234567893',
    language: 'en',
    kycStatus: 'approved',
    createdAt: '2025-10-21T12:00:00.000Z',
    isActive: true,
    emailVerified: true,
    updatedAt: '2025-10-21T12:00:00.000Z'
  },
  guard1: {
    email: 'guard1@demo.com',
    role: 'bodyguard',
    firstName: 'Guard',
    lastName: 'One',
    phone: '+1234567894',
    language: 'en',
    kycStatus: 'approved',
    createdAt: '2025-10-21T12:00:00.000Z',
    isActive: true,
    emailVerified: true,
    updatedAt: '2025-10-21T12:00:00.000Z'
  },
  guard2: {
    email: 'guard2@demo.com',
    role: 'bodyguard',
    firstName: 'Guard',
    lastName: 'Two',
    phone: '+1234567895',
    language: 'en',
    kycStatus: 'approved',
    createdAt: '2025-10-21T12:00:00.000Z',
    isActive: true,
    emailVerified: true,
    updatedAt: '2025-10-21T12:00:00.000Z'
  }
};

console.log('Copy the templates above and paste into Firebase Console');
