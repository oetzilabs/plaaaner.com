ALTER TABLE "plaaaner"."plan_comments" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comments" ADD CONSTRAINT "plan_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
