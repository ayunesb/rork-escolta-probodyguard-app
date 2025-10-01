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

  return next({
    ctx: {
      ...ctx,
      userId: 'user-id-from-token',
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
