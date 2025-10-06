// Stripe init removed
import { useEffect } from 'react';

export const useStripeInit = () => {
  useEffect(() => {
    console.log('[Stripe] Native initialization - handled by Expo plugin');
  }, []);
};
