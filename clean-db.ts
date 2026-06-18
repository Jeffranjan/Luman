import "dotenv/config";
import { conn } from "./src/server/db/index";

async function main() {
    try {
        console.log("Removing failed migration tracking from DB...");
        // Handle Drizzle's default schema for migrations
        await conn`DELETE FROM drizzle.__drizzle_migrations WHERE id >= 2;`.catch(() => console.log("drizzle schema failed"));
        await conn`DELETE FROM public.__drizzle_migrations WHERE id >= 2;`.catch(() => console.log("public schema failed"));
        await conn`DELETE FROM __drizzle_migrations WHERE id >= 2;`.catch(() => console.log("default failed"));
        console.log("Done.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}

main();
