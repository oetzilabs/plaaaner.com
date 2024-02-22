CREATE TABLE IF NOT EXISTS "plaaaner"."organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"owner" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."organizations_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"organization_id" uuid,
	"event_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"organization_id" uuid,
	"workspace_id" uuid
);
--> statement-breakpoint
ALTER TABLE "plaaaner"."session" DROP CONSTRAINT "session_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."workspaces" DROP CONSTRAINT "workspaces_owner_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."users_workspaces" DROP CONSTRAINT "users_workspaces_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."events" DROP CONSTRAINT "events_event_type_id_event_types_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."event_types" DROP CONSTRAINT "event_types_owner_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."event_participants" DROP CONSTRAINT "event_participants_participant_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."tickets" DROP CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk";
--> statement-breakpoint
ALTER TABLE "plaaaner"."ticket_types" DROP CONSTRAINT "ticket_types_owner_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces" ADD CONSTRAINT "workspaces_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."users_workspaces" ADD CONSTRAINT "users_workspaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."events" ADD CONSTRAINT "events_event_type_id_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "plaaaner"."event_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."event_types" ADD CONSTRAINT "event_types_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."event_participants" ADD CONSTRAINT "event_participants_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "plaaaner"."ticket_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."ticket_types" ADD CONSTRAINT "ticket_types_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations" ADD CONSTRAINT "organizations_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_events" ADD CONSTRAINT "organizations_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_events" ADD CONSTRAINT "organizations_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "plaaaner"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_organizations" ADD CONSTRAINT "workspaces_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_organizations" ADD CONSTRAINT "workspaces_organizations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "plaaaner"."workspaces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
