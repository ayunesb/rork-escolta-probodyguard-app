import { Platform } from 'react-native';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
  paymentMethodId?: string;
}

let stripeServiceImpl: {
  createPaymentIntent: (bookingId: string, amount: number, paymentMethodId?: string) => Promise<PaymentIntent>;
  confirmPayment: (clientSecret: string) => Promise<PaymentResult>;
  refundPayment: (paymentIntentId: string, amount?: number) => Promise<{ success: boolean; error?: string }>;
  savePaymentMethod: (paymentMethodId: string, setAsDefault: boolean) => Promise<{ success: boolean; error?: string }>;
};

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  stripeServiceImpl = require('./stripeService.web');
} else {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  stripeServiceImpl = require('./stripeService.native');
}

export const createPaymentIntent = stripeServiceImpl.createPaymentIntent;
export const confirmPayment = stripeServiceImpl.confirmPayment;
export const refundPayment = stripeServiceImpl.refundPayment;
export const savePaymentMethod = stripeServiceImpl.savePaymentMethod;
