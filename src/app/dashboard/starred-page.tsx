"use client";

import { api } from "~/trpc/react";
import { Star } from "lucide-react";
import Link from "next/link";

export default function StarredPage() {
  const { data: threads = [], isLoading } = api.inbox.getThreads.useQuery();

  const starred = threads.filter((t: any) => t.pinned);

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <header className="flex items-center px-6 h-14 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5" />
          Starred
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : starred.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
            <Star className="w-12 h-12 mb-4 opacity-30" />
            <p>No starred threads</p>
          </div>
        ) : (
          <div className="divide-y">
            {starred.map((thread: any) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{thread.subject}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {thread.from} — {thread.snippet}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {new Date(thread.date).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
