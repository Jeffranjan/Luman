"use client";

import * as React from "react";
import { api } from "~/trpc/react";
import {
  ArrowLeft,
  Sparkles,
  Archive,
  Reply,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useKeyboard } from "~/hooks/use-keyboard";
import { Button } from "~/components/ui/button";
import { EmailRenderer } from "./email-renderer";

export function ThreadView({ threadId }: { threadId: string }) {
  const router = useRouter();
  const replyRef = React.useRef<HTMLTextAreaElement>(null);
  const [replyText, setReplyText] = React.useState("");
  const [showReply, setShowReply] = React.useState(false);
  const utils = api.useUtils();

  const { data: thread, isLoading } = api.inbox.getThread.useQuery({
    threadId,
  });

  const generateSummary = api.inbox.generateSummary.useMutation();

  const archiveMutation = api.inbox.archiveThread.useMutation({
    onSuccess: () => {
      void utils.inbox.getThreads.invalidate();
      router.push("/dashboard");
    },
  });

  const deleteMutation = api.inbox.deleteThread.useMutation({
    onSuccess: () => {
      void utils.inbox.getThreads.invalidate();
      router.push("/dashboard");
    },
  });

  const replyMutation = api.inbox.replyToThread.useMutation({
    onSuccess: () => {
      setReplyText("");
      setShowReply(false);
      void utils.inbox.getThread.invalidate({ threadId });
    },
  });

  useKeyboard("escape", () => router.push("/dashboard"));
  useKeyboard("e", () => archiveMutation.mutate({ threadId }));
  useKeyboard("r", () => {
    setShowReply(true);
    setTimeout(() => replyRef.current?.focus(), 100);
  });

  if (isLoading) {
    return <div className="text-muted-foreground p-8">Loading thread...</div>;
  }

  if (!thread) {
    return <div className="text-destructive p-8">Thread not found.</div>;
  }

  const lastMessage = thread.messages[thread.messages.length - 1];

  const handleReply = () => {
    if (!replyText.trim() || !lastMessage) return;
    replyMutation.mutate({
      threadId,
      to: lastMessage.from,
      subject: thread.subject,
      body: replyText,
      inReplyTo: lastMessage.id,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:bg-muted rounded-full p-2 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <h1 className="truncate text-lg font-semibold">{thread.subject}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Archive (E)"
            onClick={() => archiveMutation.mutate({ threadId })}
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete (#)"
            onClick={() => deleteMutation.mutate({ threadId })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 overflow-y-auto p-6">
        {/* AI Summary Box */}
        <div className="bg-primary/5 border-primary/20 flex gap-4 rounded-xl border p-4">
          <div className="mt-1 shrink-0">
            <Sparkles className="text-primary h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-primary mb-1 text-sm font-semibold">
              AI Summary
            </h3>
            {thread.aiSummary ? (
              <p className="text-muted-foreground text-sm">
                {thread.aiSummary}
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Summary not generated yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generateSummary.isPending}
                  onClick={() => generateSummary.mutate({ threadId })}
                >
                  {generateSummary.isPending ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {thread.messages.map((msg: any, idx: number) => (
            <div
              key={msg.id || idx}
              className="bg-card overflow-hidden rounded-xl border"
            >
              <div className="bg-muted/20 flex items-center justify-between border-b p-4">
                <div>
                  <span className="font-semibold">{msg.from}</span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    to {msg.to || "me"}
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {new Date(msg.date).toLocaleString()}
                </div>
              </div>
              <div className="p-6 text-sm">
                <EmailRenderer html={msg.htmlBody} text={msg.body} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Box */}
      <div className="bg-background border-t p-4">
        <div className="mx-auto max-w-4xl">
          {showReply ? (
            <div className="space-y-3">
              <div className="text-muted-foreground text-sm">
                Replying to {lastMessage?.from}
              </div>
              <textarea
                ref={replyRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="bg-background focus:ring-primary/20 min-h-[120px] w-full resize-none rounded-lg border p-3 text-sm focus:ring-2 focus:outline-none"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReply(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="gap-2"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="flex cursor-pointer items-center gap-4"
              onClick={() => setShowReply(true)}
            >
              <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Reply className="h-5 w-5" />
              </div>
              <div className="bg-muted/50 text-muted-foreground hover:bg-muted flex h-10 flex-1 items-center rounded-full border px-4 text-sm transition">
                Reply to {lastMessage?.from}... (Press R)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
