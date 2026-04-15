import { APIError, ErrCode, useSession } from "@instride/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./shared/components/default-catch-boundary";
import { DefaultNotFound } from "./shared/components/default-not-found";
import Loader from "./shared/components/loader";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min default
      retry: (failureCount, error) => {
        // don't retry on auth errors
        if (
          error instanceof APIError &&
          error.code === ErrCode.Unauthenticated
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export interface RouterContext {
  isAuthenticated: boolean;
  queryClient: QueryClient;
}

const isProd = import.meta.env.PROD;

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: Loader,
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: DefaultNotFound,
  context: {
    isAuthenticated: false,
    queryClient,
  },
  ...(isProd && {
    rewrite: {
      input: ({ url }) => {
        const parts = url.hostname.split(".");

        // Check if we're on a subdomain (not root or app subdomain)
        const isRootDomain =
          parts.length === 2 || // instride.vercel.app or instrideapp.com
          (parts.length === 3 && parts[0] === "app"); // app.instride.vercel.app

        // Check which domain we're on
        const baseDomain = parts.slice(-2).join(".");
        const isVercelDomain = baseDomain === "vercel.app";
        const isCustomDomain = baseDomain === "instrideapp.com";

        if (!isRootDomain && (isVercelDomain || isCustomDomain)) {
          const slug = parts[0];
          url.pathname = `/org/${slug}${url.pathname === "/" ? "" : url.pathname}`;
        }

        return url;
      },
      output: ({ url }) => {
        const match = url.pathname.match(/^\/org\/([^/]+)(.*)$/);
        if (match) {
          const [, slug, rest] = match;
          // Keep the same domain, just change subdomain
          const currentDomain = url.hostname.split(".").slice(-2).join(".");
          url.hostname = `${slug}.${currentDomain}`;
          url.pathname = rest || "/";
        }
        return url;
      },
    },
  }),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { data: sessionResponse, isPending } = useSession();

  if (isPending) {
    return <Loader />;
  }

  return (
    <RouterProvider
      router={router}
      context={{
        isAuthenticated: !!sessionResponse?.session,
      }}
    />
  );
}

const rootElement = document.querySelector("#app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
