import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated && !context.isAuthLoading) {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
