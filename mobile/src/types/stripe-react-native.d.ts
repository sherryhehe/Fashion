declare module '@stripe/stripe-react-native' {
  import type { ReactNode } from 'react';

  export interface StripeProviderProps {
    publishableKey: string;
    urlScheme?: string;
    merchantIdentifier?: string;
    children: ReactNode;
  }

  export const StripeProvider: (props: StripeProviderProps) => JSX.Element;

  export function usePaymentSheet(): {
    initPaymentSheet: (params: {
      paymentIntentClientSecret: string;
      merchantDisplayName: string;
    }) => Promise<{ error?: { message: string } }>;
    presentPaymentSheet: () => Promise<{ error?: { message: string } }>;
  };
}
