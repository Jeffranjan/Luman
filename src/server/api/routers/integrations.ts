import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  corsairAccounts,
  corsairIntegrations,
  users,
} from "~/server/db/schema";
import { eq, inArray } from "drizzle-orm";

export const integrationsRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Look up the user's name to find potential Corsair tenant IDs
    const [user] = await ctx.db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Build list of possible tenant IDs
    const possibleTenantIds = [userId];
    if (user?.name) {
      possibleTenantIds.push(user.name);
      const firstName = user.name.split(" ")[0];
      if (firstName && firstName !== user.name) {
        possibleTenantIds.push(firstName);
      }
    }

    const accounts = await ctx.db
      .select({
        accountId: corsairAccounts.id,
        integrationName: corsairIntegrations.name,
        config: corsairAccounts.config,
      })
      .from(corsairAccounts)
      .innerJoin(
        corsairIntegrations,
        eq(corsairAccounts.integrationId, corsairIntegrations.id),
      )
      .where(inArray(corsairAccounts.tenantId, possibleTenantIds));

    // Check for actual connection (has tokens in config)
    const hasGmail = accounts.some(
      (a) =>
        a.integrationName === "gmail" &&
        a.config &&
        Object.keys(a.config as object).length > 0 &&
        (a.config as any).access_token,
    );

    const hasCalendar = accounts.some(
      (a) =>
        a.integrationName === "googlecalendar" &&
        a.config &&
        Object.keys(a.config as object).length > 0 &&
        (a.config as any).access_token,
    );

    return {
      gmail: hasGmail,
      calendar: hasCalendar,
    };
  }),
});
