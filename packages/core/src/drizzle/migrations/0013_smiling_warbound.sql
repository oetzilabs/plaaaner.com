CREATE TABLE IF NOT EXISTS "plaaaner"."organizations_ticket_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"organization_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_ticket_types" ADD CONSTRAINT "organizations_ticket_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_ticket_types" ADD CONSTRAINT "organizations_ticket_types_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "plaaaner"."ticket_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
