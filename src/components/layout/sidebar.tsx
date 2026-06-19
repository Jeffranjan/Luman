"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Star,
  FileText,
  Send,
  AlertTriangle,
  Trash2,
  Calendar,
  Settings,
  Keyboard,
  ChevronDown,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useUIStore } from "~/store/ui";
import { motion, AnimatePresence } from "motion/react";

const workspaceItems = [
  { name: "Inbox", href: "/dashboard", icon: Inbox, badge: null },
  { name: "Starred", href: "/dashboard/starred", icon: Star, badge: null },
  { name: "Drafts", href: "/dashboard/drafts", icon: FileText, badge: null },
  { name: "Sent", href: "/dashboard/sent", icon: Send, badge: null },
  { name: "Spam", href: "/dashboard/spam", icon: AlertTriangle, badge: null },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2, badge: null },
  {
    name: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    badge: null,
  },
];

const settingsItems = [
  { name: "Integrations", href: "/dashboard/integrations", icon: Settings },
  { name: "Shortcuts", href: "/dashboard/shortcuts", icon: Keyboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <AnimatePresence mode="wait">
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-screen shrink-0 flex-col overflow-hidden border-r"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border)",
          }}
        >
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3 px-5">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ background: "var(--accent-muted)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--accent)" }}
              >
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                <rect x="2" y="4" width="20" height="16" rx="2" />
              </svg>
            </div>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Luman
            </span>
          </div>

          {/* Workspace Section */}
          <nav className="flex-1 overflow-y-auto px-3 py-2">
            <div className="mb-2">
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                <ChevronDown className="size-3" />
                Workspace
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              {workspaceItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-180",
                    )}
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                      background: isActive
                        ? "var(--accent-muted)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background =
                          "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full"
                        style={{ background: "var(--accent)" }}
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 24,
                        }}
                      />
                    )}
                    <item.icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Settings Section */}
            <div className="mt-6 mb-2">
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                Settings
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              {settingsItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-180"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                      background: isActive
                        ? "var(--accent-muted)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background =
                          "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom — Connection Status */}
          <div
            className="border-t px-3 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="size-2 animate-pulse rounded-full bg-green-500" />
              <span
                className="text-[12px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Connected
              </span>
            </div>
            <div
              className="px-3 py-1.5 text-[11px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              ⌘K for Command Palette
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
