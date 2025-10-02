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

  if (process.env.EXPO_PUBLIC_TOOLKIT_URL) {
    console.log('[tRPC] Using EXPO_PUBLIC_TOOLKIT_URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);
    return process.env.EXPO_PUBLIC_TOOLKIT_URL;
  }

  console.log('[tRPC] Using default localhost:8081');
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
        console.log('[tRPC Client] Options:', { method: options?.method });
        return fetch(url, options).then(async response => {
          console.log('[tRPC Client] Response status:', response.status);
          console.log('[tRPC Client] Content-Type:', response.headers.get('content-type'));
          
          if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
            const clonedResponse = response.clone();
            const text = await clonedResponse.text();
            console.error('[tRPC Client] Response not OK or not JSON');
            console.error('[tRPC Client] Status:', response.status, response.statusText);
            console.error('[tRPC Client] Body preview:', text.substring(0, 500));
            
            if (text.includes('<!DOCTYPE')) {
              throw new Error('API endpoint returned HTML instead of JSON. The backend may not be running or the route is incorrect.');
            }
          }
          return response;
        }).catch(error => {
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
