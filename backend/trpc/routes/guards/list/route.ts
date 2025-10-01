import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().default(50),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('[Guards] List nearby guards:', input);

      return {
        guards: [],
      };
    } catch (error) {
      console.error('[Guards] List error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list guards',
      });
    }
  });
