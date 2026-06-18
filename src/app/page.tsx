"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Mail,
  Calendar,
  Sparkles,
  Search,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Animated Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full opacity-[0.15] blur-[120px]"
          style={{ background: "#725BFF" }}
        />
        <div
          className="absolute right-1/4 bottom-1/3 h-[500px] w-[500px] rounded-full opacity-[0.1] blur-[100px]"
          style={{ background: "#A7D7A8" }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[400px] w-[400px] rounded-full opacity-[0.08] blur-[80px]"
          style={{ background: "#4B8CFF" }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div
            className="flex h-14 items-center justify-between rounded-2xl px-6"
            style={{
              background: "color-mix(in srgb, var(--bg) 80%, transparent)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ background: "var(--accent-muted)" }}
              >
                <Mail className="size-4" style={{ color: "var(--accent)" }} />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                Corsair
              </span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              {["Features", "AI Workflows", "Pricing", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-xs font-medium transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex size-8 items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <Link
                href="/signin"
                className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200"
                style={{
                  background: "var(--accent)",
                  color: "var(--text-inverse)",
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: "var(--accent-muted)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <Sparkles className="size-3.5" style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--accent)" }}
          >
            Your AI Employee for Email & Calendar
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl text-center"
          style={{
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            color: "var(--text)",
          }}
        >
          Work Happens.
          <br />
          <span style={{ color: "var(--accent)" }}>Your Inbox</span>{" "}
          Doesn&apos;t Have To.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 max-w-lg text-center text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Connect Gmail and Calendar. Describe what you want in plain language.
          Corsair executes the work and waits for your approval.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex items-center gap-4"
        >
          <Link
            href="/signup"
            className="flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-200"
            style={{
              background: "var(--accent)",
              color: "var(--text-inverse)",
            }}
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
          <button
            className="flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Watch Demo
          </button>
        </motion.div>

        {/* Floating Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="relative mt-20 h-[400px] w-full max-w-5xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 h-[350px] w-[700px] -translate-x-1/2 overflow-hidden rounded-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="flex h-full">
              <div
                className="h-full w-48 p-3"
                style={{
                  background: "var(--bg-sidebar)",
                  borderRight: "1px solid var(--border)",
                }}
              >
                <div className="mb-4 flex items-center gap-2 px-2">
                  <div
                    className="size-5 rounded"
                    style={{ background: "var(--accent-muted)" }}
                  />
                  <div
                    className="h-3 w-16 rounded"
                    style={{ background: "var(--bg-secondary)" }}
                  />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5"
                    style={{
                      background:
                        i === 1 ? "var(--accent-muted)" : "transparent",
                    }}
                  >
                    <div
                      className="size-3 rounded"
                      style={{
                        background:
                          i === 1 ? "var(--accent)" : "var(--bg-secondary)",
                      }}
                    />
                    <div
                      className="h-2.5 rounded"
                      style={{
                        width: `${40 + i * 8}px`,
                        background:
                          i === 1 ? "var(--accent)" : "var(--bg-secondary)",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex-1 p-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2"
                    style={{
                      background:
                        i === 1 ? "var(--accent-muted)" : "transparent",
                    }}
                  >
                    <div
                      className="size-2 rounded-full"
                      style={{
                        background: i <= 2 ? "var(--accent)" : "transparent",
                      }}
                    />
                    <div
                      className="h-2.5 w-24 rounded"
                      style={{ background: "var(--bg-secondary)" }}
                    />
                    <div
                      className="h-2.5 flex-1 rounded"
                      style={{
                        background: "var(--bg-secondary)",
                        opacity: 0.5,
                      }}
                    />
                    <div
                      className="h-2 w-10 rounded"
                      style={{
                        background: "var(--bg-secondary)",
                        opacity: 0.3,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 1, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute top-16 right-8 w-64 rounded-2xl p-4"
            style={{
              background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles
                className="size-3.5"
                style={{ color: "var(--accent)" }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--accent)" }}
              >
                AI Draft
              </span>
            </div>
            <div className="space-y-2">
              <div
                className="h-2 w-full rounded"
                style={{ background: "var(--bg-secondary)" }}
              />
              <div
                className="h-2 w-3/4 rounded"
                style={{ background: "var(--bg-secondary)" }}
              />
              <div
                className="h-2 w-5/6 rounded"
                style={{ background: "var(--bg-secondary)" }}
              />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -1, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-0 left-8 w-56 rounded-2xl p-4"
            style={{
              background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="size-3.5" style={{ color: "#4B8CFF" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text)" }}
              >
                Today
              </span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div
                  className="size-2 rounded"
                  style={{ background: "#4B8CFF", opacity: 0.5 }}
                />
                <div
                  className="h-2 flex-1 rounded"
                  style={{ background: "var(--bg-secondary)" }}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* AI Workflows */}
      <section id="ai-workflows" className="relative px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span
              className="mb-4 block text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              AI Workflows
            </span>
            <h2
              className="mb-4 text-4xl font-bold"
              style={{ color: "var(--text)", letterSpacing: "-0.03em" }}
            >
              Just tell it what to do.
            </h2>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Natural language in. Intelligent action out.
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                prompt: '"Reply politely to Sarah about the proposal"',
                steps: [
                  "AI reads the thread",
                  "Drafts a contextual reply",
                  "You approve",
                  "Email sent",
                ],
              },
              {
                prompt: '"Schedule a meeting next Thursday at 2pm"',
                steps: [
                  "AI checks your calendar",
                  "Finds an open slot",
                  "Creates the event",
                  "Sends invites",
                ],
              },
              {
                prompt: '"Summarize my inbox and flag urgent items"',
                steps: [
                  "AI scans all threads",
                  "Generates summaries",
                  "Prioritizes by urgency",
                  "Shows highlights",
                ],
              },
            ].map((workflow, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <MessageSquare
                    className="size-4"
                    style={{ color: "var(--accent)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--accent)" }}
                  >
                    {workflow.prompt}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {workflow.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      <span
                        className="rounded-full px-3 py-1.5 text-xs font-medium"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {step}
                      </span>
                      {i < workflow.steps.length - 1 && (
                        <ChevronRight
                          className="size-3"
                          style={{ color: "var(--text-tertiary)" }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span
              className="mb-4 block text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Features
            </span>
            <h2
              className="mb-4 text-4xl font-bold"
              style={{ color: "var(--text)", letterSpacing: "-0.03em" }}
            >
              Everything you need.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                icon: Sparkles,
                title: "AI Drafting",
                desc: "Draft emails in seconds with contextual AI that understands your tone and intent.",
                color: "var(--accent)",
              },
              {
                icon: Calendar,
                title: "Calendar Agent",
                desc: "Schedule meetings, check availability, and manage events with natural language.",
                color: "#4B8CFF",
              },
              {
                icon: Mail,
                title: "Inbox Summary",
                desc: "Get instant bullet-point summaries of any email thread. Never read long chains again.",
                color: "#725BFF",
              },
              {
                icon: Search,
                title: "Natural Language Search",
                desc: "Find anything across emails and events by describing what you're looking for.",
                color: "var(--accent)",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-default rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "color-mix(in srgb, " +
                    feature.color +
                    " 30%, transparent)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px color-mix(in srgb, " +
                    feature.color +
                    " 10%, transparent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="mb-4 flex size-10 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, " +
                      feature.color +
                      " 12%, transparent)",
                  }}
                >
                  <feature.icon
                    className="size-5"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3
                  className="mb-2 text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="mb-6 text-4xl font-bold"
              style={{ color: "var(--text)", letterSpacing: "-0.03em" }}
            >
              Ready to let AI
              <br />
              <span style={{ color: "var(--accent)" }}>handle your inbox?</span>
            </h2>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "var(--text-inverse)",
              }}
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-12"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4" style={{ color: "var(--accent)" }} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Corsair
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            © 2026 Corsair. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
