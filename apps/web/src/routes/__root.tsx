import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

import "../index.css";
import { Modals } from "@/shared/components/modals";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

import type { RouterContext } from "../main";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "instride",
      },
      {
        name: "description",
        content: "instride is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  beforeLoad: async ({ context, location }) => {
    const { isAuthenticated } = context as RouterContext;

    // Public routes that don't require auth
    const publicPaths = [
      "/auth/login", // Root domain login
      "/auth/register", // Root domain register
      "/auth/callback", // OAuth callback
    ];

    // Check if current path is public
    const isPublicPath = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    // Also check for org-specific login/register pages
    const isOrgAuthPage = location.pathname.match(
      /^\/org\/[^/]+\/auth\/(login|register)$/ // CHANGED: Added /auth/ to path
    );

    if (!isAuthenticated && !isPublicPath && !isOrgAuthPage) {
      const currentPath = location.pathname;
      const orgMatch = currentPath.match(/^\/org\/([^/]+)/);

      if (orgMatch) {
        throw redirect({
          to: "/org/$slug/auth/login", // CHANGED: Added /auth/
          params: { slug: orgMatch[1] },
          search: {
            redirect:
              currentPath.replace(`/org/${orgMatch[1]}`, "") || "/dashboard",
          },
        });
      }

      throw redirect({
        to: "/auth/login",
        search: {
          redirect: currentPath,
        },
      });
    }

    return context;
  },
});

function RootComponent() {
  return (
    <TooltipProvider>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Outlet />
        </div>
        <Toaster richColors />
        <Modals />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </TooltipProvider>
  );
}
