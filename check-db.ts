import postgres from "postgres";
import { config } from "dotenv";

config();

const conn = postgres(process.env.DATABASE_URL!);

async function main() {
  const deleted = await conn`DELETE FROM corsair_entities`;
  console.log(`Purged ${deleted.count} cached entities`);

  const deletedEvents = await conn`DELETE FROM corsair_events`;
  console.log(`Purged ${deletedEvents.count} cached events`);

  console.log("✅ Cache cleared. Refresh the Inbox to re-sync.");

  await conn.end();
  process.exit(0);
}

main();
