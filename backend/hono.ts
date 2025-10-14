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

app.use("*", async (c: any, next: any) => {
  const url = new URL(c.req.url);
  console.log(`[Backend] ${c.req.method} ${url.pathname}`);
  try {
    await next();
    console.log(`[Backend] Response status: ${c.res.status}`);
  } catch (error) {
    console.error('[Backend] Error:', error);
    throw error;
  }
});

app.get('/api/health', (c: any) => {
  console.log('[Backend] Health check called');
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend is running'
  });
});

app.get('/api/test', (c: any) => {
  console.log('[Backend] Test endpoint called');
  return c.json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  })
);

app.notFound((c: any) => {
  console.log('[Backend] Route not found:', c.req.url);
  return c.json({ error: 'Not found' }, 404);
});

export default app;
