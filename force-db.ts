import "dotenv/config";
import { conn } from "./src/server/db/index";

async function main() {
    try {
        console.log("Forcing DB schema creation...");

        await conn`CREATE EXTENSION IF NOT EXISTS vector;`;

        await conn`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" text PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "email" text NOT NULL UNIQUE,
                "emailVerified" boolean NOT NULL,
                "image" text,
                "createdAt" timestamp NOT NULL DEFAULT now(),
                "updatedAt" timestamp NOT NULL DEFAULT now()
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "session" (
                "id" text PRIMARY KEY NOT NULL,
                "expiresAt" timestamp NOT NULL,
                "ipAddress" text,
                "userAgent" text,
                "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "createdAt" timestamp NOT NULL DEFAULT now(),
                "updatedAt" timestamp NOT NULL DEFAULT now()
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "account" (
                "id" text PRIMARY KEY NOT NULL,
                "accountId" text NOT NULL,
                "providerId" text NOT NULL,
                "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "accessToken" text,
                "refreshToken" text,
                "idToken" text,
                "expiresAt" timestamp,
                "password" text,
                "createdAt" timestamp NOT NULL DEFAULT now(),
                "updatedAt" timestamp NOT NULL DEFAULT now()
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "verification" (
                "id" text PRIMARY KEY NOT NULL,
                "identifier" text NOT NULL,
                "value" text NOT NULL,
                "expiresAt" timestamp NOT NULL,
                "createdAt" timestamp NOT NULL DEFAULT now(),
                "updatedAt" timestamp NOT NULL DEFAULT now()
            );
        `;


        await conn`
            CREATE TABLE IF NOT EXISTS "user_preferences" (
                "user_id" text PRIMARY KEY NOT NULL REFERENCES "user"("id") ON DELETE cascade,
                "theme" text DEFAULT 'system' NOT NULL,
                "keyboard_mode" text DEFAULT 'default' NOT NULL,
                "timezone" text DEFAULT 'UTC' NOT NULL
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "email_threads" (
                "thread_id" text PRIMARY KEY NOT NULL,
                "entity_id" text,
                "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
                "priority_score" text,
                "pinned" text DEFAULT 'false',
                "snoozed_until" timestamp with time zone,
                "archived_at" timestamp with time zone
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "emails" (
                "message_id" text PRIMARY KEY NOT NULL,
                "thread_id" text REFERENCES "email_threads"("thread_id") ON DELETE cascade,
                "entity_id" text,
                "ai_summary" text,
                "sentiment" text
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "attachments" (
                "id" text PRIMARY KEY NOT NULL,
                "email_id" text REFERENCES "emails"("message_id") ON DELETE cascade,
                "filename" text NOT NULL,
                "mime_type" text,
                "size" text
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "events" (
                "event_id" text PRIMARY KEY NOT NULL,
                "entity_id" text,
                "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
                "ai_summary" text,
                "meeting_notes" text,
                "priority" text
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "search_index" (
                "id" text PRIMARY KEY NOT NULL,
                "entity_type" text NOT NULL,
                "entity_id" text NOT NULL,
                "title" text,
                "content" text,
                "embedding" vector(1536),
                "metadata" jsonb DEFAULT '{}'::jsonb
            );
        `;

        await conn`
            CREATE TABLE IF NOT EXISTS "activity_feed" (
                "id" text PRIMARY KEY NOT NULL,
                "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
                "entity_type" text NOT NULL,
                "entity_id" text NOT NULL,
                "action" text NOT NULL,
                "created_at" timestamp with time zone DEFAULT now() NOT NULL
            );
        `;

        console.log("Database tables forced successfully.");
    } catch (e) {
        console.error("Force DB creation failed:", e);
    } finally {
        process.exit(0);
    }
}

main();
