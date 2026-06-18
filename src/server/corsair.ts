import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { conn } from "./db";
import { env } from "~/env";

export const corsair = createCorsair({
  plugins: [
    gmail({
      // Sync last 30 days of emails
      sync: {
        messages: {
          maxHistory: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
      },
    }) as any,
    googlecalendar({
      // Sync past 90 days, future 365 days
      sync: {
        events: {
          past: 90 * 24 * 60 * 60 * 1000,
          future: 365 * 24 * 60 * 60 * 1000,
        },
      },
    }) as any,
  ],
  database: conn,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});
