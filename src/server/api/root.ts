import { postRouter } from "~/server/api/routers/post";
import { integrationsRouter } from "~/server/api/routers/integrations";
import { inboxRouter } from "~/server/api/routers/inbox";
import { calendarRouter } from "~/server/api/routers/calendar";
import { searchRouter } from "~/server/api/routers/search";
import { aiRouter } from "~/server/api/routers/ai";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  integrations: integrationsRouter,
  inbox: inboxRouter,
  calendar: calendarRouter,
  search: searchRouter,
  ai: aiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
