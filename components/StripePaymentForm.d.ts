import { ComponentType } from 'react';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string, paymentMethodId?: string) => void;
  onError: (error: string) => void;
}

declare const StripePaymentForm: ComponentType<StripePaymentFormProps>;
export default StripePaymentForm;
