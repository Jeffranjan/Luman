"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { X, Maximize2, Minimize2, Send, Sparkles, Loader2 } from "lucide-react";
import { useUIStore } from "~/store/ui";
import { useKeyboard } from "~/hooks/use-keyboard";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { AnimatePresence, motion } from "motion/react";

export function ComposeModal() {
  const { composeModalOpen, setComposeModalOpen } = useUIStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [to, setTo] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const sendMutation = api.inbox.sendEmail.useMutation({
    onSuccess: () => {
      setComposeModalOpen(false);
      editor?.commands.clearContent();
      setTo("");
      setSubject("");
      setIsSending(false);
    },
    onError: () => setIsSending(false),
  });

  const aiDraftMutation = api.inbox.aiDraft.useMutation({
    onSuccess: (data) => {
      const html = data.draft
        .split("\n\n")
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
      editor?.commands.setContent(html);
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm focus:outline-none max-w-none min-h-[200px] p-5",
      },
    },
  });

  useKeyboard("c", (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      (e.target as HTMLElement).isContentEditable
    )
      return;
    setComposeModalOpen(true);
  });

  useKeyboard(
    "escape",
    () => {
      if (composeModalOpen) setComposeModalOpen(false);
    },
    { enableOnFormTags: true },
  );

  React.useEffect(() => {
    if (!composeModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [composeModalOpen, to, subject]);

  if (!composeModalOpen) return null;

  const handleSend = () => {
    if (!to || isSending) return;
    setIsSending(true);
    sendMutation.mutate({ to, subject, body: editor?.getText() ?? "" });
  };

  const handleAIDraft = () => {
    if (!to) return;
    editor?.commands.setContent("<p><em>Generating draft...</em></p>");
    aiDraftMutation.mutate({
      to,
      subject: subject || "Untitled",
      context: editor?.getText() ?? undefined,
    });
  };

  return (
    <AnimatePresence>
      {composeModalOpen && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0"
            style={{ background: "var(--bg-overlay)" }}
            onClick={() => setComposeModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className={cn(
              "pointer-events-auto relative flex flex-col overflow-hidden",
              isExpanded ? "h-[80vh] w-[80vw]" : "h-[600px] w-[640px]",
            )}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-2xl)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-3"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-secondary)",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                New Message
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex hidden size-7 items-center justify-center rounded-md transition-colors sm:flex"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {isExpanded ? (
                    <Minimize2 className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                </button>
                <button
                  onClick={() => setComposeModalOpen(false)}
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
            </div>

            {/* Fields */}
            <div
              className="flex shrink-0 flex-col"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <input
                type="text"
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-5 py-2.5 text-sm outline-none"
                style={{
                  background: "transparent",
                  color: "var(--text)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              />
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-5 py-2.5 text-sm font-semibold outline-none"
                style={{ background: "transparent", color: "var(--text)" }}
              />
            </div>

            {/* Editor */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ background: "var(--bg)" }}
              onClick={() => editor?.commands.focus()}
            >
              <EditorContent editor={editor} />
            </div>

            {/* Footer */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-3"
              style={{
                borderTop: "1px solid var(--border)",
                background: "var(--bg-secondary)",
              }}
            >
              <button
                onClick={handleAIDraft}
                disabled={!to || aiDraftMutation.isPending}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  background: "var(--accent-muted)",
                  color: "var(--accent)",
                  border:
                    "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                }}
              >
                {aiDraftMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                AI Draft
              </button>
              <button
                onClick={handleSend}
                disabled={!to || isSending}
                className="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 disabled:opacity-50"
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
                Send
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
