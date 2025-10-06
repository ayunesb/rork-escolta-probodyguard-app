export type UserRole = 'client' | 'guard' | 'company' | 'admin';

export type Language = 'en' | 'es' | 'fr' | 'de';

export type BookingStatus = 
  | 'pending'
  | 'accepted' 
  | 'rejected'
  | 'en_route' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export type VehicleType = 'standard' | 'armored';
export type ProtectionType = 'armed' | 'unarmed';
export type DressCode = 'suit' | 'business_casual' | 'tactical' | 'casual';

export type KYCStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  language: Language;
  kycStatus: KYCStatus;
  braintreeCustomerId?: string;
  savedPaymentMethods?: SavedPaymentMethod[];
  createdAt: string;
}

export interface Client extends User {
  role: 'client';
  governmentIdUrl?: string;
}

export interface Guard extends User {
  role: 'guard';
  bio: string;
  height: number;
  weight: number;
  languages: Language[];
  hourlyRate: number;
  photos: string[];
  outfitPhotos: string[];
  licenseUrls: string[];
  vehicleDocUrls: string[];
  insuranceUrls: string[];
  certifications: string[];
  rating: number;
  ratingBreakdown?: RatingBreakdown;
  completedJobs: number;
  isFreelancer: boolean;
  companyId?: string;
  availability: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Company extends User {
  role: 'company';
  companyName: string;
  businessLicenseUrl?: string;
  guards: string[];
  handlesPayouts: boolean;
}

export interface Admin extends User {
  role: 'admin';
}

export interface RatingBreakdown {
  professionalism: number;
  punctuality: number;
  communication: number;
  languageClarity: number;
}

export interface RouteStop {
  address: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface Booking {
  id: string;
  clientId: string;
  guardId?: string;
  companyId?: string;
  status: BookingStatus;
  vehicleType: VehicleType;
  protectionType: ProtectionType;
  dressCode: DressCode;
  numberOfProtectees: number;
  numberOfProtectors: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationAddress?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  routeStops?: RouteStop[];
  startCode: string;
  totalAmount: number;
  processingFee: number;
  platformCut: number;
  guardPayout: number;
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'client' | 'guard';
  cancellationReason?: string;
  rating?: number;
  ratingBreakdown?: RatingBreakdown;
  review?: string;
  clientRating?: number;
  clientReview?: string;
  extensionCount?: number;
  originalDuration?: number;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  originalLanguage: Language;
  translatedText?: string;
  translatedLanguage?: Language;
  timestamp: string;
}

export interface SavedPaymentMethod {
  token: string;
  last4: string;
  cardType: string;
  expirationMonth: string;
  expirationYear: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  clientId: string;
  guardId: string;
  amount: number;
  processingFee: number;
  platformCut: number;
  guardPayout: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  braintreeTransactionId: string;
  refundId?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  guardId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bookingIds: string[];
  braintreePayoutId?: string;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface LedgerEntry {
  id: string;
  guardId: string;
  bookingId: string;
  type: 'earning' | 'payout' | 'adjustment';
  amount: number;
  description: string;
  createdAt: string;
}

export interface GuardBalance {
  guardId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  lastPayoutAt?: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'payout';
  amount: number;
  currency: 'MXN';
  status: 'pending' | 'completed' | 'failed';
  userId: string;
  bookingId?: string;
  paymentId?: string;
  payoutId?: string;
  braintreeId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface Document {
  id: string;
  userId: string;
  type: 'government_id' | 'license' | 'vehicle_doc' | 'insurance' | 'business_license';
  url: string;
  status: KYCStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
