import { processOAuthCallback } from "corsair/oauth";
import { corsair } from "~/server/corsair";
import { getSession } from "~/server/better-auth/server";
import { NextResponse } from "next/server";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/corsair/callback`;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", APP_URL));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<html><body><h2>Authorization failed</h2><p>${error}</p><p><a href="/integrations">Back to Integrations</a></p></body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  if (!code || !state) {
    return new NextResponse(
      "<html><body><p>Missing code or state.</p><p><a href='/integrations'>Back to Integrations</a></p></body></html>",
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  try {
    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: REDIRECT_URI,
    });

    return NextResponse.redirect(
      new URL(`/integrations?connected=${result.plugin}`, APP_URL),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `<html><body><h2>OAuth error</h2><p>${escapeHtml(message)}</p><p><a href="/integrations">Back to Integrations</a></p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } },
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
