import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";

/**
 * Path: /
 *
 * Description: Non-org user landing page, redirects based on auth state
 */

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});

function HomeComponent() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Instride
          </h1>
          <p className="text-sm text-muted-foreground">
            What would you like to do?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => navigate({ to: "/create-organization" })}
          >
            Create organization
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: "/join-organization" })}
          >
            Join organization
          </Button>
        </div>
      </div>
    </div>
  );
}
