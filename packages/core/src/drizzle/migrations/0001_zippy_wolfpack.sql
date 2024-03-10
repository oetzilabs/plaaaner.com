ALTER TYPE "currency" ADD VALUE 'FREE';--> statement-breakpoint
ALTER TABLE "plaaaner"."plan_times" ADD COLUMN "owner_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_times" ADD CONSTRAINT "plan_times_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
