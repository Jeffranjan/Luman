"use client";

import { Sidebar } from "./sidebar";
import { ComposeModal } from "~/components/compose/compose-modal";
import { CommandPalette } from "~/components/layout/command-palette";
import { useKeyboard } from "~/hooks/use-keyboard";
import { useUIStore } from "~/store/ui";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import * as React from "react";
import { api } from "~/trpc/react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: { type: string; data: any } | null;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const aiChat = api.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, action: data.action },
      ]);
      setIsThinking(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
      setIsThinking(false);
    },
  });

  useKeyboard("]", () => toggleSidebar());

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsThinking(true);
    aiChat.mutate({ message: userMsg, history: messages });
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    // Auto-send
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsThinking(true);
    aiChat.mutate({ message: text, history: messages });
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
                <Sparkles
                  className="size-4"
                  style={{ color: "var(--accent)" }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  AI Assistant
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
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div
                    className="mb-4 flex size-14 items-center justify-center rounded-2xl"
                    style={{ background: "var(--accent-muted)" }}
                  >
                    <Sparkles
                      className="size-6"
                      style={{ color: "var(--accent)" }}
                    />
                  </div>
                  <h3
                    className="mb-1 text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    AI Assistant
                  </h3>
                  <p
                    className="mb-6 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Ask me anything about your emails and calendar
                  </p>
                  <div className="flex w-full flex-col gap-2">
                    {[
                      "Summarize my inbox",
                      "Find meetings today",
                      "Draft email to John",
                      "What's on my calendar tomorrow?",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors"
                        style={{
                          background: "var(--bg-card)",
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
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "" : ""}`}
                        style={{
                          background:
                            msg.role === "user"
                              ? "var(--accent)"
                              : "var(--bg-card)",
                          color:
                            msg.role === "user"
                              ? "var(--text-inverse)"
                              : "var(--text)",
                          border:
                            msg.role === "user"
                              ? "none"
                              : "1px solid var(--border)",
                        }}
                      >
                        <div className="leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        {msg.action?.type === "draft" && (
                          <div
                            className="mt-2 pt-2"
                            style={{ borderTop: "1px solid var(--border)" }}
                          >
                            <div className="flex gap-2">
                              <button
                                className="rounded-full px-3 py-1 text-[10px] font-medium"
                                style={{
                                  background: "var(--accent)",
                                  color: "var(--text-inverse)",
                                }}
                              >
                                Insert
                              </button>
                              <button
                                className="rounded-full px-3 py-1 text-[10px] font-medium"
                                style={{
                                  background: "var(--bg-secondary)",
                                  color: "var(--text-secondary)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div
                        className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <Loader2
                          className="size-3 animate-spin"
                          style={{ color: "var(--accent)" }}
                        />
                        <span style={{ color: "var(--text-tertiary)" }}>
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}
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
                  placeholder="Ask anything..."
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
