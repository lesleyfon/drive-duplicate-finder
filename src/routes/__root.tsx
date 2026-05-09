import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { ErrorBoundary } from "../components/ErrorBoundary";
import Sidebar from "../components/sidebar";
import { useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import type { RouterContext } from "../types/router";

function RootComponent() {
  useGoogleAuth();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { theme } = useTheme();

  if (isAuthLoading) {
    return (
      <div
        data-theme={theme}
        className="min-h-screen bg-[var(--theme-page-bg)] flex items-center justify-center"
      >
        <span className="text-[var(--theme-text-secondary)] text-[11px] uppercase tracking-[0.1em] animate-pulse font-barlow-condensed font-bold">
          INITIALIZING...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        data-theme={theme}
        className="min-h-screen bg-[var(--theme-page-bg)]"
      >
        <Outlet />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[var(--theme-page-bg)]">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoot() {
  return (
    <ThemeProvider>
      <RootComponent />
    </ThemeProvider>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: AppRoot,
  errorComponent: ({ error, reset }) => (
    <ErrorBoundary error={error} reset={reset} />
  ),
});
