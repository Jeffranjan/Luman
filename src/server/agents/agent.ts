/**
 * AI Agent Module — MiMo V2.5 Pro with Tool Calling
 * The AI doesn't just talk about email — it DOES email.
 */

import { env } from "~/env";

// AI API configuration — Xiaomi MiMo V2.5 Pro (OpenAI-compatible)
const MIMO_BASE_URL =
  process.env.MIMO_BASE_URL ?? "https://token-plan-sgp.xiaomimimo.com/v1";
const MIMO_MODEL = process.env.MIMO_MODEL ?? "mimo-v2.5-pro";

interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// ─── Tool Definitions ────────────────────────────────────────────────

export const agentTools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "draft_email",
      description:
        "Draft an email. Use when the user wants to write, compose, or draft an email to someone. Extract recipient, subject, and context from the message.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description:
              "Recipient email address or name. Extract from the user's message.",
          },
          subject: {
            type: "string",
            description: "Email subject line. Infer from context.",
          },
          context: {
            type: "string",
            description:
              "What the email should be about. Use the full context from the user's message.",
          },
        },
        required: ["to", "subject", "context"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description:
        "Send an email immediately. Use when the user explicitly says 'send' and provides enough info (recipient, subject/content). If info is incomplete, use draft_email instead.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Recipient email address.",
          },
          subject: {
            type: "string",
            description: "Email subject line.",
          },
          body: {
            type: "string",
            description: "Full email body text to send.",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_emails",
      description:
        "Search emails by keyword. Use when the user wants to find, search, or look for specific emails. Also use for 'show me invoices', 'find emails from X', etc.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keywords extracted from the user's message.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarize_inbox",
      description:
        "Summarize inbox emails. Use when the user wants to see unread emails, get an inbox overview, or summarize their emails.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            description:
              "Optional filter like 'unread', 'today', 'important'. Default: all.",
            enum: ["all", "unread", "today", "important"],
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_calendar_events",
      description:
        "Get calendar events. Use when the user asks about their schedule, meetings, events, or what's on their calendar.",
      parameters: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            description: "Time filter for events.",
            enum: ["today", "tomorrow", "this_week", "upcoming"],
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      description:
        "Create a calendar event. Use when the user wants to schedule, create, or set up a meeting or event. Extract title, date, time, duration, and attendees.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Event title. Infer from context.",
          },
          date: {
            type: "string",
            description:
              "Event date in natural language (e.g., 'tomorrow', 'June 20', 'next Thursday').",
          },
          time: {
            type: "string",
            description: "Event time (e.g., '5pm', '14:00', 'morning').",
          },
          duration: {
            type: "string",
            description:
              "Duration (e.g., '30min', '1 hour', '2 hours'). Default: 1 hour.",
          },
          attendees: {
            type: "string",
            description: "Comma-separated list of attendee names or emails.",
          },
          description: {
            type: "string",
            description: "Optional event description or agenda.",
          },
        },
        required: ["title", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reply_to_thread",
      description:
        "Reply to the most recent email from a specific person. Use when the user says 'reply to X', 'respond to X', 'write back to X'.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Person to reply to (name or email).",
          },
          context: {
            type: "string",
            description: "What the reply should say or be about.",
          },
          tone: {
            type: "string",
            description:
              "Tone of the reply (e.g., 'professional', 'friendly', 'formal'). Default: professional.",
          },
        },
        required: ["to", "context"],
      },
    },
  },
];

// ─── Low-level MiMo API ──────────────────────────────────────────────

async function callMiMoRaw(
  messages: ChatMessage[],
  tools?: ToolDefinition[],
  maxTokens = 1024,
): Promise<{
  content: string | null;
  tool_calls?: ToolCall[];
}> {
  const url = `${MIMO_BASE_URL}/chat/completions`;
  console.log(
    `[MiMo Agent] Calling ${url} | model=${MIMO_MODEL} | messages=${messages.length} | tools=${tools?.length ?? 0}`,
  );

  const body: Record<string, unknown> = {
    model: MIMO_MODEL,
    messages,
    max_tokens: maxTokens,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.MIMO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown");
      console.error(`[MiMo Agent] API error ${response.status}: ${errorText}`);
      return {
        content: `AI service error (${response.status}): ${errorText.substring(0, 200)}`,
      };
    }

    const data = (await response.json()) as {
      choices?: {
        message?: {
          content?: string | null;
          tool_calls?: ToolCall[];
        };
      }[];
    };

    const choice = data.choices?.[0]?.message;
    return {
      content: choice?.content ?? null,
      tool_calls: choice?.tool_calls,
    };
  } catch (error: any) {
    console.error(`[MiMo Agent] Fetch failed: ${error?.message ?? error}`);
    return {
      content: `AI connection failed: ${error?.message ?? "Unknown error"}`,
    };
  }
}

// ─── Tool Execution Functions ─────────────────────────────────────────

interface ToolExecutionContext {
  tenant: any;
  userId: string;
  db: any;
}

export interface AgentResult {
  type:
    | "draft_email"
    | "send_email"
    | "search_results"
    | "inbox_summary"
    | "calendar_events"
    | "create_event"
    | "reply_draft"
    | "text";
  data: any;
  message: string;
}

/** Parse a natural language date string into a Date */
function parseNaturalDate(dateStr: string, timeStr?: string): Date {
  const now = new Date();
  const lower = dateStr.toLowerCase().trim();

  const date = new Date(now);

  if (lower === "today") {
    // already today
  } else if (lower === "tomorrow") {
    date.setDate(date.getDate() + 1);
  } else if (lower === "next week") {
    date.setDate(date.getDate() + 7);
  } else if (lower.startsWith("next ")) {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDay = dayNames.findIndex((d) => lower.includes(d));
    if (targetDay >= 0) {
      const currentDay = date.getDay();
      let daysAhead = targetDay - currentDay;
      if (daysAhead <= 0) daysAhead += 7;
      date.setDate(date.getDate() + daysAhead);
    }
  } else {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      date.setTime(parsed.getTime());
    }
  }

  if (timeStr) {
    const timeLower = timeStr.toLowerCase().trim();
    const timeMatch = timeLower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]!);
      const minutes = parseInt(timeMatch[2] ?? "0");
      const ampm = timeMatch[3];

      if (ampm === "pm" && hours < 12) hours += 12;
      if (ampm === "am" && hours === 12) hours = 0;

      date.setHours(hours, minutes, 0, 0);
    }
  }

  return date;
}

async function executeTool(
  toolName: string,
  args: Record<string, any>,
  ctx: ToolExecutionContext,
): Promise<AgentResult> {
  console.log(`[Agent Tool] Executing: ${toolName}`, args);

  switch (toolName) {
    case "draft_email": {
      const { draftEmail } = await import("./agent");
      const draft = await draftEmail(
        args.context,
        args.to ?? "recipient",
        args.subject ?? "Regarding your request",
      );
      return {
        type: "draft_email",
        data: {
          to: args.to ?? "",
          subject: args.subject ?? "Draft",
          body: draft,
        },
        message: `Draft ready for ${args.to ?? "recipient"}`,
      };
    }

    case "send_email": {
      return {
        type: "send_email",
        data: {
          to: args.to,
          subject: args.subject,
          body: args.body,
        },
        message: `Ready to send to ${args.to}`,
      };
    }

    case "search_emails": {
      try {
        const threads = await ctx.tenant.gmail.db.threads.search({
          limit: 100,
        });
        if (!Array.isArray(threads) || threads.length === 0) {
          return {
            type: "search_results",
            data: { query: args.query, results: [] },
            message: `No emails found for "${args.query}"`,
          };
        }

        const query = args.query.toLowerCase();
        const filtered = threads.filter((t: any) => {
          const data = t.data ?? {};
          const snippet = (data.snippet ?? "").toLowerCase();
          const subject = (data.subject ?? "").toLowerCase();
          return snippet.includes(query) || subject.includes(query);
        });

        const results = filtered.slice(0, 8).map((t: any) => {
          const data = t.data ?? {};
          return {
            id: data.id ?? t.entityId,
            snippet: data.snippet ?? "No preview",
            subject:
              data.subject ?? data.snippet?.substring(0, 60) ?? "No Subject",
          };
        });

        return {
          type: "search_results",
          data: { query: args.query, results, total: filtered.length },
          message: `Found ${filtered.length} emails matching "${args.query}"`,
        };
      } catch {
        return {
          type: "text",
          data: {},
          message: "Couldn't search emails. Make sure Gmail is connected.",
        };
      }
    }

    case "summarize_inbox": {
      try {
        const threads = await ctx.tenant.gmail.db.threads.search({
          limit: 20,
        });
        if (!Array.isArray(threads) || threads.length === 0) {
          return {
            type: "inbox_summary",
            data: { total: 0, important: [], newsletters: 0, promotions: 0 },
            message: "Your inbox is empty!",
          };
        }

        const important: any[] = [];
        let newsletters = 0;
        let promotions = 0;

        for (const thread of threads) {
          const data = thread.data ?? {};
          const snippet = (data.snippet ?? "").toLowerCase();
          if (
            snippet.includes("unsubscribe") ||
            snippet.includes("newsletter")
          ) {
            newsletters++;
          } else if (
            snippet.includes("offer") ||
            snippet.includes("discount") ||
            snippet.includes("promo")
          ) {
            promotions++;
          } else if (important.length < 5) {
            important.push({
              id: data.id ?? thread.entityId,
              snippet: data.snippet?.substring(0, 100) ?? "No preview",
              subject:
                data.subject ?? data.snippet?.substring(0, 60) ?? "No Subject",
            });
          }
        }

        return {
          type: "inbox_summary",
          data: {
            total: threads.length,
            important,
            newsletters,
            promotions,
          },
          message: `You have ${threads.length} emails. ${important.length} important, ${newsletters} newsletters, ${promotions} promotions.`,
        };
      } catch {
        return {
          type: "text",
          data: {},
          message: "Couldn't access your inbox. Make sure Gmail is connected.",
        };
      }
    }

    case "get_calendar_events": {
      try {
        const events = await ctx.tenant.googlecalendar.db.events.search({
          limit: 20,
        });
        if (!Array.isArray(events) || events.length === 0) {
          return {
            type: "calendar_events",
            data: { events: [] },
            message: "No upcoming events found.",
          };
        }

        const now = new Date();
        const filter = args.filter ?? "upcoming";

        const parsed = events
          .map((e: any) => {
            const data = e.data ?? {};
            const start = data.start?.dateTime ?? data.start?.date ?? null;
            return {
              id: e.entityId ?? e.id,
              title: data.summary ?? "Untitled",
              start: start ?? new Date().toISOString(),
              end: data.end?.dateTime ?? data.end?.date ?? null,
              hangoutLink: data.hangoutLink ?? null,
              isAllDay: !data.start?.dateTime,
            };
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.start).getTime() - new Date(b.start).getTime(),
          );

        let filtered = parsed;
        if (filter === "today") {
          const todayStr = now.toISOString().split("T")[0];
          filtered = parsed.filter(
            (e: any) => e.start.split("T")[0] === todayStr,
          );
        } else if (filter === "tomorrow") {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          filtered = parsed.filter(
            (e: any) => e.start.split("T")[0] === tomorrowStr,
          );
        }

        return {
          type: "calendar_events",
          data: { events: filtered.slice(0, 10) },
          message: `Found ${filtered.length} events.`,
        };
      } catch {
        return {
          type: "text",
          data: {},
          message:
            "Couldn't access your calendar. Make sure Google Calendar is connected.",
        };
      }
    }

    case "create_calendar_event": {
      const eventDate = parseNaturalDate(args.date, args.time);
      return {
        type: "create_event",
        data: {
          title: args.title ?? "New Event",
          date: eventDate.toISOString(),
          dateDisplay: args.date,
          time: args.time ?? "TBD",
          duration: args.duration ?? "1 hour",
          attendees: args.attendees ?? "",
          description: args.description ?? "",
          hangoutLink: null,
        },
        message: `Ready to create: ${args.title}`,
      };
    }

    case "reply_to_thread": {
      try {
        const threads = await ctx.tenant.gmail.db.threads.search({
          limit: 50,
        });
        const query = args.to.toLowerCase();
        const matchingThread = (threads ?? []).find((t: any) => {
          const data = t.data ?? {};
          const snippet = (data.snippet ?? "").toLowerCase();
          return snippet.includes(query);
        });

        if (!matchingThread) {
          return {
            type: "text",
            data: {},
            message: `Couldn't find a recent email from ${args.to}.`,
          };
        }

        const { draftReply } = await import("./agent");
        const threadData = matchingThread.data ?? {};
        const reply = await draftReply(
          threadData.subject ?? "Re: Your email",
          [{ from: args.to, body: threadData.snippet ?? "" }],
          args.context,
        );

        return {
          type: "reply_draft",
          data: {
            to: args.to,
            subject: threadData.subject ?? "Re: Your email",
            body: reply,
            threadId: threadData.id ?? matchingThread.entityId,
            tone: args.tone ?? "professional",
          },
          message: `Draft reply to ${args.to}`,
        };
      } catch {
        return {
          type: "text",
          data: {},
          message: `Couldn't find or reply to ${args.to}.`,
        };
      }
    }

    default:
      return {
        type: "text",
        data: {},
        message: `Unknown tool: ${toolName}`,
      };
  }
}

// ─── Main Agent Loop ─────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[],
  ctx: ToolExecutionContext,
): Promise<AgentResult> {
  const systemPrompt = `You are Lumon, an AI email and calendar assistant. You don't explain what you can do — you DO things.

When the user asks you to do something, call the appropriate tool immediately. Don't list options or ask clarifying questions unless truly ambiguous.

Rules:
- "send email to X about Y" → call send_email with a complete, professional draft
- "draft email to X about Y" → call draft_email
- "find/search/show emails about X" → call search_emails
- "summarize inbox/unread" → call summarize_inbox
- "what's on my calendar / schedule / meetings" → call get_calendar_events
- "create meeting/event tomorrow at X" → call create_calendar_event
- "reply to X about Y" → call reply_to_thread
- Always extract as much detail as possible from the user's message
- For send_email: write the full email body yourself — professional, concise, contextual
- For create_calendar_event: infer title, time, duration from context
- If the user says "send" — use send_email, not draft_email
- If the user says "draft" or "write" — use draft_email
- Be proactive. Fill in reasonable defaults. Don't ask for info you can infer.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  // Agent loop: allow up to 3 tool-calling rounds
  const MAX_ROUNDS = 3;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await callMiMoRaw(messages, agentTools, 1024);

    // If no tool calls, return the text response
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return {
        type: "text",
        data: {},
        message:
          response.content ??
          "I'm not sure what to do. Can you try rephrasing?",
      };
    }

    // Execute the first tool call
    const toolCall = response.tool_calls[0]!;
    const toolName = toolCall.function.name;
    let args: Record<string, any> = {};

    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error(
        `[Agent] Failed to parse tool args: ${toolCall.function.arguments}`,
      );
      return {
        type: "text",
        data: {},
        message: "I had trouble understanding the request. Can you try again?",
      };
    }

    // Execute the tool
    const result = await executeTool(toolName, args, ctx);

    // Add assistant message with tool call to history
    messages.push({
      role: "assistant",
      content: response.content,
      tool_calls: response.tool_calls,
    });

    // Add tool result to history
    messages.push({
      role: "tool",
      content: JSON.stringify(result),
      tool_call_id: toolCall.id,
    });

    // If the tool returned a non-text result, we're done
    if (result.type !== "text") {
      // Get a final natural language response from the model
      const finalResponse = await callMiMoRaw(messages, undefined, 200);
      return {
        ...result,
        message:
          finalResponse.content && finalResponse.content.length > 10
            ? finalResponse.content
            : result.message,
      };
    }

    // If it was a text result (error or clarification), continue the loop
    // so the model can try another tool
  }

  return {
    type: "text",
    data: {},
    message:
      "I tried but couldn't complete that action. Can you try rephrasing?",
  };
}

// ─── Standalone Functions (used by other routers) ────────────────────

async function callMiMo(
  messages: ChatMessage[],
  maxTokens = 500,
): Promise<string> {
  const result = await callMiMoRaw(messages, undefined, maxTokens);
  return result.content ?? "No response from AI.";
}

/**
 * Summarize an email thread into 2-3 concise bullet points.
 */
export async function summarizeThread(
  messages: { from: string; body: string }[],
): Promise<string> {
  if (messages.length === 0) return "No messages to summarize.";

  const threadText = messages
    .map((m) => `From: ${m.from}\n${m.body}`)
    .join("\n\n---\n\n");

  return callMiMo(
    [
      {
        role: "system",
        content:
          "You are an email assistant. Summarize email threads concisely in 2-3 bullet points. Focus on action items, decisions, and key information.",
      },
      {
        role: "user",
        content: `Summarize this email thread:\n\n${threadText}`,
      },
    ],
    300,
  );
}

/**
 * Draft a professional email based on context.
 */
export async function draftEmail(
  context: string,
  to: string,
  subject: string,
): Promise<string> {
  return callMiMo(
    [
      {
        role: "system",
        content:
          "You are a professional email writer. Draft clear, concise, and well-structured emails. Return only the email body text, no subject line or signature placeholders.",
      },
      {
        role: "user",
        content: `Draft a professional email.\nTo: ${to}\nSubject: ${subject}\nContext: ${context}\n\nReturn only the email body.`,
      },
    ],
    500,
  );
}

/**
 * Score email priority from 0.0 (low) to 1.0 (urgent).
 */
export async function scorePriority(
  subject: string,
  snippet: string,
): Promise<number> {
  const response = await callMiMo(
    [
      {
        role: "system",
        content:
          "Rate email priority. Return ONLY a number between 0.0 (low priority) and 1.0 (urgent). No text, just the number.",
      },
      {
        role: "user",
        content: `Subject: "${subject}"\nPreview: "${snippet}"`,
      },
    ],
    10,
  );

  const score = parseFloat(response.trim());
  return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
}

/**
 * Generate a draft reply based on the thread context.
 */
export async function draftReply(
  threadSubject: string,
  threadMessages: { from: string; body: string }[],
  userContext?: string,
): Promise<string> {
  const threadText = threadMessages
    .map((m) => `From: ${m.from}\n${m.body}`)
    .join("\n\n---\n\n");

  const contextNote = userContext
    ? `\n\nAdditional context from the user: ${userContext}`
    : "";

  return callMiMo(
    [
      {
        role: "system",
        content:
          "You are an email assistant. Draft a concise, professional reply to the last message in an email thread. Return only the reply body text.",
      },
      {
        role: "user",
        content: `Thread subject: ${threadSubject}\n\nThread messages:\n${threadText}${contextNote}\n\nDraft a reply to the last message.`,
      },
    ],
    400,
  );
}
