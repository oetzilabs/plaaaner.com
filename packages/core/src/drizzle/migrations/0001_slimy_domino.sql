DO $$ BEGIN
 CREATE TYPE "notification_status" AS ENUM('READ', 'UNREAD', 'SKIPPED', 'MUTED', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."organizations_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"organization_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"workspace_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"summary" text,
	"notification_type_id" uuid NOT NULL,
	"reference_id" uuid,
	"status" "notification_status" DEFAULT 'UNREAD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."notification_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"description" text,
	"owner" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_notifications" ADD CONSTRAINT "organizations_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_notifications" ADD CONSTRAINT "organizations_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "plaaaner"."notifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_notifications" ADD CONSTRAINT "workspaces_notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "plaaaner"."workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_notifications" ADD CONSTRAINT "workspaces_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "plaaaner"."notifications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."notifications" ADD CONSTRAINT "notifications_notification_type_id_notification_types_id_fk" FOREIGN KEY ("notification_type_id") REFERENCES "plaaaner"."notification_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."notification_types" ADD CONSTRAINT "notification_types_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
