import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Dynamic import for superjson to avoid ESM/CommonJS interop issues in mixed module environments
let transformer: any = undefined;
(async () => {
  try {
    const mod = await import('superjson');
    transformer = mod.default || mod;
  } catch (e) {
    console.warn('[trpc] superjson dynamic import failed, proceeding without transformer', e);
    transformer = undefined;
  }
})();

const t = initTRPC.context<Context>().create({
  transformer: transformer,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
