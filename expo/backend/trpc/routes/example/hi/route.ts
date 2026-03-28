import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .query(() => {
    return {
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      status: 'healthy',
    };
  });
