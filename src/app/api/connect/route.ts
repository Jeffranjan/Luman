import { generateOAuthUrl } from "corsair/oauth";
import { corsair } from "~/server/corsair";
import { getSession } from "~/server/better-auth/server";
import { ensureTenant, resolveCorsairTenantId } from "~/server/corsair-tenant";
import { NextResponse } from "next/server";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/corsair/callback`;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const plugin = searchParams.get("plugin");
  if (!plugin) {
    return NextResponse.json(
      { error: "Missing plugin param" },
      { status: 400 },
    );
  }

  // Resolve the correct Corsair tenant ID (handles CLI vs OAuth mismatch)
  const tenantId = await resolveCorsairTenantId(session.user.id);

  // Ensure tenant exists before initiating OAuth
  await ensureTenant(session.user.id);

  const { url } = await generateOAuthUrl(corsair, plugin, {
    tenantId,
    redirectUri: REDIRECT_URI,
  });

  return NextResponse.redirect(url);
}
