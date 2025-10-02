import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../create-context';

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  const token = authHeader.substring(7);

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }

  let userId: string;
  
  try {
    const decodedToken = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    userId = decodedToken.user_id || decodedToken.sub;
    
    if (!userId) {
      throw new Error('No user ID in token');
    }
  } catch (error) {
    console.error('[Auth] Token decode error:', error);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token format',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId,
      token,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
    },
  });
});
