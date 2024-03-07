ALTER TABLE "plaaaner"."users_organizations" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_organizations" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_organizations" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_organizations" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "plaaaner"."users_organizations" ADD CONSTRAINT "users_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id");
