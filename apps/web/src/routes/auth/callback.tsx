import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import Loader from "@/shared/components/loader";

const callbackSearchSchema = z.object({
  orgSlug: z.string().optional(),
  returnTo: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: callbackSearchSchema,
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const currentHost = window.location.host;
        const { orgSlug, returnTo } = search;

        const isDev = !import.meta.env.PROD;

        // Determine if we're on the canonical auth domain
        const isAuthDomain = import.meta.env.PROD
          ? currentHost === "app.instrideapp.com"
          : currentHost === "localhost:3000" ||
            currentHost === "127.0.0.1:3000";

        if (isDev && orgSlug) {
          // In dev, use path-based routing
          const targetPath = `/org/${orgSlug}${returnTo || "/dashboard"}`;
          console.log("Navigating to org path:", targetPath);
          navigate({ to: targetPath as any });
          return;
        }

        if (isAuthDomain && orgSlug) {
          // Production: redirect to org subdomain
          const protocol = window.location.protocol;
          const targetDomain = `${orgSlug}.instrideapp.com`;
          const targetPath = returnTo || "/dashboard";
          const targetUrl = `${protocol}//${targetDomain}${targetPath}`;

          console.log("Redirecting to org subdomain:", targetUrl);
          window.location.href = targetUrl;
          return;
        }

        if (isAuthDomain && !orgSlug) {
          // No org context - redirect to root domain dashboard
          if (isDev) {
            navigate({ to: returnTo || "/dashboard" });
            return;
          }

          const targetPath = returnTo || "/dashboard";
          const targetUrl = `https://instrideapp.com${targetPath}`;
          console.log("Redirecting to root domain:", targetUrl);
          window.location.href = targetUrl;
          return;
        }

        // Already on target domain, just navigate
        navigate({ to: returnTo || "/dashboard" });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Failed to complete sign in. Please try again.");
      }
    }

    handleCallback();
  }, [search, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => navigate({ to: "/auth/login" })}
            className="text-sm underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return <Loader />;
}
