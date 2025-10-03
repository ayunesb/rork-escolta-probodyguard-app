export interface BraintreePaymentFormProps {
  amount: number;
  currency?: string;
  customerId?: string;
  bookingId?: string;
  description?: string;
  onSuccess: (result: { id: string; status: string }) => void;
  onError: (error: Error) => void;
}

export function BraintreePaymentForm(props: BraintreePaymentFormProps): JSX.Element;
