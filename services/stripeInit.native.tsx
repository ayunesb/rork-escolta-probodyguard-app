import React, { useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const useStripeInit = () => {
  useEffect(() => {
    console.log('[Stripe] Native initialization - handled by Expo plugin');
  }, []);
};

export const StripeWrapper = ({ children }: { children: React.ReactNode }) => {
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock';

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.app.rork.escolta-pro"
    >
      {children as any}
    </StripeProvider>
  );
};
