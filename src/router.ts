import { createRouter } from "@tanstack/react-router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { routeTree } from "./routeTree.gen";
import type { RouterContext } from "./types/router";

export type { RouterContext };

export const router = createRouter({
  routeTree,
  defaultErrorComponent: ErrorBoundary,
  context: {
    isAuthenticated: false,
    isAuthLoading: false,
  } satisfies RouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
