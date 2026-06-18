import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { emailThreads } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getTenant } from "~/server/corsair-tenant";
import { summarizeThread } from "~/server/agents/agent";

export const inboxRouter = createTRPCRouter({
  getThreads: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const tenant = await getTenant(userId);

    // Read threads from Corsair's synced Gmail cache
    let threads: any[] = [];
    try {
      threads = await (tenant as any).gmail.db.threads.search({ limit: 50 });
    } catch (e: any) {
      console.error("[Inbox] DB search failed:", e?.message);
    }

    // If cache is empty, trigger a fresh sync from Gmail API
    if (!Array.isArray(threads) || threads.length === 0) {
      try {
        await (tenant as any).gmail.api.threads.list({ maxResults: 50 });
        threads = await (tenant as any).gmail.db.threads.search({ limit: 50 });
      } catch (e: any) {
        console.error("[Inbox] Gmail API sync failed:", e?.message);
        return [];
      }
    }

    if (!Array.isArray(threads) || threads.length === 0) {
      return [];
    }

    // Fetch local metadata (pinned, snoozed, archived)
    const localThreads = await ctx.db
      .select()
      .from(emailThreads)
      .where(eq(emailThreads.userId, userId));

    const localMap = new Map(localThreads.map((t) => [t.threadId, t]));
    const now = new Date();

    // Fetch headers for first 20 threads via Gmail API
    const threadsToEnrich = threads.slice(0, 20);
    const enrichedResults = await Promise.allSettled(
      threadsToEnrich.map(async (thread: any) => {
        const entityId = thread.entityId ?? thread.id;
        const data = thread.data ?? {};
        const local = localMap.get(entityId);
        const gmailThreadId = data.id ?? entityId;

        let subject = "No Subject";
        let from = "Unknown";

        try {
          const fullThread = await (tenant as any).gmail.api.threads.get({
            id: gmailThreadId,
            format: "full",
          });

          if (fullThread?.messages?.length > 0) {
            const msgHeaders = fullThread.messages[0].payload?.headers ?? [];
            subject =
              msgHeaders.find((h: any) => h.name === "Subject")?.value ??
              "No Subject";
            from =
              msgHeaders.find((h: any) => h.name === "From")?.value ??
              "Unknown";
          }
        } catch (e: any) {
          console.error(
            `[Inbox] Enrich failed for ${gmailThreadId}:`,
            e?.message,
          );
          subject = data.snippet?.substring(0, 60) ?? "No Subject";
        }

        return {
          id: gmailThreadId,
          subject,
          snippet: data.snippet ?? "",
          from,
          date: data.createdAt
            ? new Date(data.createdAt).toISOString()
            : new Date().toISOString(),
          unread: false,
          priority: local?.priorityScore ?? null,
          pinned: local?.pinned === "true",
          snoozedUntil: local?.snoozedUntil ?? null,
          archivedAt: local?.archivedAt ?? null,
        };
      }),
    );

    const enrichedThreads = enrichedResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value);

    // Add remaining threads (>20) with snippet data only
    for (let i = 20; i < threads.length; i++) {
      const thread = threads[i]!;
      const data = thread.data ?? {};
      const gmailThreadId = data.id ?? thread.entityId ?? thread.id;
      const local = localMap.get(thread.entityId ?? thread.id);
      enrichedThreads.push({
        id: gmailThreadId,
        subject: data.snippet?.substring(0, 60) ?? "No Subject",
        snippet: data.snippet ?? "",
        from: "Unknown",
        date: data.createdAt
          ? new Date(data.createdAt).toISOString()
          : new Date().toISOString(),
        unread: false,
        priority: local?.priorityScore ?? null,
        pinned: local?.pinned === "true",
        snoozedUntil: local?.snoozedUntil ?? null,
        archivedAt: local?.archivedAt ?? null,
      });
    }

    return enrichedThreads
      .filter((t: any) => {
        if (t.archivedAt) return false;
        if (t.snoozedUntil && new Date(t.snoozedUntil) > now) return false;
        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
  }),

  getThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      let thread: any = null;

      try {
        thread = await (tenant as any).gmail.api.threads.get({
          id: input.threadId,
          format: "full",
        });
      } catch (e: any) {
        console.error("[Inbox] getThread full failed:", e?.message ?? e);
      }

      if (!thread) {
        try {
          thread = await (tenant as any).gmail.api.threads.get({
            id: input.threadId,
            format: "full",
          });
        } catch (e2: any) {
          console.error("[Inbox] getThread retry failed:", e2?.message ?? e2);
        }
      }

      if (!thread) {
        const [localMeta] = await ctx.db
          .select()
          .from(emailThreads)
          .where(eq(emailThreads.threadId, input.threadId))
          .limit(1);

        return {
          id: input.threadId,
          subject: localMeta?.aiSummary
            ? "Thread"
            : "Thread (unable to load details)",
          messages: [
            {
              id: input.threadId,
              from: "Gmail",
              to: "me",
              body: "Unable to load thread details. The Gmail API may be temporarily unavailable. Please try again.",
              date: new Date().toISOString(),
            },
          ],
          aiSummary: localMeta?.aiSummary ?? null,
        };
      }

      const threadMessages = thread.messages ?? [];

      const parsedMessages = threadMessages.map((msg: any) => {
        const headers = msg.payload?.headers ?? [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
            ?.value ?? "";

        let body = "";
        let htmlBody = "";

        // Extract body from parts (multipart emails)
        if (msg.payload?.parts) {
          for (const part of msg.payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
              body = Buffer.from(part.body.data, "base64url").toString("utf-8");
            }
            if (part.mimeType === "text/html" && part.body?.data) {
              htmlBody = Buffer.from(part.body.data, "base64url").toString(
                "utf-8",
              );
            }
            // Handle nested multipart (multipart/alternative inside multipart/mixed)
            if (part.parts) {
              for (const nested of part.parts) {
                if (
                  nested.mimeType === "text/plain" &&
                  nested.body?.data &&
                  !body
                ) {
                  body = Buffer.from(nested.body.data, "base64url").toString(
                    "utf-8",
                  );
                }
                if (
                  nested.mimeType === "text/html" &&
                  nested.body?.data &&
                  !htmlBody
                ) {
                  htmlBody = Buffer.from(
                    nested.body.data,
                    "base64url",
                  ).toString("utf-8");
                }
              }
            }
          }
        }

        // Fallback to simple body
        if (!body && msg.payload?.body?.data) {
          const decoded = Buffer.from(
            msg.payload.body.data,
            "base64url",
          ).toString("utf-8");
          if (msg.payload?.mimeType === "text/html") {
            htmlBody = decoded;
          } else {
            body = decoded;
          }
        }

        if (!body && !htmlBody) body = msg.snippet ?? "";

        return {
          id: msg.id,
          from: getHeader("From"),
          to: getHeader("To"),
          body,
          htmlBody: htmlBody || undefined,
          date: msg.internalDate
            ? new Date(Number(msg.internalDate)).toISOString()
            : new Date().toISOString(),
        };
      });

      const [localMeta] = await ctx.db
        .select()
        .from(emailThreads)
        .where(eq(emailThreads.threadId, input.threadId))
        .limit(1);

      const threadHeaders = threadMessages[0]?.payload?.headers ?? [];
      const subject =
        threadHeaders.find((h: any) => h.name === "Subject")?.value ??
        "No Subject";

      return {
        id: input.threadId,
        subject,
        messages: parsedMessages,
        aiSummary: localMeta?.aiSummary ?? null,
      };
    }),

  generateSummary: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      const thread = await (tenant as any).gmail.api.threads.get({
        id: input.threadId,
        format: "full",
      });

      if (!thread) throw new Error("Thread not found");

      const messages = (thread.messages ?? []).map((msg: any) => {
        const headers = msg.payload?.headers ?? [];
        const from =
          headers.find((h: any) => h.name === "From")?.value ?? "Unknown";
        return { from, body: msg.snippet ?? "" };
      });

      const summary = await summarizeThread(messages);

      await ctx.db
        .insert(emailThreads)
        .values({
          threadId: input.threadId,
          entityId: input.threadId,
          userId,
          aiSummary: summary,
        })
        .onConflictDoUpdate({
          target: emailThreads.threadId,
          set: { aiSummary: summary },
        });

      return { summary };
    }),

  archiveThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      await (tenant as any).gmail.api.threads.modify({
        id: input.threadId,
        removeLabelIds: ["INBOX"],
      });

      await ctx.db
        .insert(emailThreads)
        .values({
          threadId: input.threadId,
          entityId: input.threadId,
          userId,
          archivedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: emailThreads.threadId,
          set: { archivedAt: new Date() },
        });

      return { success: true };
    }),

  snoozeThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        snoozeUntil: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .insert(emailThreads)
        .values({
          threadId: input.threadId,
          entityId: input.threadId,
          userId,
          snoozedUntil: new Date(input.snoozeUntil),
        })
        .onConflictDoUpdate({
          target: emailThreads.threadId,
          set: { snoozedUntil: new Date(input.snoozeUntil) },
        });

      return { success: true };
    }),

  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      await (tenant as any).gmail.api.threads.trash({ id: input.threadId });

      await ctx.db
        .insert(emailThreads)
        .values({
          threadId: input.threadId,
          entityId: input.threadId,
          userId,
          archivedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: emailThreads.threadId,
          set: { archivedAt: new Date() },
        });

      return { success: true };
    }),

  replyToThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        inReplyTo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const tenant = await getTenant(userId);

      const headers = [
        `To: ${input.to}`,
        `Subject: ${input.subject.startsWith("Re:") ? input.subject : `Re: ${input.subject}`}`,
        "Content-Type: text/plain; charset=utf-8",
        input.inReplyTo ? `In-Reply-To: ${input.inReplyTo}` : "",
        input.inReplyTo ? `References: ${input.inReplyTo}` : "",
      ]
        .filter(Boolean)
        .join("\r\n");

      const raw = `${headers}\r\n\r\n${input.body}`;
      const encoded = Buffer.from(raw).toString("base64url");

      const sent = await (tenant as any).gmail.api.messages.send({
        raw: encoded,
        threadId: input.threadId,
      });

      return { success: !!sent, messageId: sent?.id };
    }),

  sendEmail: protectedProcedure
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

      const sent = await (tenant as any).gmail.api.messages.send({
        raw: encoded,
      });

      return { success: !!sent, messageId: sent?.id };
    }),

  aiDraft: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        subject: z.string(),
        context: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { draftEmail } = await import("~/server/agents/agent");
      const draft = await draftEmail(
        input.context ?? "General professional email",
        input.to,
        input.subject,
      );
      return { draft };
    }),
});
