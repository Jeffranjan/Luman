import { setupCorsair } from "corsair";
import { corsair } from "./corsair";
import { db } from "./db";
import { corsairAccounts, users } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Resolve the Corsair tenant ID for a given user.
 * The CLI may have used the user's display name (e.g., "Ranjan") as the tenant ID,
 * while the OAuth flow uses the Better Auth user ID.
 * Returns the tenant with actual tokens, then falls back to first with accounts.
 */
export async function resolveCorsairTenantId(userId: string): Promise<string> {
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Build list of possible tenant IDs
  const possibleIds: string[] = [];
  if (user?.name) {
    const firstName = user.name.split(" ")[0];
    if (firstName) possibleIds.push(firstName);
    if (user.name !== firstName) possibleIds.push(user.name);
  }
  possibleIds.push(userId);

  // First pass: find a tenant with actual tokens (non-empty config)
  for (const tid of possibleIds) {
    const accounts = await db
      .select({ config: corsairAccounts.config })
      .from(corsairAccounts)
      .where(eq(corsairAccounts.tenantId, tid));

    const hasTokens = accounts.some((a: any) => {
      const cfg = a.config as any;
      return cfg && Object.keys(cfg).length > 0 && cfg.access_token;
    });

    if (hasTokens) return tid;
  }

  // Second pass: return first tenant that has any accounts
  for (const tid of possibleIds) {
    const existing = await db
      .select({ id: corsairAccounts.id })
      .from(corsairAccounts)
      .where(eq(corsairAccounts.tenantId, tid))
      .limit(1);

    if (existing.length > 0) return tid;
  }

  return userId;
}

/**
 * Ensure a Corsair tenant exists for the given user.
 * Idempotent — skips if account rows already exist.
 */
export async function ensureTenant(userId: string) {
  const tenantId = await resolveCorsairTenantId(userId);

  // Check if tenant already provisioned
  const existing = await db
    .select({ id: corsairAccounts.id })
    .from(corsairAccounts)
    .where(eq(corsairAccounts.tenantId, tenantId))
    .limit(1);

  if (existing.length > 0) return;

  // Provision tenant — creates account rows + DEKs
  await setupCorsair(corsair, { tenantId });
}

/**
 * Get a Corsair tenant handle for direct execution.
 * Resolves the correct tenant ID (handles CLI vs OAuth mismatch).
 */
export async function getTenant(userId: string) {
  const tenantId = await resolveCorsairTenantId(userId);
  return corsair.withTenant(tenantId);
}
