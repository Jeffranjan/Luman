import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getTenant } from "~/server/corsair-tenant";

export const searchRouter = createTRPCRouter({
  query: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      // Search both Gmail messages and Calendar events via Corsair DB
      const [emailResults, eventResults] = await Promise.all([
        (tenant as any).gmail.db.messages.search({
          limit: 100,
        }),
        (tenant as any).googlecalendar.db.events.search({
          limit: 100,
        }),
      ]);

      const results: {
        id: string;
        type: string;
        title: string;
        snippet: string;
      }[] = [];

      // Filter email results by query (client-side filter on synced data)
      if (Array.isArray(emailResults) && emailResults.length > 0) {
        const query = input.query.toLowerCase();
        const filtered = emailResults.filter((msg: any) => {
          const data = msg.data ?? {};
          const headers = data.payload?.headers ?? [];
          const subject =
            data.subject ??
            headers.find((h: any) => h.name === "Subject")?.value ??
            "";
          const snippet = data.snippet ?? "";
          return (
            subject.toLowerCase().includes(query) ||
            snippet.toLowerCase().includes(query)
          );
        });

        for (const msg of filtered.slice(0, 5)) {
          const data = msg.data ?? {};
          const headers = data.payload?.headers ?? [];
          results.push({
            id: data.threadId ?? msg.entityId,
            type: "email",
            title:
              data.subject ??
              headers.find((h: any) => h.name === "Subject")?.value ??
              "No Subject",
            snippet: (data.snippet ?? "").substring(0, 80),
          });
        }
      }

      // Filter calendar results by query
      if (Array.isArray(eventResults) && eventResults.length > 0) {
        const query = input.query.toLowerCase();
        const filtered = eventResults.filter((evt: any) => {
          const data = evt.data ?? {};
          const summary = data.summary ?? "";
          const description = data.description ?? "";
          return (
            summary.toLowerCase().includes(query) ||
            description.toLowerCase().includes(query)
          );
        });

        for (const evt of filtered.slice(0, 5)) {
          const data = evt.data ?? {};
          results.push({
            id: evt.entityId,
            type: "event",
            title: data.summary ?? "Untitled Event",
            snippet: (data.description ?? "").substring(0, 80),
          });
        }
      }

      return results;
    }),
});
