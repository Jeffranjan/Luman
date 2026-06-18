import "dotenv/config";
import { conn } from "./src/server/db/index";
import fs from "fs";
import path from "path";

async function main() {
    try {
        console.log("Dropping partial tables...");
        await conn`DROP TABLE IF EXISTS "activity_feed" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "attachments" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "emails" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "email_threads" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "events" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "search_index" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "user_preferences" CASCADE;`;
        await conn`DROP TABLE IF EXISTS "user" CASCADE;`;

        console.log("Creating vector extension...");
        await conn`CREATE EXTENSION IF NOT EXISTS vector;`;

        console.log("Removing failed migration tracking...");
        await conn`DELETE FROM "__drizzle_migrations" WHERE id >= 2;`;

        console.log("Cleaning up local migration files...");
        const drizzleDir = path.join(process.cwd(), "drizzle");
        const metaFile = path.join(drizzleDir, "meta", "_journal.json");
        
        // Remove 0002, 0003, 0004
        const files = fs.readdirSync(drizzleDir);
        for (const file of files) {
            if (file.startsWith("0002") || file.startsWith("0003") || file.startsWith("0004")) {
                fs.unlinkSync(path.join(drizzleDir, file));
            }
        }

        // Clean meta journal
        if (fs.existsSync(metaFile)) {
            const journal = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
            journal.entries = journal.entries.filter((e: any) => e.idx < 2);
            fs.writeFileSync(metaFile, JSON.stringify(journal, null, 2));
        }

        console.log("Done.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

main();
