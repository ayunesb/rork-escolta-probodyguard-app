import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().min(1),
      role: z.enum(['client', 'guard', 'company', 'admin']),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password, firstName, lastName, phone, role } = input;

    try {
      console.log('[Auth] Sign up attempt:', email, role);

      return {
        success: true,
        message: 'Sign up successful',
      };
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Failed to create account',
      });
    }
  });
