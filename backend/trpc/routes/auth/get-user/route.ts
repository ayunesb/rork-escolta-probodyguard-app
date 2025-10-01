import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";

export default publicProcedure.query(async ({ ctx }) => {
  try {
    const authHeader = ctx.req.headers.get('authorization');
    
    if (!authHeader) {
      return { user: null };
    }

    console.log('[Auth] Get user request');

    return {
      user: null,
    };
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user',
    });
  }
});
