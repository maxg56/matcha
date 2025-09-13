import { createContext, useContext, type ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, stripeConfig } from '../lib/stripe';

interface StripeProviderProps {
  children: ReactNode;
}

interface StripeContextType {
  // Add any context-specific values here if needed
}

const StripeContext = createContext<StripeContextType>({});

// eslint-disable-next-line react-refresh/only-export-components
export const useStripe = () => {
  return useContext(StripeContext);
};

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise} options={stripeConfig}>
      <StripeContext.Provider value={{}}>
        {children}
      </StripeContext.Provider>
    </Elements>
  );
}