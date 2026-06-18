import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getTenant } from "~/server/corsair-tenant";
import { summarizeThread, draftEmail, draftReply } from "~/server/agents/agent";
import { emailThreads } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const aiRouter = createTRPCRouter({
  /**
   * Chat with the AI assistant — processes natural language commands
   * and executes tools (search emails, draft, schedule, etc.)
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);
      const message = input.message.toLowerCase();

      // Tool: Summarize inbox
      if (
        message.includes("summarize") &&
        (message.includes("inbox") || message.includes("unread"))
      ) {
        try {
          const threads = await (tenant as any).gmail.db.threads.search({
            limit: 10,
          });
          if (!Array.isArray(threads) || threads.length === 0) {
            return {
              response: "Your inbox is empty! No emails to summarize.",
              action: null,
            };
          }

          const summaries: string[] = [];
          for (const thread of threads.slice(0, 5)) {
            const data = thread.data ?? {};
            summaries.push(
              `• ${data.snippet?.substring(0, 80) ?? "No preview"}...`,
            );
          }

          return {
            response: `Here's a summary of your latest ${summaries.length} threads:\n\n${summaries.join("\n")}\n\nWould you like me to do anything with these?`,
            action: { type: "show_threads", data: threads.slice(0, 5) },
          };
        } catch (e) {
          return {
            response:
              "I couldn't access your inbox. Please make sure Gmail is connected.",
            action: null,
          };
        }
      }

      // Tool: Search emails
      if (
        message.includes("find") ||
        message.includes("search") ||
        message.includes("look for")
      ) {
        try {
          const threads = await (tenant as any).gmail.db.threads.search({
            limit: 50,
          });
          if (!Array.isArray(threads)) {
            return {
              response:
                "I couldn't search your emails. Please make sure Gmail is connected.",
              action: null,
            };
          }

          // Extract search terms from the message
          const searchTerms = input.message
            .replace(/^(find|search|look for)\s+/i, "")
            .toLowerCase();
          const filtered = threads.filter((t: any) => {
            const data = t.data ?? {};
            const snippet = (data.snippet ?? "").toLowerCase();
            return snippet.includes(searchTerms);
          });

          if (filtered.length === 0) {
            return {
              response: `I couldn't find any emails matching "${searchTerms}". Try a different search term.`,
              action: null,
            };
          }

          const results = filtered.slice(0, 5).map((t: any, i: number) => {
            const data = t.data ?? {};
            return `${i + 1}. ${data.snippet?.substring(0, 100) ?? "No preview"}...`;
          });

          return {
            response: `Found ${filtered.length} emails matching "${searchTerms}":\n\n${results.join("\n")}\n\nWould you like me to open one of these?`,
            action: { type: "search_results", data: filtered.slice(0, 5) },
          };
        } catch (e) {
          return { response: "Search failed. Please try again.", action: null };
        }
      }

      // Tool: Draft email
      if (
        message.includes("draft") ||
        message.includes("write") ||
        message.includes("compose")
      ) {
        try {
          const context = input.message.replace(
            /^(draft|write|compose)\s+(an?\s+)?(email\s+)?(to\s+)?/i,
            "",
          );
          const draft = await draftEmail(
            context,
            "recipient",
            "Regarding your request",
          );

          return {
            response: `Here's a draft:\n\n${draft}\n\nWould you like me to edit this or send it?`,
            action: {
              type: "draft",
              data: { body: draft, to: "", subject: "Draft" },
            },
          };
        } catch (e) {
          return {
            response: "I couldn't generate a draft. Please try again.",
            action: null,
          };
        }
      }

      // Tool: Calendar events
      if (
        message.includes("meeting") ||
        message.includes("calendar") ||
        message.includes("event") ||
        message.includes("schedule")
      ) {
        try {
          const events = await (tenant as any).googlecalendar.db.events.search({
            limit: 10,
          });
          if (!Array.isArray(events) || events.length === 0) {
            return {
              response:
                "No upcoming events found. Would you like me to create one?",
              action: null,
            };
          }

          const eventList = events.slice(0, 5).map((e: any, i: number) => {
            const data = e.data ?? {};
            const start = data.start?.dateTime ?? data.start?.date ?? "";
            const time = start
              ? new Date(start).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "TBD";
            return `${i + 1}. ${data.summary ?? "Untitled"} — ${time}`;
          });

          return {
            response: `Here are your upcoming events:\n\n${eventList.join("\n")}\n\nWould you like me to create a new event or modify one?`,
            action: { type: "show_events", data: events.slice(0, 5) },
          };
        } catch (e) {
          return {
            response:
              "I couldn't access your calendar. Please make sure Google Calendar is connected.",
            action: null,
          };
        }
      }

      // Tool: Archive / Delete
      if (
        message.includes("archive") ||
        message.includes("delete") ||
        message.includes("trash")
      ) {
        return {
          response:
            "I can help with that! Please specify which email you'd like to archive or delete. You can also select an email in your inbox and press `E` to archive or `#` to delete.",
          action: null,
        };
      }

      // Default: General AI response
      return {
        response: `I can help you with:\n\n• **Summarize inbox** — Get a quick overview of your emails\n• **Search emails** — Find specific messages\n• **Draft email** — Write a new email\n• **Check calendar** — See upcoming events\n• **Schedule meeting** — Create a new event\n\nWhat would you like to do?`,
        action: null,
      };
    }),

  /**
   * Streaming chat — returns a simple response for now.
   * Can be upgraded to real streaming later.
   */
  chatStream: protectedProcedure
    .input(
      z.object({
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // For now, delegate to the chat procedure
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      // Simple echo for streaming demo
      return {
        response: `Processing: "${input.message}"... I'm working on understanding your request. This feature is being enhanced with full streaming support.`,
        done: true,
      };
    }),
});
