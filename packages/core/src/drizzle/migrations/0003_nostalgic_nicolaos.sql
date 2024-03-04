CREATE TABLE IF NOT EXISTS "plaaaner"."notification_mentions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	CONSTRAINT "notification_mentions_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
ALTER TABLE "plaaaner"."notifications" DROP CONSTRAINT "notifications_notification_type_id_notification_types_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."notifications" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "plaaaner"."notifications" DROP COLUMN IF EXISTS "notification_type_id";--> statement-breakpoint
ALTER TABLE "plaaaner"."notifications" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."notification_mentions" ADD CONSTRAINT "notification_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."notification_mentions" ADD CONSTRAINT "notification_mentions_notification_id_users_id_fk" FOREIGN KEY ("notification_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
