import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status;
        // Don't retry on auth errors or not found
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        // Retry up to 3 times on network/rate-limit errors
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

function RouterWithAuth() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to invalidate on auth state changes
  useEffect(() => {
    router.invalidate();
  }, [isAuthenticated, isAuthLoading]);
  return (
    <RouterProvider
      router={router}
      context={{ isAuthenticated, isAuthLoading }}
    />
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterWithAuth />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
