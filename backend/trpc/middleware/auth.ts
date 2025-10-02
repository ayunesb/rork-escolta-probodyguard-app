import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../create-context';

function decodeJWT(token: string): { sub?: string; user_id?: string; [key: string]: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {};
    }
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('[Auth] Failed to decode JWT:', error);
    return {};
  }
}

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

  const decoded = decodeJWT(token);
  const userId = decoded.sub || decoded.user_id;

  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token: no user ID',
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
