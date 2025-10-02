import React from 'react';

export const useStripeInit = () => {
  console.log('[Stripe] Web initialization - using web fallback');
};

export const StripeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
