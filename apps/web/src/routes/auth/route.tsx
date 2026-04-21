import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

import { brand } from "@/shared/components/logo";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center flex-col justify-center gap-2 self-center font-medium">
          {brand.mark({ className: "size-12" })}
          <h1 className="text-2xl font-display font-semibold tracking-tight">
            {brand.name}
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
