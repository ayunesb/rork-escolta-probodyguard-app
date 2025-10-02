import { createTRPCReact, createTRPCProxyClient } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { auth } from "@/lib/firebase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('[tRPC] Using window origin:', origin);
    return origin;
  }

  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (process.env.EXPO_PUBLIC_TOOLKIT_URL) {
    return process.env.EXPO_PUBLIC_TOOLKIT_URL;
  }

  return "http://localhost:8081";
};

const getAuthHeaders = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (error) {
    console.error('[tRPC] Failed to get auth token:', error);
  }
  return {};
};

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const headers = await getAuthHeaders();
        console.log('[tRPC Client] Request to:', `${getBaseUrl()}/api/trpc`);
        console.log('[tRPC Client] Headers:', Object.keys(headers));
        return headers;
      },
      fetch(url, options) {
        console.log('[tRPC Client] Fetching:', url);
        return fetch(url, options).catch(error => {
          console.error('[tRPC Client] Fetch error:', error);
          throw error;
        });
      },
    }),
  ],
});

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        return await getAuthHeaders();
      },
    }),
  ],
});
