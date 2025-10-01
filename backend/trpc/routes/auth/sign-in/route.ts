import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password } = input;

    try {
      console.log('[Auth] Sign in attempt:', email);

      return {
        success: true,
        message: 'Sign in successful',
      };
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }
  });
