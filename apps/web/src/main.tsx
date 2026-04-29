import { APIError, ErrCode } from "@instride/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./shared/components/default-catch-boundary";
import { DefaultNotFound } from "./shared/components/default-not-found";
import Loader from "./shared/components/loader";
import { applyOrgPathOutputRewrite } from "./shared/lib/navigation/subdomain-rewrite";

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
  queryClient: QueryClient;
  /** Set by root route `beforeLoad` from the session query */
  isAuthenticated?: boolean;
}

const isProd = import.meta.env.PROD;

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: Loader,
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: DefaultNotFound,
  context: {
    queryClient,
  },
  ...(isProd && {
    rewrite: {
      input: ({ url }) => {
        const parts = url.hostname.split(".");

        const NON_ORG_SUBDOMAINS = new Set(["app", "www"]);

        const isRootDomain =
          parts.length === 2 ||
          (parts.length === 3 && NON_ORG_SUBDOMAINS.has(parts[0]));

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
        applyOrgPathOutputRewrite(url);
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

const rootElement = document.querySelector("#app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
