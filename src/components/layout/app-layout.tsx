"use client";

import { Sidebar } from "./sidebar";
import { ComposeModal } from "~/components/compose/compose-modal";
import { CommandPalette } from "~/components/layout/command-palette";
import { useKeyboard } from "~/hooks/use-keyboard";
import { useUIStore } from "~/store/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Mail,
  Calendar,
  Search,
  Inbox,
  Check,
  Edit3,
  Clock,
  Users,
  Video,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import * as React from "react";
import { api } from "~/trpc/react";

// ─── Types ───────────────────────────────────────────────────────────

type AgentMessageType =
  | "draft_email"
  | "send_email"
  | "search_results"
  | "inbox_summary"
  | "calendar_events"
  | "create_event"
  | "reply_draft"
  | "text";

interface AgentResultData {
  type: AgentMessageType;
  data: any;
  message: string;
}

type AgentStatus = "idle" | "thinking" | "planning" | "preview" | "success";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  result?: AgentResultData | null;
  status?: AgentStatus;
}

// ─── Thinking Animation ──────────────────────────────────────────────

function ThinkingAnimation() {
  const steps = [
    "Understanding your request",
    "Searching context",
    "Preparing action",
  ];
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex size-8 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="size-8 rounded-full"
              style={{
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
              }}
            />
            <Sparkles
              className="absolute size-3.5"
              style={{ color: "var(--accent)" }}
            />
          </div>
          <div>
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium"
              style={{ color: "var(--text)" }}
            >
              {steps[currentStep]}
            </motion.p>
            <div className="mt-1 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="size-1 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Action Cards ────────────────────────────────────────────────────

function EmailDraftCard({
  data,
  onSend,
  onEdit,
  onCancel,
  isSending,
}: {
  data: { to: string; subject: string; body: string };
  onSend: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isSending: boolean;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "var(--accent-muted)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Mail className="size-4" style={{ color: "var(--accent)" }} />
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Email Draft
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        <div>
          <p
            className="mb-0.5 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            To
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {data.to || "recipient@example.com"}
          </p>
        </div>
        <div>
          <p
            className="mb-0.5 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Subject
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {data.subject}
          </p>
        </div>
        <div>
          <p
            className="mb-1 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Body
          </p>
          <p
            className="max-h-32 overflow-y-auto text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {data.body}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 px-4 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={onSend}
          disabled={isSending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
          style={{
            background: "var(--accent)",
            color: "var(--text-inverse)",
          }}
        >
          {isSending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Send className="size-3" />
          )}
          {isSending ? "Sending..." : "Send"}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Edit3 className="size-3" />
          Edit
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}

function EventCard({
  data,
  onCreate,
  onEdit,
  onCancel,
  isCreating,
}: {
  data: {
    title: string;
    dateDisplay: string;
    time: string;
    duration: string;
    attendees: string;
    description: string;
  };
  onCreate: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isCreating: boolean;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "color-mix(in srgb, #4B8CFF 12%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Calendar className="size-4" style={{ color: "#4B8CFF" }} />
        <span className="text-xs font-semibold" style={{ color: "#4B8CFF" }}>
          New Event
        </span>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {data.title}
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Clock
              className="size-3"
              style={{ color: "var(--text-tertiary)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {data.dateDisplay} · {data.time} · {data.duration}
            </span>
          </div>
          {data.attendees && (
            <div className="flex items-center gap-1.5">
              <Users
                className="size-3"
                style={{ color: "var(--text-tertiary)" }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {data.attendees}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Video className="size-3" style={{ color: "#4B8CFF" }} />
          <span className="text-xs" style={{ color: "#4B8CFF" }}>
            Google Meet
          </span>
        </div>
      </div>

      <div
        className="flex gap-2 px-4 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={onCreate}
          disabled={isCreating}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
          style={{ background: "#4B8CFF", color: "#fff" }}
        >
          {isCreating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Calendar className="size-3" />
          )}
          {isCreating ? "Creating..." : "Create Event"}
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Edit3 className="size-3" />
          Edit
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}

function SearchResultsCard({
  data,
}: {
  data: { query: string; results: any[]; total: number };
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "color-mix(in srgb, #725BFF 12%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <Search className="size-4" style={{ color: "#725BFF" }} />
          <span className="text-xs font-semibold" style={{ color: "#725BFF" }}>
            Search Results
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: "color-mix(in srgb, #725BFF 20%, transparent)",
            color: "#725BFF",
          }}
        >
          {data.total} found
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {data.results.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              No emails found for &quot;{data.query}&quot;
            </p>
          </div>
        ) : (
          data.results.slice(0, 5).map((result: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 transition-colors"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Mail
                className="size-3.5 shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {result.subject ?? "No Subject"}
                </p>
                <p
                  className="truncate text-[11px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {result.snippet?.substring(0, 60) ?? "No preview"}
                </p>
              </div>
              <ChevronRight
                className="size-3 shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              />
            </div>
          ))
        )}
      </div>

      {data.results.length > 5 && (
        <div
          className="flex items-center justify-center gap-1 px-4 py-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span
            className="text-[11px] font-medium"
            style={{ color: "#725BFF" }}
          >
            View all {data.total} results
          </span>
          <ArrowRight className="size-3" style={{ color: "#725BFF" }} />
        </div>
      )}
    </div>
  );
}

function InboxSummaryCard({
  data,
}: {
  data: {
    total: number;
    important: any[];
    newsletters: number;
    promotions: number;
  };
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "color-mix(in srgb, var(--accent) 12%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Inbox className="size-4" style={{ color: "var(--accent)" }} />
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Inbox Summary
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--accent-muted)",
            color: "var(--accent)",
          }}
        >
          {data.total} total
        </span>
      </div>

      <div className="space-y-3 p-4">
        {/* Stats */}
        <div className="flex gap-3">
          {[
            {
              label: "Important",
              value: data.important.length,
              color: "var(--accent)",
            },
            { label: "Newsletters", value: data.newsletters, color: "#4B8CFF" },
            { label: "Promotions", value: data.promotions, color: "#725BFF" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-xl p-2.5 text-center"
              style={{ background: "var(--bg-secondary)" }}
            >
              <p className="text-lg font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p
                className="text-[10px] font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Important emails */}
        {data.important.length > 0 && (
          <div>
            <p
              className="mb-2 text-[10px] font-medium tracking-wider uppercase"
              style={{ color: "var(--text-tertiary)" }}
            >
              Important
            </p>
            <div className="space-y-1.5">
              {data.important.map((email: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <div
                    className="size-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                  <p
                    className="min-w-0 flex-1 truncate text-xs"
                    style={{ color: "var(--text)" }}
                  >
                    {email.snippet?.substring(0, 60) ?? email.subject}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested actions */}
        <div>
          <p
            className="mb-2 text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Suggested Actions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Reply to important",
              "Archive promotions",
              "Read newsletters",
            ].map((action) => (
              <span
                key={action}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarEventsCard({ data }: { data: { events: any[] } }) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "color-mix(in srgb, #4B8CFF 12%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Calendar className="size-4" style={{ color: "#4B8CFF" }} />
        <span className="text-xs font-semibold" style={{ color: "#4B8CFF" }}>
          Calendar
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {data.events.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              No upcoming events
            </p>
          </div>
        ) : (
          data.events.map((event: any, i: number) => {
            const startDate = new Date(event.start);
            const timeStr = event.isAllDay
              ? "All day"
              : startDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });
            const dateStr = startDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{
                    background: "color-mix(in srgb, #4B8CFF 12%, transparent)",
                  }}
                >
                  <Calendar className="size-3.5" style={{ color: "#4B8CFF" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {event.title}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {dateStr} · {timeStr}
                  </p>
                </div>
                {event.hangoutLink && (
                  <a
                    href={event.hangoutLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium"
                    style={{
                      background:
                        "color-mix(in srgb, #4B8CFF 12%, transparent)",
                      color: "#4B8CFF",
                    }}
                  >
                    <Video className="size-2.5" />
                    Join
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SuccessCard({ message, type }: { message: string; type: string }) {
  const icon =
    type === "send_email" ? (
      <Mail className="size-5" style={{ color: "var(--accent)" }} />
    ) : (
      <Calendar className="size-5" style={{ color: "#4B8CFF" }} />
    );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex size-10 items-center justify-center rounded-full"
        style={{
          background:
            type === "send_email"
              ? "var(--accent-muted)"
              : "color-mix(in srgb, #4B8CFF 12%, transparent)",
        }}
      >
        <Check className="size-5" style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
          {message}
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          {new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────

export function AppLayout({ children }: { children: React.ReactNode }) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const agentMutation = api.ai.agent.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          result: data,
          status: data.type === "text" ? "idle" : "preview",
        },
      ]);
      setIsThinking(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          status: "idle",
        },
      ]);
      setIsThinking(false);
    },
  });

  const confirmSendMutation = api.ai.confirmSend.useMutation({
    onSuccess: (data, variables) => {
      if (data.success) {
        // Replace the last assistant message with success
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          if (lastIdx >= 0 && newMsgs[lastIdx]?.role === "assistant") {
            newMsgs[lastIdx] = {
              role: "assistant",
              content: `Email sent to ${variables.to}`,
              status: "success",
              result: {
                type: "send_email",
                data: variables,
                message: `✓ Email sent to ${variables.to}`,
              },
            };
          }
          return newMsgs;
        });
      }
      setIsSending(false);
    },
    onError: () => {
      setIsSending(false);
    },
  });

  const confirmCreateEventMutation = api.ai.confirmCreateEvent.useMutation({
    onSuccess: (data, variables) => {
      if (data.success) {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          if (lastIdx >= 0 && newMsgs[lastIdx]?.role === "assistant") {
            newMsgs[lastIdx] = {
              role: "assistant",
              content: `✓ Event created: ${variables.title}`,
              status: "success",
              result: {
                type: "create_event",
                data: {
                  ...variables,
                  hangoutLink: data.hangoutLink,
                },
                message: `✓ Event created: ${variables.title}`,
              },
            };
          }
          return newMsgs;
        });
      }
      setIsCreating(false);
    },
    onError: () => {
      setIsCreating(false);
    },
  });

  useKeyboard("]", () => toggleSidebar());

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsThinking(true);
    agentMutation.mutate({ message: userMsg, history: messages });
  };

  const handleSuggestion = (text: string) => {
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsThinking(true);
    agentMutation.mutate({ message: text, history: messages });
  };

  const handleConfirmSend = (data: {
    to: string;
    subject: string;
    body: string;
  }) => {
    setIsSending(true);
    confirmSendMutation.mutate(data);
  };

  const handleConfirmCreateEvent = (data: {
    title: string;
    startDateTime: string;
    endDateTime: string;
    description?: string;
    attendees?: string[];
  }) => {
    setIsCreating(true);
    confirmCreateEventMutation.mutate(data);
  };

  const handleEditDraft = (data: {
    to: string;
    subject: string;
    body: string;
  }) => {
    // Open compose modal with pre-filled data
    // For now, put the content in the input for editing
    setInput(
      `Send email to ${data.to}\nSubject: ${data.subject}\n\n${data.body}`,
    );
  };

  const handleCancelLast = () => {
    setMessages((prev) => prev.slice(0, -1));
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <Sidebar />
      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        {children}
      </main>

      {/* AI Drawer */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-screen shrink-0 flex-col overflow-hidden border-l"
            style={{
              background: "var(--bg-sidebar)",
              borderColor: "var(--border)",
            }}
          >
            {/* Header */}
            <div
              className="flex h-14 shrink-0 items-center justify-between border-b px-5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex size-6 items-center justify-center rounded-md"
                  style={{ background: "var(--accent-muted)" }}
                >
                  <Sparkles
                    className="size-3.5"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Lumon
                </span>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                className="flex size-7 items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {messages.length === 0 ? (
                /* Idle State */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 flex size-14 items-center justify-center rounded-2xl"
                    style={{ background: "var(--accent-muted)" }}
                  >
                    <Sparkles
                      className="size-6"
                      style={{ color: "var(--accent)" }}
                    />
                  </motion.div>
                  <h3
                    className="mb-1 text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    Ask Lumon
                  </h3>
                  <p
                    className="mb-6 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Your AI email & calendar agent
                  </p>
                  <div className="flex w-full flex-col gap-2">
                    {[
                      {
                        icon: Mail,
                        text: "Draft an email",
                        color: "var(--accent)",
                      },
                      {
                        icon: Calendar,
                        text: "Create a meeting",
                        color: "#4B8CFF",
                      },
                      { icon: Search, text: "Find invoices", color: "#725BFF" },
                      {
                        icon: Inbox,
                        text: "Summarize inbox",
                        color: "var(--accent)",
                      },
                    ].map((s) => (
                      <button
                        key={s.text}
                        onClick={() => handleSuggestion(s.text)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = s.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        <s.icon
                          className="size-3.5"
                          style={{ color: "var(--text-tertiary)" }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {s.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx}>
                      {msg.role === "user" ? (
                        /* User Message */
                        <div className="flex justify-end">
                          <div
                            className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
                            style={{
                              background: "var(--accent)",
                              color: "var(--text-inverse)",
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ) : msg.status === "success" && msg.result ? (
                        /* Success State */
                        <SuccessCard
                          message={msg.content}
                          type={msg.result.type}
                        />
                      ) : msg.result && msg.result.type !== "text" ? (
                        /* Preview State — Action Cards */
                        <div>
                          {msg.result.type === "draft_email" && (
                            <EmailDraftCard
                              data={msg.result.data}
                              onSend={() => handleConfirmSend(msg.result!.data)}
                              onEdit={() => handleEditDraft(msg.result!.data)}
                              onCancel={handleCancelLast}
                              isSending={isSending}
                            />
                          )}
                          {msg.result.type === "send_email" && (
                            <EmailDraftCard
                              data={msg.result.data}
                              onSend={() => handleConfirmSend(msg.result!.data)}
                              onEdit={() => handleEditDraft(msg.result!.data)}
                              onCancel={handleCancelLast}
                              isSending={isSending}
                            />
                          )}
                          {msg.result.type === "reply_draft" && (
                            <EmailDraftCard
                              data={msg.result.data}
                              onSend={() => handleConfirmSend(msg.result!.data)}
                              onEdit={() => handleEditDraft(msg.result!.data)}
                              onCancel={handleCancelLast}
                              isSending={isSending}
                            />
                          )}
                          {msg.result.type === "search_results" && (
                            <SearchResultsCard data={msg.result.data} />
                          )}
                          {msg.result.type === "inbox_summary" && (
                            <InboxSummaryCard data={msg.result.data} />
                          )}
                          {msg.result.type === "calendar_events" && (
                            <CalendarEventsCard data={msg.result.data} />
                          )}
                          {msg.result.type === "create_event" && (
                            <EventCard
                              data={msg.result.data}
                              onCreate={() =>
                                handleConfirmCreateEvent({
                                  title: msg.result!.data.title,
                                  startDateTime: msg.result!.data.date,
                                  endDateTime: new Date(
                                    new Date(msg.result!.data.date).getTime() +
                                      60 * 60 * 1000,
                                  ).toISOString(),
                                  description: msg.result!.data.description,
                                  attendees: msg.result!.data.attendees
                                    ? msg
                                        .result!.data.attendees.split(",")
                                        .map((s: string) => s.trim())
                                    : [],
                                })
                              }
                              onEdit={() => {
                                const d = msg.result!.data;
                                setInput(
                                  `Create event: ${d.title} on ${d.dateDisplay} at ${d.time}`,
                                );
                              }}
                              onCancel={handleCancelLast}
                              isCreating={isCreating}
                            />
                          )}
                        </div>
                      ) : (
                        /* Text Response */
                        <div className="flex justify-start">
                          <div
                            className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
                            style={{
                              background: "var(--bg-card)",
                              color: "var(--text)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking State */}
                  {isThinking && <ThinkingAnimation />}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div
              className="shrink-0 border-t px-4 py-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2.5"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                }}
              >
                <Sparkles
                  className="size-4 shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Tell Lumon what to do..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text)" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="flex size-7 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                  style={{
                    background: "var(--accent)",
                    color: "var(--text-inverse)",
                  }}
                >
                  <Send className="size-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Toggle Button */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed right-6 bottom-6 flex size-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          style={{
            background: "var(--accent)",
            color: "var(--text-inverse)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <Sparkles className="size-5" />
        </button>
      )}

      <ComposeModal />
      <CommandPalette />
    </div>
  );
}
