import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { conn } from "./db";
import { env } from "~/env";

export const corsair = createCorsair({
  plugins: [gmail() as any, googlecalendar() as any],
  database: conn,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});
