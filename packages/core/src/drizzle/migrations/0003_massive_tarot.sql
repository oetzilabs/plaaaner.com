ALTER TABLE "plaaaner"."workspaces" ADD COLUMN "owner" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces" ADD CONSTRAINT "workspaces_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
