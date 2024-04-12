DO $$ BEGIN
 CREATE TYPE "post_status" AS ENUM('published', 'draft', 'hidden');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "plaaaner"."posts" ADD COLUMN "status" "post_status" DEFAULT 'published' NOT NULL;