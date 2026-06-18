"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ThreadRow } from "./thread-row";
import { api } from "~/trpc/react";
import { useKeyboard } from "~/hooks/use-keyboard";
import { useRouter } from "next/navigation";

export function ThreadList() {
  const router = useRouter();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { data: threads = [], isLoading } = api.inbox.getThreads.useQuery(
    undefined,
    {
      refetchInterval: 30_000, // Poll every 30s for new data
    },
  );
  const utils = api.useUtils();

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const archiveMutation = api.inbox.archiveThread.useMutation({
    onMutate: async ({ threadId }) => {
      await utils.inbox.getThreads.cancel();
      const previousThreads = utils.inbox.getThreads.getData();
      utils.inbox.getThreads.setData(undefined, (old) =>
        old?.filter((t) => t.id !== threadId),
      );
      return { previousThreads };
    },
    onError: (_err, _vars, context) => {
      utils.inbox.getThreads.setData(undefined, context?.previousThreads);
    },
    onSettled: () => {
      utils.inbox.getThreads.invalidate();
    },
  });

  const deleteMutation = api.inbox.deleteThread.useMutation({
    onMutate: async ({ threadId }) => {
      await utils.inbox.getThreads.cancel();
      const previousThreads = utils.inbox.getThreads.getData();
      utils.inbox.getThreads.setData(undefined, (old) =>
        old?.filter((t) => t.id !== threadId),
      );
      return { previousThreads };
    },
    onError: (_err, _vars, context) => {
      utils.inbox.getThreads.setData(undefined, context?.previousThreads);
    },
    onSettled: () => {
      utils.inbox.getThreads.invalidate();
    },
  });

  const snoozeMutation = api.inbox.snoozeThread.useMutation({
    onMutate: async ({ threadId }) => {
      await utils.inbox.getThreads.cancel();
      const previousThreads = utils.inbox.getThreads.getData();
      utils.inbox.getThreads.setData(undefined, (old) =>
        old?.filter((t) => t.id !== threadId),
      );
      return { previousThreads };
    },
    onError: (_err, _vars, context) => {
      utils.inbox.getThreads.setData(undefined, context?.previousThreads);
    },
    onSettled: () => {
      utils.inbox.getThreads.invalidate();
    },
  });

  const rowVirtualizer = useVirtualizer({
    count: threads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  // Keyboard navigation — fix: compute new index inside setState callback
  useKeyboard("j", () => {
    setSelectedIndex((prev) => {
      const next = Math.min(prev + 1, threads.length - 1);
      rowVirtualizer.scrollToIndex(next);
      return next;
    });
  });

  useKeyboard("k", () => {
    setSelectedIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      rowVirtualizer.scrollToIndex(next);
      return next;
    });
  });

  useKeyboard("e", () => {
    if (threads[selectedIndex]) {
      archiveMutation.mutate({ threadId: threads[selectedIndex]!.id });
    }
  });

  // Delete key (#) — trash thread
  useKeyboard("#", () => {
    if (threads[selectedIndex]) {
      deleteMutation.mutate({ threadId: threads[selectedIndex]!.id });
    }
  });

  // Snooze (s) — snooze for 1 hour
  useKeyboard("s", () => {
    if (threads[selectedIndex]) {
      const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      snoozeMutation.mutate({
        threadId: threads[selectedIndex]!.id,
        snoozeUntil,
      });
    }
  });

  useKeyboard("enter", () => {
    if (threads[selectedIndex]) {
      router.push(`/dashboard/thread/${threads[selectedIndex]!.id}`);
    }
  });

  if (isLoading) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Loading inbox...
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center">
        <div className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-2xl">🎉</span>
        </div>
        <p>Inbox Zero</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const thread = threads[virtualRow.index];
          if (!thread) return null;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ThreadRow
                {...thread}
                isSelected={selectedIndex === virtualRow.index}
                onClick={() => {
                  setSelectedIndex(virtualRow.index);
                  router.push(`/dashboard/thread/${thread.id}`);
                }}
                onArchive={(e) => {
                  e.stopPropagation();
                  archiveMutation.mutate({ threadId: thread.id });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
