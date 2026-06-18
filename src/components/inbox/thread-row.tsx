"use client";

import { Star, Clock, Archive, Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { motion } from "motion/react";

interface ThreadRowProps {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  date: string;
  unread: boolean;
  priority?: string | null;
  pinned: boolean;
  isSelected: boolean;
  onClick: () => void;
  onArchive: (e: React.MouseEvent) => void;
}

export function ThreadRow({
  id,
  subject,
  snippet,
  from,
  date,
  unread,
  priority,
  pinned,
  isSelected,
  onClick,
  onArchive,
}: ThreadRowProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));

  return (
    <motion.div
      onClick={onClick}
      layout
      className={cn(
        "group relative flex cursor-pointer items-center gap-4 px-5 transition-all duration-180",
      )}
      style={{
        height: 72,
        background: isSelected ? "var(--accent-muted)" : "transparent",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      whileHover={{
        backgroundColor: isSelected ? undefined : "var(--bg-card-hover)",
      }}
      transition={{ duration: 0.12 }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="inbox-selected"
          className="absolute top-2 bottom-2 left-0 w-0.75 rounded-full"
          style={{ background: "var(--accent)" }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        />
      )}

      {/* Unread dot */}
      {unread && (
        <div
          className="size-2 shrink-0 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      )}
      {!unread && <div className="size-2 shrink-0" />}

      {/* Sender */}
      <div
        className="flex w-44 shrink-0 items-center gap-2 truncate"
        style={{
          color: unread ? "var(--text)" : "var(--text-secondary)",
          fontWeight: unread ? 600 : 500,
        }}
      >
        {pinned && (
          <Star
            className="size-3.5 fill-current"
            style={{ color: "var(--warning)" }}
          />
        )}
        <span className="truncate text-[13px]">{from}</span>
      </div>

      {/* Subject + Preview */}
      <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
        <span
          className="truncate text-[13px]"
          style={{
            color: unread ? "var(--text)" : "var(--text-secondary)",
            fontWeight: unread ? 600 : 400,
          }}
        >
          {subject}
        </span>
        <span
          className="hidden truncate text-[12px] sm:inline"
          style={{ color: "var(--text-tertiary)" }}
        >
          — {snippet}
        </span>
      </div>

      {/* Date */}
      <div
        className="shrink-0 text-[12px] whitespace-nowrap group-hover:hidden"
        style={{ color: "var(--text-tertiary)" }}
      >
        {formattedDate}
      </div>

      {/* Hover Actions */}
      <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
        <button
          className="flex size-7 items-center justify-center rounded-md transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onClick={onArchive}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
          title="Archive (E)"
        >
          <Archive className="size-3.5" />
        </button>
        <button
          className="flex size-7 items-center justify-center rounded-md transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
          title="Snooze (S)"
        >
          <Clock className="size-3.5" />
        </button>
        <button
          className="flex size-7 items-center justify-center rounded-md transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-muted)";
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
          title="Trash (#)"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
