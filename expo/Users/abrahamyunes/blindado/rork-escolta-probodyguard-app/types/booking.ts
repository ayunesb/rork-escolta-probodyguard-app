export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'accepted'
  | 'assigned'
  | 'en_route'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type BookingType = 'instant' | 'scheduled';

export interface Booking {
  id: string;
  clientId: string;
  guardId?: string;
  companyId?: string;
  status: BookingStatus;
  type: BookingType;
  startTime: string;
  endTime?: string;
  duration: number;
  crossCity: boolean;
  startCodeVerified: boolean;
  startCode: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  services: {
    vehicle: boolean;
    armed: boolean;
    armored: boolean;
    dressCode?: 'casual' | 'formal' | 'tactical';
  };
  pricing: {
    baseRate: number;
    vehicleRate?: number;
    armedRate?: number;
    armoredRate?: number;
    total: number;
    currency: 'MXN';
  };
  createdAt: string;
  updatedAt: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}
