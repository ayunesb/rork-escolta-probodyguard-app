import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { mockGuards } from "@/mocks/guards";

export default publicProcedure
  .input(
    z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      radius: z.number().default(50),
    }).optional()
  )
  .query(async ({ input }) => {
    try {
      console.log('[Guards] List nearby guards:', input);

      return mockGuards.filter(g => g.availability);
    } catch (error) {
      console.error('[Guards] List error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list guards',
      });
    }
  });
