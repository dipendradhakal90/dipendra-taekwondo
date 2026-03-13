// frontend/src/services/queryClient.js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,          // 1 min: feels fast
      gcTime: 10 * 60 * 1000,        // 10 min cache
      refetchOnWindowFocus: false,   // avoid random reloads
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});