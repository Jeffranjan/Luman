ALTER TABLE "email_threads" DROP CONSTRAINT "email_threads_entity_id_corsair_entities_entity_id_fk";
--> statement-breakpoint
ALTER TABLE "emails" DROP CONSTRAINT "emails_entity_id_corsair_entities_entity_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_entity_id_corsair_entities_entity_id_fk";
