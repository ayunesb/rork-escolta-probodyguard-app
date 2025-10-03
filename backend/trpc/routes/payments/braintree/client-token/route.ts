import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/middleware/auth';
import { getBraintreeGateway } from '@/backend/lib/braintree';

export const braintreeClientTokenProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Braintree] Generating client token for customer:', input.customerId || 'new customer');

    try {
      const gateway = getBraintreeGateway();
      
      const requestParams: any = {};
      if (input.customerId) {
        requestParams.customerId = input.customerId;
      }

      const response = await gateway.clientToken.generate(requestParams);
      
      console.log('[Braintree] Client token generated successfully');
      
      return {
        clientToken: response.clientToken,
      };
    } catch (error: any) {
      console.error('[Braintree] Error generating client token:', error);
      throw new Error(`Failed to generate client token: ${error.message}`);
    }
  });
