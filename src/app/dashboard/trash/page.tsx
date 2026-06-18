"use client";

import { Trash2, RotateCcw } from "lucide-react";

export default function TrashPage() {
  return (
    <div
      className="flex h-full w-full flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header
        className="flex h-14 shrink-0 items-center px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h1
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--text)" }}
        >
          <Trash2 className="size-4" style={{ color: "var(--danger)" }} />
          Trash
        </h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="mb-4 flex size-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--danger-muted)" }}
        >
          <Trash2 className="size-7" style={{ color: "var(--danger)" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Trash is empty
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
          Items in trash are deleted after 30 days
        </p>
      </div>
    </div>
  );
}
