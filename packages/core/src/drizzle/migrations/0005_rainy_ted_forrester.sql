DO $$ BEGIN
 CREATE TYPE "plans_status" AS ENUM('published', 'draft', 'hidden');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "plaaaner"."plans" ADD COLUMN "status" "plans_status" DEFAULT 'published' NOT NULL;