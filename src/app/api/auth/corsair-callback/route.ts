import { processOAuthCallback } from "corsair/oauth";
import { corsair } from "~/server/corsair";
import { NextResponse } from "next/server";

const REDIRECT_URI = `${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/corsair-callback`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Always clear the cookie on every exit path
  const clearCookieHeader = "oauth_state=; HttpOnly; Path=/; Max-Age=0";

  if (error) {
    return new NextResponse(
      `<html><body><h2>Authorization failed</h2><p>${escapeHtml(error)}</p><p><a href="/integrations">Back to Integrations</a></p></body></html>`,
      {
        status: 400,
        headers: {
          "Set-Cookie": clearCookieHeader,
          "Content-Type": "text/html",
        },
      },
    );
  }

  if (!code || !state) {
    return new NextResponse(
      "<html><body><p>Missing code or state.</p><p><a href='/integrations'>Back to Integrations</a></p></body></html>",
      {
        status: 400,
        headers: {
          "Set-Cookie": clearCookieHeader,
          "Content-Type": "text/html",
        },
      },
    );
  }

  // Verify state cookie matches
  const cookieHeader = request.headers.get("cookie") ?? "";
  const storedState = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("oauth_state="))
    ?.split("=")[1];

  if (!storedState || storedState !== state) {
    return new NextResponse(
      "<html><body><p>Invalid state. Possible CSRF attempt.</p><p><a href='/integrations'>Back to Integrations</a></p></body></html>",
      {
        status: 400,
        headers: {
          "Set-Cookie": clearCookieHeader,
          "Content-Type": "text/html",
        },
      },
    );
  }

  try {
    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: REDIRECT_URI,
    });

    // Redirect to integrations page on success
    const response = NextResponse.redirect(
      new URL("/integrations", request.url),
    );
    response.headers.set("Set-Cookie", clearCookieHeader);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `<html><body><h2>OAuth error</h2><p>${escapeHtml(message)}</p><p><a href="/integrations">Back to Integrations</a></p></body></html>`,
      {
        status: 500,
        headers: {
          "Set-Cookie": clearCookieHeader,
          "Content-Type": "text/html",
        },
      },
    );
  }
}
