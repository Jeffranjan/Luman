"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useUIStore } from "~/store/ui";
import { useRouter } from "next/navigation";
import {
  Mail,
  Calendar,
  Settings,
  Search as SearchIcon,
  FileText,
  Sparkles,
} from "lucide-react";
import { api } from "~/trpc/react";
import { AnimatePresence, motion } from "motion/react";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setComposeModalOpen } =
    useUIStore();
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const { data: searchResults, isLoading } = api.search.query.useQuery(
    { query },
    { enabled: query.length > 2 },
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (command: () => void) => {
    setCommandPaletteOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          style={{ background: "var(--bg-overlay)" }}
          onClick={() => setCommandPaletteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className="flex w-[600px] max-w-[90vw] flex-col overflow-hidden"
              label="Global Command Menu"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                className="flex h-14 items-center px-5"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <SearchIcon
                  className="size-4 shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <Command.Input
                  autoFocus
                  placeholder="Search mail, events, people..."
                  value={query}
                  onValueChange={setQuery}
                  className="h-full flex-1 border-none bg-transparent px-3 text-sm outline-none"
                  style={{ color: "var(--text)" }}
                />
                <kbd
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  ⌘K
                </kbd>
              </div>

              <Command.List className="max-h-[320px] overflow-y-auto p-2">
                <Command.Empty
                  className="p-6 text-center text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {isLoading ? "Searching..." : "No results found."}
                </Command.Empty>

                {!query && (
                  <Command.Group heading="Suggestions" className="p-1">
                    {[
                      {
                        icon: Sparkles,
                        label: "Compose Email",
                        action: () => setComposeModalOpen(true),
                      },
                      {
                        icon: Mail,
                        label: "Go to Inbox",
                        action: () => router.push("/dashboard"),
                      },
                      {
                        icon: Calendar,
                        label: "Go to Calendar",
                        action: () => router.push("/dashboard/calendar"),
                      },
                      {
                        icon: Settings,
                        label: "Settings & Integrations",
                        action: () => router.push("/dashboard/integrations"),
                      },
                    ].map((item) => (
                      <Command.Item
                        key={item.label}
                        onSelect={() => runCommand(item.action)}
                        className="mb-0.5 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--accent-muted)";
                          e.currentTarget.style.color = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                      >
                        <item.icon className="size-4" />
                        {item.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {query && searchResults && searchResults.length > 0 && (
                  <Command.Group heading="Search Results" className="p-1">
                    {searchResults.map((result) => (
                      <Command.Item
                        key={result.id}
                        onSelect={() =>
                          runCommand(() => router.push(`/dashboard/thread/${result.id}`))
                        }
                        className="mb-0.5 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors"
                        style={{ color: "var(--text)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--accent-muted)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "var(--bg-secondary)" }}
                        >
                          {result.type === "email" ? (
                            <Mail
                              className="size-4"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          ) : (
                            <FileText
                              className="size-4"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col truncate">
                          <span
                            className="truncate font-medium"
                            style={{ color: "var(--text)" }}
                          >
                            {result.title}
                          </span>
                          <span
                            className="truncate text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {result.snippet}
                          </span>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
