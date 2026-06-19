import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getTenant } from "~/server/corsair-tenant";
import { runAgent } from "~/server/agents/agent";
import type { AgentResult } from "~/server/agents/agent";

export const aiRouter = createTRPCRouter({
  /**
   * Main agent endpoint — processes natural language with tool calling.
   * Returns structured results (draft, search, calendar, etc.) instead of plain text.
   */
  agent: protectedProcedure
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
    .mutation(async ({ ctx, input }): Promise<AgentResult> => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      try {
        const result = await runAgent(input.message, input.history ?? [], {
          tenant,
          userId,
          db: ctx.db,
        });
        return result;
      } catch (error: any) {
        console.error("[AI Agent] Error:", error?.message ?? error);
        return {
          type: "text",
          data: {},
          message: "Something went wrong. Please try again.",
        };
      }
    }),

  /**
   * Confirm and send an email (called after user reviews the draft).
   */
  confirmSend: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      const raw = [
        `To: ${input.to}`,
        `Subject: ${input.subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        input.body,
      ].join("\r\n");

      const encoded = Buffer.from(raw).toString("base64url");

      try {
        const sent = await (tenant as any).gmail.api.messages.send({
          raw: encoded,
        });
        return { success: true, messageId: sent?.id };
      } catch (error: any) {
        console.error("[AI Agent] Send failed:", error?.message ?? error);
        return { success: false, error: "Failed to send email." };
      }
    }),

  /**
   * Confirm and create a calendar event (called after user reviews).
   */
  confirmCreateEvent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        startDateTime: z.string(),
        endDateTime: z.string(),
        description: z.string().optional(),
        attendees: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      try {
        const event = await (tenant as any).googlecalendar.api.events.insert({
          calendarId: "primary",
          resource: {
            summary: input.title,
            description: input.description ?? "",
            start: { dateTime: input.startDateTime },
            end: { dateTime: input.endDateTime },
            attendees: (input.attendees ?? []).map((email) => ({ email })),
            conferenceData: {
              createRequest: { requestId: `meet-${Date.now()}` },
            },
          },
          conferenceDataVersion: 1,
        });
        return {
          success: true,
          eventId: event?.id,
          hangoutLink: event?.hangoutLink ?? null,
        };
      } catch (error: any) {
        console.error(
          "[AI Agent] Calendar create failed:",
          error?.message ?? error,
        );
        return { success: false, error: "Failed to create event." };
      }
    }),

  /**
   * Legacy chat endpoint — kept for backward compatibility.
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
    .mutation(async ({ ctx, input }): Promise<AgentResult> => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      try {
        return await runAgent(input.message, input.history ?? [], {
          tenant,
          userId,
          db: ctx.db,
        });
      } catch (error: any) {
        return {
          type: "text",
          data: {},
          message: "Something went wrong. Please try again.",
        };
      }
    }),
});
