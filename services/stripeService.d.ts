export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

export declare const createPaymentIntent: (
  bookingId: string,
  amount: number
) => Promise<PaymentIntent>;

export declare const confirmPayment: (
  clientSecret: string
) => Promise<PaymentResult>;

export declare const refundPayment: (
  paymentIntentId: string,
  amount?: number
) => Promise<{ success: boolean; error?: string }>;
