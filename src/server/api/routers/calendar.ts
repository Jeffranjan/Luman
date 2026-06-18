import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getTenant } from "~/server/corsair-tenant";

export const calendarRouter = createTRPCRouter({
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const tenant = await getTenant(userId);

    // Read events from Corsair's synced Google Calendar cache
    // db.* search returns an array directly
    let events = await (tenant as any).googlecalendar.db.events.search({
      limit: 50,
    });

    // If cache is empty, trigger a sync from Google Calendar API
    if (!Array.isArray(events) || events.length === 0) {
      try {
        await (tenant as any).googlecalendar.api.events.list({
          maxResults: 50,
        });
        events = await (tenant as any).googlecalendar.db.events.search({
          limit: 50,
        });
      } catch (e) {
        console.error("Calendar sync failed:", e);
        return [];
      }
    }

    if (!Array.isArray(events) || events.length === 0) {
      return [];
    }

    return events
      .map((event: any) => {
        const data = event.data ?? {};
        const start = data.start?.dateTime ?? data.start?.date ?? null;
        const end = data.end?.dateTime ?? data.end?.date ?? null;
        const summary = data.summary ?? "Untitled Event";

        // Extract meeting links from hangoutLink, location, or description
        let hangoutLink: string | null = data.hangoutLink ?? null;
        if (!hangoutLink && data.location) {
          const zoomMatch = data.location.match(
            /https?:\/\/[\w.-]*zoom\.us\/j\/[\w]+/,
          );
          const meetMatch = data.location.match(
            /https?:\/\/meet\.google\.com\/[\w-]+/,
          );
          hangoutLink = zoomMatch?.[0] ?? meetMatch?.[0] ?? null;
        }

        return {
          id: event.entityId ?? event.id,
          title: summary,
          start: start ?? new Date().toISOString(),
          end: end ?? new Date().toISOString(),
          hangoutLink,
          isAllDay: !data.start?.dateTime,
        };
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }),
});
