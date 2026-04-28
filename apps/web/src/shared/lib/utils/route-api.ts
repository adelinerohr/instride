import {
  getRouteApi,
  useRouterState,
  type RegisteredRouter,
  type RouteIds,
} from "@tanstack/react-router";

type RouteId = RouteIds<RegisteredRouter["routeTree"]>;

function pickPortalOrAdmin<P extends RouteId, A extends RouteId>(
  portalPath: P,
  adminPath: A
) {
  const isPortal = useRouterState({
    select: (s) => s.matches.some((m) => m.routeId === portalPath),
  });
  return isPortal ? getRouteApi(portalPath) : getRouteApi(adminPath);
}

export const useMessagesRouteApi = () => ({
  root: pickPortalOrAdmin(
    "/org/$slug/(authenticated)/portal/messages",
    "/org/$slug/(authenticated)/admin/messages"
  ),
  conversation: pickPortalOrAdmin(
    "/org/$slug/(authenticated)/portal/messages/$conversationId",
    "/org/$slug/(authenticated)/admin/messages/$conversationId"
  ),
  index: pickPortalOrAdmin(
    "/org/$slug/(authenticated)/portal/messages",
    "/org/$slug/(authenticated)/admin/messages"
  ),
});
