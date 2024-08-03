CREATE SCHEMA IF NOT EXISTS "plaaaner";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plaaaner"."joinType" AS ENUM('request', 'invite');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plaaaner"."plans_status" AS ENUM('published', 'draft', 'hidden');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plaaaner"."post_status" AS ENUM('published', 'draft', 'hidden');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plaaaner"."currency" AS ENUM('FREE', 'USD', 'EUR', 'CHF', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plaaaner"."ticket_shape" AS ENUM('default', 'default-1', 'default-2', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plaaaner"."ticketPaymentType" AS ENUM('FREE', 'PAID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"access_token" text,
	"workspace_id" varchar,
	"organization_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."users" (
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."organizations" (
	"name" text NOT NULL,
	"owner" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."organizations_joins" (
	"organization_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "plaaaner"."joinType" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."organizations_ticket_types" (
	"organization_id" varchar NOT NULL,
	"ticket_type_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."users_organizations" (
	"organization_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces" (
	"name" text NOT NULL,
	"owner" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces_organizations" (
	"organization_id" varchar NOT NULL,
	"workspace_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workspaces_organizations_workspace_id_organization_id_pk" PRIMARY KEY("workspace_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces_plans" (
	"workspace_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workspaces_plans_workspace_id_plan_id_pk" PRIMARY KEY("workspace_id","plan_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces_posts" (
	"workspace_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workspaces_posts_workspace_id_post_id_pk" PRIMARY KEY("workspace_id","post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."users_workspaces" (
	"user_id" varchar NOT NULL,
	"workspace_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_workspaces_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plans" (
	"name" text NOT NULL,
	"description" text,
	"plan_type_id" varchar,
	"owner" varchar NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"location" jsonb DEFAULT '{"location_type":"other","details":""}'::jsonb NOT NULL,
	"status" "plaaaner"."plans_status" DEFAULT 'published' NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_tickets" (
	"ticket_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_tickets_ticket_id_plan_id_pk" PRIMARY KEY("ticket_id","plan_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_types" (
	"name" text NOT NULL,
	"description" text,
	"owner" varchar,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_comments" (
	"plan_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"comment" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_comments_mentions" (
	"plan_id" varchar NOT NULL,
	"comment_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "plan_comments_mentions_user_id_plan_id_comment_id_pk" PRIMARY KEY("user_id","plan_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_times" (
	"owner_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_participants" (
	"participant_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."posts" (
	"content" text NOT NULL,
	"owner" varchar NOT NULL,
	"status" "plaaaner"."post_status" DEFAULT 'published' NOT NULL,
	"location" json,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."post_comments" (
	"post_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"comment" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."post_comments_mentions" (
	"post_id" varchar NOT NULL,
	"comment_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "post_comments_mentions_user_id_post_id_comment_id_pk" PRIMARY KEY("user_id","post_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."tickets" (
	"name" text NOT NULL,
	"ticket_type_id" varchar NOT NULL,
	"owner" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"price" numeric(2) NOT NULL,
	"currency" "plaaaner"."currency" NOT NULL,
	"quantity" integer NOT NULL,
	"ticket_shape" "plaaaner"."ticket_shape" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."ticket_types" (
	"name" text NOT NULL,
	"description" text,
	"owner" varchar,
	"payment_type" "plaaaner"."ticketPaymentType" DEFAULT 'FREE' NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."websockets" (
	"user_id" varchar,
	"connection_id" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."user_dismissed_organization_notifications" (
	"notification_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"dismissed_at" timestamp with time zone,
	CONSTRAINT "user_dismissed_organization_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."user_dismissed_system_notifications" (
	"notification_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"dismissed_at" timestamp with time zone,
	CONSTRAINT "user_dismissed_system_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."user_dismissed_workspace_notifications" (
	"notification_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"dismissed_at" timestamp with time zone,
	CONSTRAINT "user_dismissed_workspace_notifications_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."system_notifications" (
	"title" text NOT NULL,
	"content" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."organizations_notifications" (
	"organization_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."workspaces_notifications" (
	"workspace_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."plan_comment_mention_notifications" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" varchar NOT NULL,
	"comment_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	CONSTRAINT "plan_comment_mention_notifications_user_id_plan_id_comment_id_pk" PRIMARY KEY("user_id","plan_id","comment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plaaaner"."post_comment_mention_notifications" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" varchar NOT NULL,
	"comment_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	CONSTRAINT "post_comment_mention_notifications_user_id_post_id_comment_id_pk" PRIMARY KEY("user_id","post_id","comment_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations" ADD CONSTRAINT "organizations_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_joins" ADD CONSTRAINT "organizations_joins_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_joins" ADD CONSTRAINT "organizations_joins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_ticket_types" ADD CONSTRAINT "organizations_ticket_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_ticket_types" ADD CONSTRAINT "organizations_ticket_types_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "plaaaner"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."users_organizations" ADD CONSTRAINT "users_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."users_organizations" ADD CONSTRAINT "users_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces" ADD CONSTRAINT "workspaces_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_organizations" ADD CONSTRAINT "workspaces_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_organizations" ADD CONSTRAINT "workspaces_organizations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "plaaaner"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_plans" ADD CONSTRAINT "workspaces_plans_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "plaaaner"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_plans" ADD CONSTRAINT "workspaces_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_posts" ADD CONSTRAINT "workspaces_posts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "plaaaner"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."workspaces_posts" ADD CONSTRAINT "workspaces_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "plaaaner"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."users_workspaces" ADD CONSTRAINT "users_workspaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."users_workspaces" ADD CONSTRAINT "users_workspaces_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "plaaaner"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plans" ADD CONSTRAINT "plans_plan_type_id_plan_types_id_fk" FOREIGN KEY ("plan_type_id") REFERENCES "plaaaner"."plan_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plans" ADD CONSTRAINT "plans_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_tickets" ADD CONSTRAINT "plan_tickets_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "plaaaner"."tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_tickets" ADD CONSTRAINT "plan_tickets_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_types" ADD CONSTRAINT "plan_types_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comments" ADD CONSTRAINT "plan_comments_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comments" ADD CONSTRAINT "plan_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comments_mentions" ADD CONSTRAINT "plan_comments_mentions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comments_mentions" ADD CONSTRAINT "plan_comments_mentions_comment_id_plan_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "plaaaner"."plan_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comments_mentions" ADD CONSTRAINT "plan_comments_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_times" ADD CONSTRAINT "plan_times_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_times" ADD CONSTRAINT "plan_times_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_participants" ADD CONSTRAINT "plan_participants_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_participants" ADD CONSTRAINT "plan_participants_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."posts" ADD CONSTRAINT "posts_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "plaaaner"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comments_mentions" ADD CONSTRAINT "post_comments_mentions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "plaaaner"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comments_mentions" ADD CONSTRAINT "post_comments_mentions_comment_id_plan_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "plaaaner"."plan_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comments_mentions" ADD CONSTRAINT "post_comments_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "plaaaner"."tickets" ADD CONSTRAINT "tickets_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."tickets" ADD CONSTRAINT "tickets_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."ticket_types" ADD CONSTRAINT "ticket_types_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."websockets" ADD CONSTRAINT "websockets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
 ALTER TABLE "plaaaner"."user_dismissed_system_notifications" ADD CONSTRAINT "user_dismissed_system_notifications_notification_id_system_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "plaaaner"."system_notifications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."user_dismissed_system_notifications" ADD CONSTRAINT "user_dismissed_system_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE cascade ON UPDATE no action;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."organizations_notifications" ADD CONSTRAINT "organizations_notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "plaaaner"."organizations"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "plaaaner"."plan_comment_mention_notifications" ADD CONSTRAINT "plan_comment_mention_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comment_mention_notifications" ADD CONSTRAINT "plan_comment_mention_notifications_comment_id_plan_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "plaaaner"."plan_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."plan_comment_mention_notifications" ADD CONSTRAINT "plan_comment_mention_notifications_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "plaaaner"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comment_mention_notifications" ADD CONSTRAINT "post_comment_mention_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "plaaaner"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comment_mention_notifications" ADD CONSTRAINT "post_comment_mention_notifications_comment_id_plan_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "plaaaner"."plan_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plaaaner"."post_comment_mention_notifications" ADD CONSTRAINT "post_comment_mention_notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "plaaaner"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
