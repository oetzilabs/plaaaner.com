DO $$ BEGIN
 CREATE TYPE "ticketPaymentType" AS ENUM('FREE', 'PAID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."event_times" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"event_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plaaaner"."events" ADD COLUMN "starts_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "plaaaner"."events" ADD COLUMN "ends_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "plaaaner"."ticket_types" ADD COLUMN "payment_type" "ticketPaymentType" DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."event_times" ADD CONSTRAINT "event_times_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "plaaaner"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
