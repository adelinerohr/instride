import { authOptions, useSession } from "@instride/api";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

import "../index.css";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

import Loader from "@/shared/components/loader";
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
    // Fetch session data
    const sessionData = await context.queryClient.ensureQueryData(
      authOptions.session()
    );

    const isAuthenticated = !!sessionData?.session;

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
      /^\/org\/[^/]+\/auth\/(login|register)$/
    );

    if (isAuthenticated && isPublicPath && !isOrgAuthPage) {
      throw redirect({
        to: "/",
      });
    }

    if (!isAuthenticated && !isPublicPath && !isOrgAuthPage) {
      const currentPath = location.pathname;
      const orgMatch = currentPath.match(/^\/org\/([^/]+)/);

      if (orgMatch) {
        throw redirect({
          to: "/org/$slug/auth/login",
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

    return {
      ...context,
      isAuthenticated,
    };
  },
});

function RootComponent() {
  const { isPending } = useSession();

  // Show loader while checking session
  if (isPending) {
    return <Loader />;
  }

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
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </TooltipProvider>
  );
}
