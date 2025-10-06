declare module 'braintree' {
  export interface BraintreeGatewayConfig {
    environment: any;
    merchantId: string;
    publicKey: string;
    privateKey: string;
  }

  export interface TransactionRequest {
    amount: string;
    paymentMethodNonce: string;
    options?: {
      submitForSettlement?: boolean;
      storeInVaultOnSuccess?: boolean;
    };
    merchantAccountId?: string;
  }

  export interface Transaction {
    id: string;
  }

  export interface TransactionResult {
    success: boolean;
    transaction?: Transaction;
    message?: string;
  }

  export interface CreditCard {
    token: string;
    last4: string;
    cardType: string;
    expirationMonth: string;
    expirationYear: string;
  }

  export interface PayPalAccount {
    token: string;
    last4?: string;
    cardType?: string;
    expirationMonth?: string;
    expirationYear?: string;
  }

  export interface Customer {
    paymentMethods?: (CreditCard | PayPalAccount)[];
  }

  export interface WebhookNotification {
    kind: string;
  }

  export class BraintreeGateway {
    constructor(config: BraintreeGatewayConfig);
    clientToken: {
      generate(options: { customerId?: string }): Promise<{ clientToken: string }>;
    };
    transaction: {
      sale(request: TransactionRequest): Promise<TransactionResult>;
      refund(transactionId: string, amount?: string): Promise<TransactionResult>;
    };
    customer: {
      find(customerId: string): Promise<Customer>;
    };
    paymentMethod: {
      delete(token: string): Promise<void>;
    };
    webhookNotification: {
      parse(signature: string, payload: string): Promise<WebhookNotification>;
    };
  }

  export const Environment: {
    Sandbox: any;
    Production: any;
  };
}
