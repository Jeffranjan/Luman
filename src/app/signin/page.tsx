"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Mail, Loader2 } from "lucide-react";
import { authClient } from "~/server/better-auth/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSocial = async (provider: "github" | "google") => {
    setLoading(provider);
    setError("");
    await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setError("");
    const { error: authError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (authError) setError(authError.message ?? "Login failed");
    setLoading(null);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full opacity-[0.1] blur-[120px]"
          style={{ background: "#725BFF" }}
        />
        <div
          className="absolute right-1/3 bottom-1/3 h-[300px] w-[300px] rounded-full opacity-[0.08] blur-[100px]"
          style={{ background: "var(--accent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: "color-mix(in srgb, var(--bg-card) 80%, transparent)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
              style={{ background: "var(--accent-muted)" }}
            >
              <Mail className="size-6" style={{ color: "var(--accent)" }} />
            </div>
            <h1
              className="mb-1 text-xl font-bold"
              style={{ color: "var(--text)" }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Sign in to your Corsair account
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <button
              onClick={() => handleSocial("github")}
              disabled={loading !== null}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-full text-sm font-medium transition-colors"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              {loading === "github" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              Continue with GitHub
            </button>
            <button
              onClick={() => handleSocial("google")}
              disabled={loading !== null}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-full text-sm font-medium transition-colors"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              {loading === "google" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: "1px solid var(--border)" }}
              />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-3"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-tertiary)",
                }}
              >
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-full px-4 text-sm outline-none"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 w-full rounded-full px-4 text-sm outline-none"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            />
            {error && (
              <p
                className="text-center text-xs"
                style={{ color: "var(--danger)" }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading !== null}
              className="h-11 w-full rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "var(--text-inverse)",
              }}
            >
              {loading === "email" ? (
                <Loader2 className="mx-auto size-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p
            className="mt-6 text-center text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium"
              style={{ color: "var(--accent)" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
