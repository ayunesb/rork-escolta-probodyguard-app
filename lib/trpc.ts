import { createTRPCReact, createTRPCProxyClient } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { auth } from "@/lib/firebase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
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
        authorization: `Bearer ${token}`,
      };
    }
  } catch (error) {
    console.error('[tRPC] Error getting auth token:', error);
  }
  return {};
};

export const trpcClient = createTRPCProxyClient<AppRouter>({
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
