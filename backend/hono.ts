import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";


const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use("*", async (c, next) => {
  console.log(`[Backend] ${c.req.method} ${c.req.url}`);
  try {
    await next();
  } catch (error) {
    console.error('[Backend] Error:', error);
    throw error;
  }
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

app.notFound((c) => {
  console.log('[Backend] Route not found:', c.req.url);
  return c.json({ error: 'Not found' }, 404);
});

export default app;
