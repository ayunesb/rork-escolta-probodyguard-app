import React from 'react';

export const useStripeInit = () => {
  console.log('[Stripe] Web initialization - using web fallback');
};

export function StripeWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
