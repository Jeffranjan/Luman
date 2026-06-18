import { corsair } from "~/server/corsair";
import { toNextJsHandler } from "corsair";

// Export standard Next.js App Router handlers
export const { GET, POST } = toNextJsHandler(corsair);

// https://unrepellable-unmurmurously-lavon.ngrok-free.dev/api/webhooks