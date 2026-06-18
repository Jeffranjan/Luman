import { corsair } from "~/server/corsair";
import { processWebhook } from "corsair";

export async function POST(req: Request) {
  const body = await req.text();
  // Next.js headers API returns a Headers object, we convert it to a standard Record<string, string>
  const headers = Object.fromEntries(req.headers.entries());
  
  // Search params
  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());

  // Force the tenantId to "Ranjan" since Google Pub/Sub doesn't automatically include it in the Push URL
  query.tenantId = "Ranjan";

  try {
    const result = await processWebhook(corsair, headers, body, query);
    
    // Some plugins require a specific response for webhook challenges
    if (result.response) {
      return new Response(JSON.stringify(result.response.body || {}), { 
        status: result.response.success ? 200 : 400 
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return new Response(error.message, { status: 400 });
  }
}