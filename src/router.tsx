import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";
import { minutesToMilliseconds } from "date-fns";

export interface RouterContext {
  queryClient: QueryClient;
}

export function createRouter() {
  const queryClient = new QueryClient();
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient } satisfies RouterContext,
    defaultPreload: "intent",
    defaultPreloadDelay: 40,
    // TODO - check for preload promiximity when they add it
    defaultPreloadStaleTime: minutesToMilliseconds(15),
    scrollRestoration: true,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
    defaultViewTransition: true,
    defaultStructuralSharing: true,
  });

  return routerWithQueryClient(router as any, queryClient) as typeof router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
