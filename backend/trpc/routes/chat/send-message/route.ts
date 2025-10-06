import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { checkRateLimit } from "@/backend/middleware/rateLimitMiddleware";

const sendMessageSchema = z.object({
  bookingId: z.string(),
  senderId: z.string(),
  senderRole: z.enum(['client', 'guard', 'company', 'admin']),
  text: z.string(),
  originalLanguage: z.enum(['en', 'es', 'fr', 'de']),
});

type SendMessageInput = z.infer<typeof sendMessageSchema>;

export default publicProcedure
  .input(sendMessageSchema)
  .mutation(async ({ input }: { input: SendMessageInput }) => {
    try {
      console.log('[Chat] Send message:', input);

      const rateLimit = await checkRateLimit('chat', `${input.senderId}_${input.bookingId}`);
      if (!rateLimit.allowed) {
        console.log('[Chat] Rate limit exceeded for:', input.senderId);
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: rateLimit.error || 'Too many messages. Please slow down.',
        });
      }

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
