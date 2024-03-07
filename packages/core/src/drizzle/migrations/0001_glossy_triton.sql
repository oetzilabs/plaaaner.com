CREATE TABLE IF NOT EXISTS "plaaaner"."user_dismissed_organization_notifications" (
	"notification_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"dismissed_at" timestamp with time zone,
	CONSTRAINT "user_dismissed_organization_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."user_dismissed_workspace_notifications" (
	"notification_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"dismissed_at" timestamp with time zone,
	CONSTRAINT "user_dismissed_workspace_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
ALTER TABLE "plaaaner"."user_dismissed_system_notifications" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "plaaaner"."user_dismissed_system_notifications" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."user_dismissed_system_notifications" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."user_dismissed_system_notifications" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."user_dismissed_system_notifications" ADD CONSTRAINT "user_dismissed_system_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."user_dismissed_organization_notifications" ADD CONSTRAINT "user_dismissed_organization_notifications_notification_id_organizations_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "plaaaner"."organizations_notifications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."user_dismissed_organization_notifications" ADD CONSTRAINT "user_dismissed_organization_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."user_dismissed_workspace_notifications" ADD CONSTRAINT "user_dismissed_workspace_notifications_notification_id_workspaces_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "plaaaner"."workspaces_notifications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."user_dismissed_workspace_notifications" ADD CONSTRAINT "user_dismissed_workspace_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
