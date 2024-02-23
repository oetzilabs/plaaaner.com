ALTER TABLE "plaaaner"."organizations" ALTER COLUMN "owner" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plaaaner"."users_organizations" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plaaaner"."users_organizations" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plaaaner"."workspaces" ALTER COLUMN "owner" SET NOT NULL;