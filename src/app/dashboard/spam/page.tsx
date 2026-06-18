"use client";

import { AlertTriangle } from "lucide-react";

export default function SpamPage() {
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
          <AlertTriangle
            className="size-4"
            style={{ color: "var(--warning, #F5C563)" }}
          />
          Spam
        </h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="mb-4 flex size-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--warning-muted, rgba(245,197,99,0.12))" }}
        >
          <AlertTriangle
            className="size-7"
            style={{ color: "var(--warning, #F5C563)" }}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          No spam messages
        </p>
        <div
          className="mt-3 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            background: "var(--warning-muted, rgba(245,197,99,0.12))",
            color: "var(--warning, #F5C563)",
          }}
        >
          ✓ Your inbox is clean
        </div>
      </div>
    </div>
  );
}
