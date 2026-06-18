"use client";

import { Keyboard } from "lucide-react";
import { motion } from "framer-motion";

const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["J"], description: "Next email" },
      { keys: ["K"], description: "Previous email" },
      { keys: ["Enter"], description: "Open email" },
      { keys: ["Esc"], description: "Go back / Close" },
      { keys: ["]"], description: "Toggle sidebar" },
    ],
  },
  {
    title: "Email Actions",
    shortcuts: [
      { keys: ["E"], description: "Archive email" },
      { keys: ["S"], description: "Snooze email" },
      { keys: ["#"], description: "Delete email" },
      { keys: ["R"], description: "Reply" },
      { keys: ["C"], description: "Compose new email" },
    ],
  },
  {
    title: "AI Actions",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open Command Palette" },
      { keys: ["⌘", "Enter"], description: "Send email" },
    ],
  },
  {
    title: "Calendar",
    shortcuts: [
      { keys: ["T"], description: "Go to today" },
      { keys: ["D"], description: "Day view" },
      { keys: ["W"], description: "Week view" },
      { keys: ["M"], description: "Month view" },
    ],
  },
  {
    title: "Search",
    shortcuts: [
      { keys: ["/"], description: "Focus search" },
      { keys: ["⌘", "K"], description: "Command palette" },
    ],
  },
];

function KeyBadge({ label }: { label: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
      whileTap={{ y: 1 }}
      className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2.5 text-xs font-semibold"
      style={{
        background: "var(--bg-secondary)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {label}
    </motion.div>
  );
}

export default function ShortcutsPage() {
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
          <Keyboard className="size-4" style={{ color: "var(--accent)" }} />
          Keyboard Shortcuts
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {shortcutGroups.map((group, groupIdx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.05 }}
            >
              <h2
                className="mb-3 text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                {group.title}
              </h2>
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {group.shortcuts.map((shortcut, idx) => (
                  <motion.div
                    key={shortcut.description}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIdx * 0.05 + idx * 0.02 }}
                    className="flex items-center justify-between px-5 py-3 transition-colors"
                    style={{
                      borderBottom:
                        idx < group.shortcuts.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span
                          key={keyIdx}
                          className="flex items-center gap-1.5"
                        >
                          {keyIdx > 0 && (
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              +
                            </span>
                          )}
                          <KeyBadge label={key} />
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
