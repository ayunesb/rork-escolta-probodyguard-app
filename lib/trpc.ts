import { createTRPCReact, createTRPCProxyClient } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { auth } from "@/config/firebase";

export const trpc = createTRPCReact<AppRouter>();

// ✅ Helper: choose correct base URL based on environment
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    console.log("[tRPC] Using window origin for web:", origin);
    return origin;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log("[tRPC] Using EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  console.log("[tRPC] Using default localhost:8081");
  return "http://localhost:8081";
};

// ✅ Helper: attach Firebase auth token if user is logged in
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
    console.error("[tRPC] Failed to get auth token:", error);
  }
  return {};
};

// ✅ Create proxy client for background/server use
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const headers = await getAuthHeaders();
        console.log("[tRPC Client] Request to:", `${getBaseUrl()}/api/trpc`);
        console.log("[tRPC Client] Headers:", Object.keys(headers));
        return headers;
      },
      fetch(url, options) {
        console.log("[tRPC Client] Fetching:", url);
        console.log("[tRPC Client] Method:", options?.method);
        return fetch(url, options)
          .then(async (response) => {
            const contentType = response.headers.get("content-type");
            console.log("[tRPC Client] Response status:", response.status);
            console.log("[tRPC Client] Content-Type:", contentType);

            if (!contentType?.includes("application/json")) {
              const clonedResponse = response.clone();
              const text = await clonedResponse.text();
              console.error("[tRPC Client] Response is not JSON");
              console.error("[tRPC Client] Status:", response.status, response.statusText);
              console.error("[tRPC Client] Body preview:", text.substring(0, 500));

              if (text.includes("<!DOCTYPE") || text.includes("<html")) {
                throw new Error(
                  "API endpoint returned HTML instead of JSON. " +
                    'This usually means the API route is not configured correctly. ' +
                    'Make sure you started the app with "bun run start" or "npx expo start". ' +
                    "URL: " + url
                );
              }
            }
            return response;
          })
          .catch((error) => {
            console.error("[tRPC Client] Fetch error:", error);
            throw error;
          });
      },
    }),
  ],
});

// ✅ Create React Query-integrated client for app UI
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
