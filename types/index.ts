export type UserRole = 'client' | 'guard' | 'company' | 'admin';

export type Language = 'en' | 'es' | 'fr' | 'de';

export type BookingStatus = 
  | 'quote' 
  | 'confirmed' 
  | 'assigned' 
  | 'accepted' 
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

export interface Booking {
  id: string;
  clientId: string;
  guardId?: string;
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
  startCode: string;
  totalAmount: number;
  processingFee: number;
  platformCut: number;
  guardPayout: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  rating?: number;
  ratingBreakdown?: RatingBreakdown;
  review?: string;
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
  status: 'pending' | 'completed' | 'refunded';
  braintreeTransactionId: string;
  createdAt: string;
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
