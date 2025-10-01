import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      bookingId: z.string(),
      senderId: z.string(),
      senderRole: z.enum(['client', 'guard', 'company', 'admin']),
      text: z.string(),
      originalLanguage: z.enum(['en', 'es', 'fr', 'de']),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('[Chat] Send message:', input);

      const message = {
        id: 'msg-' + Date.now(),
        ...input,
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('[Chat] Send message error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send message',
      });
    }
  });
