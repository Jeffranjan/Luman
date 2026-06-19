"use client";

import { Send } from "lucide-react";
import { motion } from "motion/react";

export default function SentPage() {
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
          <Send className="size-4" style={{ color: "var(--accent)" }} />
          Sent
        </h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="mb-4 flex size-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--accent-muted)" }}
        >
          <Send className="size-7" style={{ color: "var(--accent)" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Sent emails will appear here
        </p>
      </div>
    </div>
  );
}
