import postgres from "postgres";
import { config } from "dotenv";

config();

const conn = postgres(
  process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/t3_corsair",
);

async function main() {
  try {
    console.log("Adding ai_summary column to email_threads...");
    await conn`ALTER TABLE email_threads ADD COLUMN IF NOT EXISTS ai_summary TEXT`;
    console.log("✅ Column added successfully");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("ℹ️ Column already exists");
    } else {
      console.error("❌ Error:", e.message);
    }
  }
  await conn.end();
  process.exit(0);
}

main();
